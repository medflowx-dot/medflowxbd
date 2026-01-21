import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Format phone number to Bangladesh format (880XXXXXXXXXX)
function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/\s+/g, "").replace(/-/g, "");
  
  // Remove leading + if present
  if (formatted.startsWith("+")) {
    formatted = formatted.substring(1);
  }
  
  // Handle different formats
  if (formatted.startsWith("0")) {
    formatted = "880" + formatted.substring(1);
  } else if (!formatted.startsWith("880")) {
    formatted = "880" + formatted;
  }
  
  return formatted;
}

// Validate Bangladesh phone number
function isValidBDPhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Bangladesh mobile numbers: 880 followed by 10 digits starting with 1
  const regex = /^8801[3-9][0-9]{8}$/;
  return regex.test(formatted);
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS via BulkSMSBD
async function sendSMS(phone: string, message: string, apiKey: string, senderId: string): Promise<boolean> {
  try {
    const response = await fetch("https://bulksmsbd.net/api/smsapi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        senderid: senderId,
        number: phone,
        message: message,
      }),
    });

    const result = await response.json();
    console.log("SMS API Response:", result);
    return result.response_code === 202 || result.response_code === "202";
  } catch (error) {
    console.error("SMS sending failed:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, purpose = "signup" } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone number
    if (!isValidBDPhone(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid Bangladesh phone number. Use format: 01XXXXXXXXX" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if phone already registered (for signup purpose)
    if (purpose === "signup") {
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("phone", formattedPhone)
        .eq("phone_verified", true)
        .single();

      if (existingProfile) {
        return new Response(
          JSON.stringify({ error: "This phone number is already registered" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check for recent OTP requests (rate limiting - max 3 per 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("phone_otp_verifications")
      .select("*", { count: "exact", head: true })
      .eq("phone", formattedPhone)
      .eq("purpose", purpose)
      .gte("created_at", tenMinutesAgo);

    if (count && count >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many OTP requests. Please wait 10 minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Store OTP in database
    const { error: insertError } = await supabaseAdmin
      .from("phone_otp_verifications")
      .insert({
        phone: formattedPhone,
        otp_code: otpCode,
        purpose,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get BulkSMSBD credentials from platform settings
    const { data: settings } = await supabaseAdmin
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["bulksmsbd_api_key", "bulksmsbd_sender_id", "bulksmsbd_enabled"]);

    const config: Record<string, string> = {};
    (settings || []).forEach((s: { setting_key: string; setting_value: string }) => {
      let value = s.setting_value;
      if (typeof value === "string") {
        value = value.replace(/^"|"$/g, "");
      }
      config[s.setting_key] = value;
    });

    const isEnabled = config.bulksmsbd_enabled === "true";
    const apiKey = config.bulksmsbd_api_key || Deno.env.get("BULKSMSBD_API_KEY") || "";
    const senderId = config.bulksmsbd_sender_id || Deno.env.get("BULKSMSBD_SENDER_ID") || "";

    if (!isEnabled && !apiKey) {
      console.log("BulkSMSBD not configured, OTP:", otpCode); // For testing
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated (SMS not configured)",
          // Remove this in production!
          debug_otp: otpCode 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via SMS
    const smsMessage = `আপনার MedFlowX OTP কোড: ${otpCode}। এই কোড ৫ মিনিট পর্যন্ত বৈধ। কারো সাথে শেয়ার করবেন না।`;
    const smsSent = await sendSMS(formattedPhone, smsMessage, apiKey, senderId);

    if (!smsSent) {
      return new Response(
        JSON.stringify({ error: "Failed to send OTP SMS. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully",
        phone: formattedPhone.substring(0, 6) + "****" + formattedPhone.substring(10)
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in send-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
