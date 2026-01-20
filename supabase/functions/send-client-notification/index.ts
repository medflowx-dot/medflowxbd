import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Send SMS via BulkSMSBD
async function sendSMS(phone: string, message: string, smsConfig: { apiKey: string; senderId: string }): Promise<boolean> {
  const { apiKey, senderId } = smsConfig;

  if (!apiKey || !senderId) {
    console.log("BulkSMSBD credentials not configured, skipping SMS");
    return false;
  }

  let formattedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "880" + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith("880")) {
    formattedPhone = "880" + formattedPhone;
  }

  try {
    const response = await fetch("https://bulksmsbd.net/api/smsapi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        senderid: senderId,
        number: formattedPhone,
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

// Send email via SMTP
async function sendEmail(
  supabaseAdmin: any,
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const { data: settings } = await supabaseAdmin
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "smtp_host", "smtp_port", "smtp_user", "smtp_password",
        "smtp_from_email", "smtp_from_name", "smtp_secure",
      ]);

    if (!settings?.length) {
      console.error("SMTP settings not found");
      return false;
    }

    const smtpConfig: Record<string, any> = {};
    settings.forEach((s: any) => {
      let value = s.setting_value;
      if (typeof value === "string") {
        value = value.replace(/^"|"$/g, "");
      }
      smtpConfig[s.setting_key] = value;
    });

    if (!smtpConfig.smtp_host || !smtpConfig.smtp_user || !smtpConfig.smtp_password) {
      console.error("SMTP not fully configured");
      return false;
    }

    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.smtp_host,
        port: Number(smtpConfig.smtp_port) || 587,
        tls: smtpConfig.smtp_secure === true || smtpConfig.smtp_secure === "true",
        auth: {
          username: smtpConfig.smtp_user,
          password: smtpConfig.smtp_password,
        },
      },
    });

    const fromEmail = smtpConfig.smtp_from_email || smtpConfig.smtp_user;
    const fromName = smtpConfig.smtp_from_name || "MedFlowX";

    await client.send({
      from: `${fromName} <${fromEmail}>`,
      to: to,
      subject: subject,
      html: html,
    });

    await client.close();
    console.log("Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}

// Get SMS config from platform_settings
async function getSmsConfig(supabaseAdmin: any): Promise<{ apiKey: string; senderId: string; enabled: boolean }> {
  const { data: settings } = await supabaseAdmin
    .from("platform_settings")
    .select("setting_key, setting_value")
    .in("setting_key", ["bulksmsbd_enabled", "bulksmsbd_api_key", "bulksmsbd_sender_id"]);

  const config: Record<string, any> = {};
  (settings || []).forEach((s: any) => {
    let value = s.setting_value;
    if (typeof value === "string") {
      value = value.replace(/^"|"$/g, "");
    }
    config[s.setting_key] = value;
  });

  return {
    apiKey: config.bulksmsbd_api_key || "",
    senderId: config.bulksmsbd_sender_id || "",
    enabled: config.bulksmsbd_enabled === true || config.bulksmsbd_enabled === "true",
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { userId, channel = "both", testMode, testPhone, testMessage } = body;

    // Handle test SMS mode
    if (testMode && testPhone && testMessage) {
      console.log("Test SMS mode - sending to:", testPhone);
      const smsConfig = await getSmsConfig(supabaseAdmin);
      
      if (!smsConfig.enabled || !smsConfig.apiKey || !smsConfig.senderId) {
        throw new Error("BulkSMSBD is not configured or enabled");
      }

      const smsSent = await sendSMS(testPhone, testMessage, smsConfig);
      return new Response(
        JSON.stringify({ success: smsSent, message: smsSent ? "Test SMS sent" : "SMS sending failed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log(`Sending manual notification to user ${userId}, channel: ${channel}`);

    // Get SMS config
    const smsConfig = await getSmsConfig(supabaseAdmin);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("pharmacy_name, full_name, phone")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error("User profile not found");
    }

    // Fetch subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_type, status, current_period_end, trial_ends_at")
      .eq("user_id", userId)
      .single();

    if (subError) {
      console.error("Error fetching subscription:", subError);
      throw new Error("Subscription not found");
    }

    // Get user email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) {
      throw new Error("User email not found");
    }

    const pharmacyName = profile.pharmacy_name || profile.full_name || "প্রিয় গ্রাহক";
    const userEmail = userData.user.email;
    const userPhone = profile.phone;
    const billingUrl = "https://medflowxbd.lovable.app/billing";

    const planTypeNames: Record<string, string> = {
      trial: "ফ্রি ট্রায়াল",
      monthly: "মাসিক",
      yearly: "বার্ষিক",
      lifetime: "লাইফটাইম",
    };
    const planTypeName = planTypeNames[subscription.plan_type] || subscription.plan_type;

    // Calculate expiry
    let expiryDate: Date | null = null;
    if (subscription.plan_type === "trial" && subscription.trial_ends_at) {
      expiryDate = new Date(subscription.trial_ends_at);
    } else if (subscription.current_period_end) {
      expiryDate = new Date(subscription.current_period_end);
    }

    const expiryDateStr = expiryDate
      ? expiryDate.toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })
      : "N/A";

    const now = new Date();
    const daysUntilExpiry = expiryDate
      ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const results = { emailSent: false, smsSent: false };

    // Send Email
    if (channel === "both" || channel === "email") {
      const emailSubject = `${pharmacyName} - সাবস্ক্রিপশন রিমাইন্ডার`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">MedFlowX সাবস্ক্রিপশন রিমাইন্ডার</h2>
          <p>প্রিয় <strong>${pharmacyName}</strong>,</p>
          <p>আপনার <strong>${planTypeName}</strong> সাবস্ক্রিপশনের মেয়াদ <strong>${expiryDateStr}</strong> তারিখে শেষ হবে।</p>
          ${daysUntilExpiry > 0 ? `<p>বাকি আছে মাত্র <strong>${daysUntilExpiry} দিন</strong>।</p>` : ""}
          <p>সেবা নিরবচ্ছিন্ন রাখতে এখনই রিনিউ করুন।</p>
          <p style="margin-top: 20px;">
            <a href="${billingUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">এখনই রিনিউ করুন</a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">ধন্যবাদ,<br/>MedFlowX টিম</p>
        </div>
      `;

      results.emailSent = await sendEmail(supabaseAdmin, userEmail, emailSubject, emailHtml);

      // Log notification
      await supabaseAdmin.from("notification_logs").insert({
        user_id: userId,
        notification_type: "manual_reminder",
        channel: "email",
        days_before_expiry: daysUntilExpiry,
        status: results.emailSent ? "sent" : "failed",
      });
    }

    // Send SMS (only if BulkSMSBD is enabled and configured)
    if ((channel === "both" || channel === "sms") && userPhone && smsConfig.enabled && smsConfig.apiKey && smsConfig.senderId) {
      const smsMessage = `${pharmacyName}, আপনার MedFlowX ${planTypeName} সাবস্ক্রিপশন ${expiryDateStr} তারিখে শেষ হবে। রিনিউ করুন: ${billingUrl}`;
      results.smsSent = await sendSMS(userPhone, smsMessage, smsConfig);

      // Log notification
      await supabaseAdmin.from("notification_logs").insert({
        user_id: userId,
        notification_type: "manual_reminder",
        channel: "sms",
        days_before_expiry: daysUntilExpiry,
        status: results.smsSent ? "sent" : "failed",
      });
    }

    console.log("Manual notification results:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent",
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-client-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
