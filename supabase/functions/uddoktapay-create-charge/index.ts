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

    // Get request body
    const { user_id, plan_id, amount, full_name, email, redirect_url, cancel_url, plan_type } = await req.json();

    console.log("Creating UddoktaPay charge for user:", user_id, "plan:", plan_id, "type:", plan_type);

    // Fetch UddoktaPay settings from platform_settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["uddoktapay_api_key", "uddoktapay_base_url", "uddoktapay_enabled"]);

    if (settingsError) {
      console.error("Settings fetch error:", settingsError);
      throw new Error("Failed to fetch payment gateway settings");
    }

    const settingsMap: Record<string, any> = {};
    settings?.forEach((s) => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    const apiKey = settingsMap.uddoktapay_api_key?.replace(/"/g, "");
    const baseUrl = settingsMap.uddoktapay_base_url?.replace(/"/g, "");
    const isEnabled = settingsMap.uddoktapay_enabled === true || settingsMap.uddoktapay_enabled === "true";

    if (!isEnabled) {
      throw new Error("UddoktaPay payment gateway is not enabled");
    }

    if (!apiKey || !baseUrl) {
      throw new Error("UddoktaPay configuration is incomplete");
    }

    console.log("Using UddoktaPay base URL:", baseUrl);

    // Create payment request in database first
    const { data: paymentRequest, error: insertError } = await supabaseClient
      .from("payment_requests")
      .insert({
        user_id,
        plan_id,
        amount,
        payment_method: "uddoktapay",
        transaction_id: "", // Will be updated after UddoktaPay response
        plan_type: plan_type || "unknown", // Store actual plan type
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to create payment request");
    }

    // Get base redirect URL from request or use default
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/uddoktapay-webhook`;

    // Create charge on UddoktaPay
    const uddoktaPayload = {
      full_name: full_name || "Customer",
      email: email || "customer@example.com",
      amount: String(amount),
      metadata: {
        payment_request_id: paymentRequest.id,
        user_id,
        plan_id,
      },
      redirect_url,
      return_type: "GET",
      cancel_url,
      webhook_url: webhookUrl,
    };

    console.log("Sending to UddoktaPay:", JSON.stringify(uddoktaPayload));

    // Ensure baseUrl doesn't end with /api if we're adding /api/checkout-v2
    const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
    const apiEndpoint = `${cleanBaseUrl}/api/checkout-v2`;
    console.log("UddoktaPay API endpoint:", apiEndpoint);

    const uddoktaResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "RT-UDDOKTAPAY-API-KEY": apiKey,
      },
      body: JSON.stringify(uddoktaPayload),
    });

    const uddoktaData = await uddoktaResponse.json();
    console.log("UddoktaPay response:", JSON.stringify(uddoktaData));

    if (!uddoktaData.status) {
      throw new Error(uddoktaData.message || "Failed to create UddoktaPay charge");
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: uddoktaData.payment_url,
        payment_request_id: paymentRequest.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("UddoktaPay create charge error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
