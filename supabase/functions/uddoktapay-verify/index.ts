import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { invoice_id, payment_request_id } = await req.json();

    console.log("Verifying UddoktaPay payment:", invoice_id);

    // Fetch UddoktaPay settings
    const { data: settings } = await supabaseClient
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["uddoktapay_api_key", "uddoktapay_base_url"]);

    const settingsMap: Record<string, any> = {};
    settings?.forEach((s) => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    const apiKey = settingsMap.uddoktapay_api_key?.replace(/"/g, "");
    const baseUrl = settingsMap.uddoktapay_base_url?.replace(/"/g, "");

    if (!apiKey || !baseUrl) {
      throw new Error("UddoktaPay configuration is incomplete");
    }

    // Verify payment with UddoktaPay
    const verifyResponse = await fetch(`${baseUrl}/api/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify({ invoice_id }),
    });

    const verifyData = await verifyResponse.json();
    console.log("UddoktaPay verify response:", JSON.stringify(verifyData));

    if (verifyData.status === "ERROR") {
      return new Response(
        JSON.stringify({ success: false, error: verifyData.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update payment request if we have the ID
    if (payment_request_id) {
      const updateData: any = {
        transaction_id: verifyData.transaction_id || invoice_id,
        payment_method: `uddoktapay_${verifyData.payment_method || "unknown"}`,
        phone_number: verifyData.sender_number,
        updated_at: new Date().toISOString(),
      };

      if (verifyData.status === "COMPLETED") {
        updateData.status = "verified";
        updateData.verified_at = new Date().toISOString();
      } else if (verifyData.status === "PENDING") {
        updateData.status = "pending";
      }

      await supabaseClient
        .from("payment_requests")
        .update(updateData)
        .eq("id", payment_request_id);

      // Get payment request details for subscription update
      const { data: paymentRequest } = await supabaseClient
        .from("payment_requests")
        .select("user_id, plan_id")
        .eq("id", payment_request_id)
        .single();

      // If completed, update subscription
      if (verifyData.status === "COMPLETED" && paymentRequest) {
        const { data: plan } = await supabaseClient
          .from("pricing_plans")
          .select("*")
          .eq("id", paymentRequest.plan_id)
          .single();

        if (plan) {
          const currentPeriodEnd = plan.duration_days
            ? new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString()
            : null;

          const lifetimeServiceDueDate = plan.plan_name === "lifetime"
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : null;

          await supabaseClient
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
            .eq("user_id", paymentRequest.user_id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: verifyData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Verify payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
