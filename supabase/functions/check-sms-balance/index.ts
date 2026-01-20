import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Check SMS balance from BulkSMSBD
async function checkBalance(apiKey: string): Promise<{ balance: number; currency: string } | null> {
  try {
    const response = await fetch(`https://bulksmsbd.net/api/getBalanceApi?api_key=${apiKey}`);
    const data = await response.json();
    
    if (data.balance !== undefined) {
      return {
        balance: parseFloat(data.balance),
        currency: data.currency || 'BDT'
      };
    }
    return null;
  } catch (error) {
    console.error("Balance check failed:", error);
    return null;
  }
}

// Send email alert via SMTP
async function sendEmailAlert(
  supabaseAdmin: any,
  to: string,
  balance: number,
  threshold: number,
  currency: string
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

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #DC2626; margin: 0 0 10px 0;">⚠️ Low SMS Balance Alert</h2>
          <p style="margin: 0; color: #7F1D1D;">আপনার BulkSMSBD অ্যাকাউন্টে SMS ব্যালেন্স কম আছে!</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 12px; border: 1px solid #E5E7EB; background-color: #F9FAFB;">
              <strong>বর্তমান ব্যালেন্স:</strong>
            </td>
            <td style="padding: 12px; border: 1px solid #E5E7EB; color: #DC2626; font-weight: bold; font-size: 18px;">
              ${balance} ${currency}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #E5E7EB; background-color: #F9FAFB;">
              <strong>Alert Threshold:</strong>
            </td>
            <td style="padding: 12px; border: 1px solid #E5E7EB;">
              ${threshold} ${currency}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #E5E7EB; background-color: #F9FAFB;">
              <strong>চেক করা হয়েছে:</strong>
            </td>
            <td style="padding: 12px; border: 1px solid #E5E7EB;">
              ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}
            </td>
          </tr>
        </table>

        <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400E;">
            <strong>পরামর্শ:</strong> নিরবচ্ছিন্ন SMS সেবা নিশ্চিত করতে দ্রুত রিচার্জ করুন।
          </p>
        </div>

        <p style="text-align: center; margin-top: 30px;">
          <a href="https://bulksmsbd.com" target="_blank" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            BulkSMSBD এ রিচার্জ করুন
          </a>
        </p>

        <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 30px;">
          এই email MedFlowX থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।
        </p>
      </div>
    `;

    await client.send({
      from: `${fromName} <${fromEmail}>`,
      to: to,
      subject: `⚠️ Low SMS Balance Alert - ${balance} ${currency}`,
      html: emailHtml,
    });

    await client.close();
    console.log("Alert email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
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

    console.log("Starting SMS balance check...");

    // Get BulkSMSBD and alert settings
    const { data: settings } = await supabaseAdmin
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "bulksmsbd_enabled", "bulksmsbd_api_key",
        "sms_low_balance_threshold", "sms_alert_email"
      ]);

    const config: Record<string, any> = {};
    (settings || []).forEach((s: any) => {
      let value = s.setting_value;
      if (typeof value === "string") {
        value = value.replace(/^"|"$/g, "");
      }
      config[s.setting_key] = value;
    });

    const isEnabled = config.bulksmsbd_enabled === true || config.bulksmsbd_enabled === "true";
    const apiKey = config.bulksmsbd_api_key || "";
    const threshold = parseFloat(config.sms_low_balance_threshold) || 100;
    const alertEmail = config.sms_alert_email || "";

    if (!isEnabled || !apiKey) {
      console.log("BulkSMSBD not enabled or API key not configured");
      return new Response(
        JSON.stringify({ success: false, message: "BulkSMSBD not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check balance
    const balanceData = await checkBalance(apiKey);
    
    if (!balanceData) {
      console.log("Failed to fetch balance");
      return new Response(
        JSON.stringify({ success: false, message: "Failed to fetch balance" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Current balance: ${balanceData.balance} ${balanceData.currency}, Threshold: ${threshold}`);

    // Check if balance is below threshold
    if (balanceData.balance <= threshold) {
      console.log("Balance is below threshold, sending alert...");
      
      if (alertEmail) {
        const emailSent = await sendEmailAlert(
          supabaseAdmin,
          alertEmail,
          balanceData.balance,
          threshold,
          balanceData.currency
        );

        // Log the alert
        await supabaseAdmin.from("notification_logs").insert({
          user_id: "00000000-0000-0000-0000-000000000000", // System user
          notification_type: "sms_balance_alert",
          channel: "email",
          status: emailSent ? "sent" : "failed",
        });

        return new Response(
          JSON.stringify({
            success: true,
            balance: balanceData.balance,
            threshold,
            alertSent: emailSent,
            message: emailSent ? "Low balance alert sent" : "Failed to send alert"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.log("No alert email configured");
        return new Response(
          JSON.stringify({
            success: true,
            balance: balanceData.balance,
            threshold,
            alertSent: false,
            message: "Low balance detected but no alert email configured"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        balance: balanceData.balance,
        threshold,
        alertSent: false,
        message: "Balance is above threshold"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in check-sms-balance:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
