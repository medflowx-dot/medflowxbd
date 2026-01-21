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

    // Find user by phone number in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("phone", formattedPhone)
      .eq("phone_verified", true)
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
