import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionWithUser {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_end: string | null;
  trial_ends_at: string | null;
  lifetime_service_due_date: string | null;
  profiles: {
    pharmacy_name: string | null;
    full_name: string | null;
    phone: string | null;
  } | null;
  user_email?: string;
}

// Plan type display names
const planTypeNames: Record<string, string> = {
  trial: "ফ্রি ট্রায়াল",
  monthly: "মাসিক",
  yearly: "বার্ষিক",
  lifetime: "লাইফটাইম",
};

// Send SMS via BulkSMSBD
async function sendSMS(phone: string, message: string): Promise<boolean> {
  const apiKey = Deno.env.get("BULKSMSBD_API_KEY");
  const senderId = Deno.env.get("BULKSMSBD_SENDER_ID");

  if (!apiKey || !senderId) {
    console.log("BulkSMSBD credentials not configured, skipping SMS");
    return false;
  }

  // Format phone number (remove leading 0, add 880 if needed)
  let formattedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "880" + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith("880")) {
    formattedPhone = "880" + formattedPhone;
  }

  try {
    const response = await fetch("https://bulksmsbd.net/api/smsapi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
  templateKey: string,
  variables: Record<string, string>
): Promise<boolean> {
  try {
    // Fetch email template
    const { data: template, error: templateError } = await supabaseAdmin
      .from("email_templates")
      .select("subject, html_content")
      .eq("template_key", templateKey)
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      console.error("Email template not found:", templateKey);
      return false;
    }

    // Replace placeholders
    let subject = template.subject;
    let html = template.html_content;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(placeholder, value);
      html = html.replace(placeholder, value);
    }

    // Fetch SMTP settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "smtp_host",
        "smtp_port",
        "smtp_user",
        "smtp_password",
        "smtp_from_email",
        "smtp_from_name",
        "smtp_secure",
      ]);

    if (settingsError || !settings?.length) {
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

    // Create SMTP client and send
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

// Check if notification was already sent today
async function wasNotificationSentToday(
  supabaseAdmin: any,
  userId: string,
  notificationType: string,
  channel: string
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from("notification_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("notification_type", notificationType)
    .eq("channel", channel)
    .gte("sent_at", today.toISOString())
    .limit(1);

  return !error && data && data.length > 0;
}

// Log notification
async function logNotification(
  supabaseAdmin: any,
  userId: string,
  notificationType: string,
  channel: string,
  daysBeforeExpiry: number | null,
  status: string,
  errorMessage?: string
): Promise<void> {
  await supabaseAdmin.from("notification_logs").insert({
    user_id: userId,
    notification_type: notificationType,
    channel: channel,
    days_before_expiry: daysBeforeExpiry,
    status: status,
    error_message: errorMessage,
  });
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

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const billingUrl = "https://medflowxbd.lovable.app/billing";

    console.log("Checking subscriptions expiring within 3 days...");
    console.log("Current time:", now.toISOString());
    console.log("Three days from now:", threeDaysFromNow.toISOString());

    // Fetch subscriptions (without profile join since there's no direct relationship)
    // Get active subscriptions that expire within 3 days OR just expired
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        id,
        user_id,
        plan_type,
        status,
        current_period_end,
        trial_ends_at,
        lifetime_service_due_date
      `)
      .neq("plan_type", "lifetime")
      .in("status", ["active", "expired"]);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw subError;
    }

    // Fetch all profiles for the subscription users
    const userIds = subscriptions?.map((s) => s.user_id) || [];
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, pharmacy_name, full_name, phone")
      .in("user_id", userIds);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
    }

    // Create a map for quick profile lookup
    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.user_id, p])
    );

    console.log(`Found ${subscriptions?.length || 0} non-lifetime subscriptions`);

    const results = {
      processed: 0,
      emailsSent: 0,
      smsSent: 0,
      skipped: 0,
      errors: 0,
    };

    for (const sub of subscriptions || []) {
      results.processed++;

      // Determine expiry date based on plan type
      let expiryDate: Date | null = null;
      if (sub.plan_type === "trial" && sub.trial_ends_at) {
        expiryDate = new Date(sub.trial_ends_at);
      } else if (sub.current_period_end) {
        expiryDate = new Date(sub.current_period_end);
      }

      if (!expiryDate) {
        console.log(`Skipping subscription ${sub.id} - no expiry date`);
        results.skipped++;
        continue;
      }

      // Calculate days until expiry
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`Subscription ${sub.id}: ${daysUntilExpiry} days until expiry`);

      // Determine notification type
      let notificationType: string | null = null;
      let templateKey: string | null = null;
      let smsMessage: string | null = null;

      // Get profile from map
      const profile = profileMap.get(sub.user_id);
      const pharmacyName = profile?.pharmacy_name || profile?.full_name || "প্রিয় গ্রাহক";
      const userPhone = profile?.phone;
      const planTypeName = planTypeNames[sub.plan_type] || sub.plan_type;
      const expiryDateStr = expiryDate.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (daysUntilExpiry <= 0 && daysUntilExpiry >= -1) {
        // Just expired (within last 24 hours)
        notificationType = "subscription_expired";
        templateKey = "subscription_expired";
        smsMessage = `${pharmacyName}, আপনার MedFlowX ${planTypeName} সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে। এখনই রিনিউ করুন: ${billingUrl}`;
      } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 3) {
        // Expiring within 3 days
        notificationType = "subscription_expiry_reminder";
        templateKey = "subscription_expiry_reminder";
        smsMessage = `${pharmacyName}, আপনার MedFlowX ${planTypeName} সাবস্ক্রিপশন ${daysUntilExpiry} দিনের মধ্যে শেষ হবে। এখনই রিনিউ করুন: ${billingUrl}`;
      }

      if (!notificationType || !templateKey) {
        console.log(`Skipping subscription ${sub.id} - not in notification window`);
        results.skipped++;
        continue;
      }

      // Get user email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(sub.user_id);
      if (userError || !userData?.user?.email) {
        console.error(`Could not get email for user ${sub.user_id}`);
        results.errors++;
        continue;
      }

      const userEmail = userData.user.email;

      // Send email notification
      const emailAlreadySent = await wasNotificationSentToday(supabaseAdmin, sub.user_id, notificationType, "email");
      if (!emailAlreadySent) {
        const emailVariables = {
          pharmacy_name: pharmacyName,
          plan_type: planTypeName,
          days_remaining: daysUntilExpiry.toString(),
          expiry_date: expiryDateStr,
          billing_url: billingUrl,
        };

        const emailSent = await sendEmail(supabaseAdmin, userEmail, templateKey, emailVariables);
        await logNotification(
          supabaseAdmin,
          sub.user_id,
          notificationType,
          "email",
          daysUntilExpiry,
          emailSent ? "sent" : "failed",
          emailSent ? undefined : "Email sending failed"
        );

        if (emailSent) {
          results.emailsSent++;
          console.log(`Email sent to ${userEmail} for subscription ${sub.id}`);
        } else {
          results.errors++;
        }
      } else {
        console.log(`Email already sent today for subscription ${sub.id}`);
      }

      // Send SMS notification
      if (userPhone && smsMessage) {
        const smsAlreadySent = await wasNotificationSentToday(supabaseAdmin, sub.user_id, notificationType, "sms");
        if (!smsAlreadySent) {
          const smsSent = await sendSMS(userPhone, smsMessage);
          await logNotification(
            supabaseAdmin,
            sub.user_id,
            notificationType,
            "sms",
            daysUntilExpiry,
            smsSent ? "sent" : "failed",
            smsSent ? undefined : "SMS sending failed"
          );

          if (smsSent) {
            results.smsSent++;
            console.log(`SMS sent to ${userPhone} for subscription ${sub.id}`);
          } else {
            results.errors++;
          }
        } else {
          console.log(`SMS already sent today for subscription ${sub.id}`);
        }
      }
    }

    console.log("Notification job completed:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription expiry notifications processed",
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in subscription-expiry-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
