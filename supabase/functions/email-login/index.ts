import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

interface PlatformSetting {
  setting_key: string;
  setting_value: string;
}

// Background task to notify admin about account lockout
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function notifyAdminAboutLockout(
  supabaseAdmin: any,
  identifier: string,
  identifierType: string
) {
  try {
    // Get notification settings and admin contact info
    const { data: settings } = await supabaseAdmin
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "smtp_host", "smtp_port", "smtp_user", "smtp_password",
        "smtp_from_email", "smtp_from_name", "smtp_secure",
        "sms_alert_email", "bulksmsbd_enabled", "bulksmsbd_api_key", "bulksmsbd_sender_id",
        "admin_phone", "lockout_notifications_enabled"
      ]);

    const config: Record<string, string> = {};
    (settings as PlatformSetting[] | null)?.forEach((s) => {
      let value = s.setting_value;
      if (typeof value === "string") {
        value = value.replace(/^"|"$/g, "");
      }
      config[s.setting_key] = value;
    });

    // Check if notifications are enabled (default to true if not set)
    if (config.lockout_notifications_enabled === "false") {
      console.log("Lockout notifications disabled");
      return;
    }

    const adminEmail = config.sms_alert_email;
    const adminPhone = config.admin_phone;
    const now = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });

    // Send Email notification
    if (adminEmail && config.smtp_host && config.smtp_user && config.smtp_password) {
      try {
        const client = new SMTPClient({
          connection: {
            hostname: config.smtp_host,
            port: Number(config.smtp_port) || 587,
            tls: config.smtp_secure === "true",
            auth: {
              username: config.smtp_user,
              password: config.smtp_password,
            },
          },
        });

        const fromEmail = config.smtp_from_email || config.smtp_user;
        const fromName = config.smtp_from_name || "MedFlowX";

        await client.send({
          from: `${fromName} <${fromEmail}>`,
          to: adminEmail,
          subject: `🔒 Account Locked Alert - ${identifier}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🔒 Account Lockout Alert</h1>
              </div>
              <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="color: #374151; font-size: 16px;">An account has been locked due to multiple failed login attempts:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Identifier:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${identifier}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Type:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${identifierType === 'email' ? 'Email' : 'Phone'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Lock Duration:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #111827;">${LOCK_DURATION_MINUTES} minutes</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #6b7280;">Time:</td>
                    <td style="padding: 10px; color: #111827;">${now}</td>
                  </tr>
                </table>
                <p style="color: #6b7280; font-size: 14px;">You can manually unlock this account from the <a href="https://medflowxbd.lovable.app/owner/locked-accounts" style="color: #2563eb;">Locked Accounts</a> page in the Owner Admin panel.</p>
              </div>
            </div>
          `,
        });

        await client.close();
        console.log("Admin email notification sent for lockout:", identifier);
      } catch (emailError) {
        console.error("Failed to send admin email notification:", emailError);
      }
    }

    // Send SMS notification
    if (adminPhone && config.bulksmsbd_enabled === "true" && config.bulksmsbd_api_key) {
      try {
        const message = `🔒 MedFlowX Alert: Account locked - ${identifier} (${identifierType}). ${LOCK_DURATION_MINUTES} min lockout. Check admin panel.`;
        
        const smsUrl = `https://bulksmsbd.net/api/smsapi?api_key=${config.bulksmsbd_api_key}&type=text&number=${adminPhone}&senderid=${config.bulksmsbd_sender_id || 'MedFlowX'}&message=${encodeURIComponent(message)}`;
        
        const smsResponse = await fetch(smsUrl);
        const smsResult = await smsResponse.json();
        
        if (smsResult.response_code === 202) {
          console.log("Admin SMS notification sent for lockout:", identifier);
        } else {
          console.error("SMS send failed:", smsResult);
        }
      } catch (smsError) {
        console.error("Failed to send admin SMS notification:", smsError);
      }
    }

    // Log the notification - use raw SQL since we don't have types
    try {
      const { error: logError } = await supabaseAdmin
        .from("notification_logs")
        .insert({
          user_id: "00000000-0000-0000-0000-000000000000",
          notification_type: "account_lockout",
          channel: adminEmail ? "email" : "sms",
          status: "sent",
        } as Record<string, unknown>);
      
      if (logError) {
        console.log("Could not log notification:", logError.message);
      }
    } catch (logErr) {
      console.log("Notification log error:", logErr);
    }

  } catch (error) {
    console.error("Error in notifyAdminAboutLockout:", error);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if account is locked
    const { data: attemptData } = await supabaseAdmin
      .from("login_attempts")
      .select("*")
      .eq("identifier", normalizedEmail)
      .single();

    if (attemptData?.locked_until) {
      const lockedUntil = new Date(attemptData.locked_until);
      if (lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
        return new Response(
          JSON.stringify({ 
            error: `অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে। ${remainingMinutes} মিনিট পর আবার চেষ্টা করুন।`,
            locked: true,
            lockedUntil: attemptData.locked_until,
            remainingMinutes
          }),
          { status: 423, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Lock expired, reset attempts
        await supabaseAdmin
          .from("login_attempts")
          .update({ attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
          .eq("identifier", normalizedEmail);
      }
    }

    // Try to sign in with email and password
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      // Record failed attempt
      const currentAttempts = (attemptData?.attempts || 0) + 1;
      const shouldLock = currentAttempts >= MAX_ATTEMPTS;
      
      const updateData: Record<string, unknown> = {
        identifier: normalizedEmail,
        identifier_type: 'email',
        attempts: currentAttempts,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (shouldLock) {
        const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        updateData.locked_until = lockUntil.toISOString();
      }

      await supabaseAdmin
        .from("login_attempts")
        .upsert(updateData, { onConflict: 'identifier' });

      if (shouldLock) {
        // Send admin notification in background
        EdgeRuntime.waitUntil(notifyAdminAboutLockout(supabaseAdmin, normalizedEmail, 'email'));
        
        return new Response(
          JSON.stringify({ 
            error: `অনেক বার ভুল পাসওয়ার্ড দেওয়া হয়েছে। অ্যাকাউন্ট ${LOCK_DURATION_MINUTES} মিনিটের জন্য লক করা হয়েছে।`,
            locked: true,
            remainingMinutes: LOCK_DURATION_MINUTES
          }),
          { status: 423, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const attemptsRemaining = MAX_ATTEMPTS - currentAttempts;
      
      // Determine error message based on the error
      let errorMessage = `ভুল ইমেইল বা পাসওয়ার্ড। আর ${attemptsRemaining} বার চেষ্টা করতে পারবেন।`;
      if (signInError.message.includes("Invalid login credentials")) {
        errorMessage = `ভুল ইমেইল বা পাসওয়ার্ড। আর ${attemptsRemaining} বার চেষ্টা করতে পারবেন।`;
      } else if (signInError.message.includes("Email not confirmed")) {
        errorMessage = "ইমেইল এখনও ভেরিফাই হয়নি। অনুগ্রহ করে আপনার ইমেইল চেক করুন।";
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          attemptsRemaining
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Successful login - reset attempts
    if (attemptData) {
      await supabaseAdmin
        .from("login_attempts")
        .update({ attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
        .eq("identifier", normalizedEmail);
    }

    // Get user profile with must_change_password flag
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, pharmacy_name, must_change_password")
      .eq("user_id", signInData.user.id)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        session: signInData.session,
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
          fullName: profile?.full_name,
          pharmacyName: profile?.pharmacy_name,
        },
        mustChangePassword: profile?.must_change_password || false
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in email-login:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
