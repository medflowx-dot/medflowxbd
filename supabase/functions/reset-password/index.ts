import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Format phone number to Bangladesh format (880XXXXXXXXXX)
function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/\s+/g, "").replace(/-/g, "");
  
  if (formatted.startsWith("+")) {
    formatted = formatted.substring(1);
  }
  
  if (formatted.startsWith("0")) {
    formatted = "880" + formatted.substring(1);
  } else if (!formatted.startsWith("880")) {
    formatted = "880" + formatted;
  }
  
  return formatted;
}

// Send password reset confirmation SMS
async function sendPasswordResetConfirmationSMS(
  supabaseAdmin: any,
  phone: string,
  userId: string
): Promise<void> {
  try {
    // Fetch SMS config and template from platform_settings
    const { data: settings } = await supabaseAdmin
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "bulksmsbd_enabled",
        "bulksmsbd_api_key",
        "bulksmsbd_sender_id",
        "sms_template_password_reset",
        "platform_name",
      ]);

    const config: Record<string, any> = {};
    (settings || []).forEach((s: any) => {
      let value = s.setting_value;
      if (typeof value === "string") {
        value = value.replace(/^"|"$/g, "");
      }
      config[s.setting_key] = value;
    });

    const smsEnabled = config.bulksmsbd_enabled === true || config.bulksmsbd_enabled === "true";
    const apiKey = config.bulksmsbd_api_key;
    const senderId = config.bulksmsbd_sender_id;
    const platformName = config.platform_name || "MedFlowX";

    if (!smsEnabled || !apiKey || !senderId) {
      console.log("SMS not enabled or not configured, skipping password reset confirmation SMS");
      return;
    }

    // Get user profile for pharmacy name
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("pharmacy_name, full_name")
      .eq("user_id", userId)
      .single();

    const pharmacyName = profile?.pharmacy_name || profile?.full_name || "প্রিয় গ্রাহক";

    // Get template or use default
    let smsMessage = config.sms_template_password_reset ||
      "{{pharmacy_name}}, আপনার MedFlowX পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। যদি আপনি এটি না করে থাকেন, অবিলম্বে সাপোর্টে যোগাযোগ করুন।";

    // Replace placeholders
    smsMessage = smsMessage
      .replace(/\{\{pharmacy_name\}\}/g, pharmacyName)
      .replace(/\{\{phone\}\}/g, phone)
      .replace(/\{\{platform_name\}\}/g, platformName);

    // Send SMS
    const response = await fetch("https://bulksmsbd.net/api/smsapi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        senderid: senderId,
        number: phone,
        message: smsMessage,
        type: "unicode",
      }),
    });

    const result = await response.json();
    console.log("Password reset confirmation SMS response:", result);
  } catch (error) {
    console.error("Error sending password reset confirmation SMS:", error);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, verificationToken, newPassword } = await req.json();

    if (!phone || !verificationToken || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Phone, verification token, and new password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the verification token (valid for 15 minutes after OTP verification)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("phone_otp_verifications")
      .select("*")
      .eq("phone", formattedPhone)
      .eq("otp_code", verificationToken)
      .eq("is_verified", true)
      .eq("purpose", "reset")
      .gte("verified_at", fifteenMinutesAgo)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification. Please start over." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find user by phone number in profiles (check both formats)
    const localFormat = formattedPhone.startsWith("880") 
      ? "0" + formattedPhone.substring(3) 
      : formattedPhone;
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("phone_verified", true)
      .or(`phone.eq.${formattedPhone},phone.eq.${localFormat}`)
      .limit(1)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "No account found with this phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update password" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete used OTP records
    await supabaseAdmin
      .from("phone_otp_verifications")
      .delete()
      .eq("phone", formattedPhone)
      .eq("purpose", "reset");

    // Also invalidate any active PINs (user should set up new PIN after password reset)
    await supabaseAdmin
      .from("user_pins")
      .update({ is_active: false })
      .eq("user_id", profile.user_id);

    // Send confirmation SMS (background task - don't block response)
    sendPasswordResetConfirmationSMS(supabaseAdmin, formattedPhone, profile.user_id).catch((err) => {
      console.error("Error sending password reset confirmation SMS:", err);
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset successfully. Please login with your new password."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in reset-password:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
