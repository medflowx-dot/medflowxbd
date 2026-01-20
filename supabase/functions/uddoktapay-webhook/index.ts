import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, rt-uddoktapay-api-key",
};

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

    // If payment completed, activate subscription
    if (status === "COMPLETED" && metadata.user_id && metadata.plan_id) {
      console.log("Activating subscription for user:", metadata.user_id);

      // Get plan details
      const { data: plan } = await supabaseClient
        .from("pricing_plans")
        .select("*")
        .eq("id", metadata.plan_id)
        .single();

      if (plan) {
        const currentPeriodEnd = plan.duration_days
          ? new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString()
          : null;

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
