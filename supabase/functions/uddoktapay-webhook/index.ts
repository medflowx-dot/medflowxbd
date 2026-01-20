import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, rt-uddoktapay-api-key",
};

// Helper function to send payment success email
async function sendPaymentSuccessEmail(
  supabaseClient: any,
  userEmail: string,
  userName: string,
  planName: string,
  amount: number,
  transactionId: string,
  paymentMethod: string,
  expiryDate: string | null
) {
  try {
    console.log("Sending payment success email to:", userEmail);

    // Fetch SMTP settings
    const { data: smtpSettings } = await supabaseClient
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "smtp_host", "smtp_port", "smtp_user", "smtp_password",
        "smtp_from_email", "smtp_from_name", "smtp_secure"
      ]);

    const smtpConfig: Record<string, any> = {};
    smtpSettings?.forEach((s: any) => {
      let value = s.setting_value;
      if (typeof value === "string") {
        value = value.replace(/^"|"$/g, "");
      }
      smtpConfig[s.setting_key] = value;
    });

    if (!smtpConfig.smtp_host || !smtpConfig.smtp_user || !smtpConfig.smtp_password) {
      console.log("SMTP not configured, skipping email");
      return;
    }

    // Fetch email template
    const { data: template } = await supabaseClient
      .from("email_templates")
      .select("subject, html_content")
      .eq("template_key", "payment_success")
      .eq("is_active", true)
      .single();

    if (!template) {
      console.log("Payment success email template not found");
      return;
    }

    // Replace placeholders
    const currentYear = new Date().getFullYear().toString();
    const activationDate = new Date().toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedExpiry = expiryDate
      ? new Date(expiryDate).toLocaleDateString("bn-BD", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "লাইফটাইম";

    const replacements: Record<string, string> = {
      "{{user_name}}": userName || "গ্রাহক",
      "{{plan_name}}": planName,
      "{{amount}}": amount.toLocaleString(),
      "{{transaction_id}}": transactionId,
      "{{payment_method}}": paymentMethod.replace("uddoktapay_", "").toUpperCase(),
      "{{activation_date}}": activationDate,
      "{{expiry_date}}": formattedExpiry,
      "{{dashboard_url}}": "https://medflowxbd.lovable.app/dashboard",
      "{{current_year}}": currentYear,
    };

    let subject = template.subject;
    let htmlContent = template.html_content;

    Object.entries(replacements).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(key, "g"), value);
      htmlContent = htmlContent.replace(new RegExp(key, "g"), value);
    });

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
      to: userEmail,
      subject: subject,
      html: htmlContent,
    });

    await client.close();
    console.log("Payment success email sent to:", userEmail);
  } catch (error) {
    console.error("Error sending payment success email:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get webhook data
    const webhookData = await req.json();
    console.log("Received UddoktaPay webhook:", JSON.stringify(webhookData));

    const {
      invoice_id,
      transaction_id,
      status,
      metadata,
      payment_method,
      sender_number,
      amount,
    } = webhookData;

    if (!metadata?.payment_request_id) {
      console.error("Missing payment_request_id in webhook metadata");
      return new Response(
        JSON.stringify({ success: false, error: "Missing payment request ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify API key from headers
    const headerApiKey = req.headers.get("RT-UDDOKTAPAY-API-KEY");
    
    // Fetch stored API key
    const { data: settings } = await supabaseClient
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "uddoktapay_api_key")
      .single();

    const storedApiKey = settings?.setting_value?.replace(/"/g, "");
    
    if (headerApiKey && storedApiKey && headerApiKey !== storedApiKey) {
      console.error("Invalid API key in webhook");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update payment request
    const updateData: any = {
      transaction_id: transaction_id || invoice_id,
      payment_method: `uddoktapay_${payment_method || "unknown"}`,
      phone_number: sender_number,
      updated_at: new Date().toISOString(),
    };

    if (status === "COMPLETED") {
      updateData.status = "verified";
      updateData.verified_at = new Date().toISOString();
    } else if (status === "ERROR" || status === "FAILED") {
      updateData.status = "rejected";
      updateData.rejection_reason = "Payment failed or cancelled";
    }

    const { error: updateError } = await supabaseClient
      .from("payment_requests")
      .update(updateData)
      .eq("id", metadata.payment_request_id);

    if (updateError) {
      console.error("Failed to update payment request:", updateError);
      throw updateError;
    }

    console.log("Payment request updated:", metadata.payment_request_id);

    // If payment completed, activate subscription and send email
    if (status === "COMPLETED" && metadata.user_id && metadata.plan_id) {
      console.log("Activating subscription for user:", metadata.user_id);

      // Get plan details
      const { data: plan } = await supabaseClient
        .from("pricing_plans")
        .select("*")
        .eq("id", metadata.plan_id)
        .single();

      // Get current subscription to check for renewal
      const { data: existingSubscription } = await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", metadata.user_id)
        .single();

      // Get user details for email
      const { data: authUser } = await supabaseClient.auth.admin.getUserById(metadata.user_id);
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("user_id", metadata.user_id)
        .single();

      if (plan) {
        let currentPeriodEnd: string | null = null;
        
        // Calculate period end - for renewals, add to existing end date if still active
        if (plan.duration_days) {
          const now = new Date();
          let startDate = now;
          
          // If user has active subscription with remaining time, extend from that date
          if (existingSubscription?.current_period_end && 
              existingSubscription.status === "active" &&
              new Date(existingSubscription.current_period_end) > now) {
            startDate = new Date(existingSubscription.current_period_end);
            console.log("Extending subscription from:", startDate.toISOString());
          }
          
          currentPeriodEnd = new Date(startDate.getTime() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString();
        }

        const lifetimeServiceDueDate = plan.plan_name === "lifetime"
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const { error: subError } = await supabaseClient
          .from("subscriptions")
          .update({
            plan_type: plan.plan_name,
            status: "active",
            amount: plan.price,
            current_period_start: new Date().toISOString(),
            current_period_end: currentPeriodEnd,
            lifetime_service_due_date: lifetimeServiceDueDate,
            trial_ends_at: null,
            payment_method: "uddoktapay",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", metadata.user_id);

        if (subError) {
          console.error("Failed to update subscription:", subError);
        } else {
          console.log("Subscription activated successfully");

          // Send payment success email (don't await - fire and forget)
          if (authUser?.user?.email) {
            sendPaymentSuccessEmail(
              supabaseClient,
              authUser.user.email,
              profile?.full_name || authUser.user.email.split("@")[0],
              plan.display_name,
              plan.price,
              transaction_id || invoice_id,
              payment_method || "uddoktapay",
              currentPeriodEnd
            ).catch((err) => console.error("Email send error:", err));
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
