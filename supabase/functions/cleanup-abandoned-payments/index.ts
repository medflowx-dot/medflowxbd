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

    console.log("Starting cleanup of abandoned payment requests...");

    // Get the configurable cleanup interval from platform_settings
    let cleanupMinutes = 60; // Default: 60 minutes
    
    const { data: settingData, error: settingError } = await supabaseClient
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "abandoned_payment_cleanup_minutes")
      .single();
    
    if (!settingError && settingData?.setting_value) {
      const parsedValue = parseInt(String(settingData.setting_value).replace(/"/g, ''), 10);
      if (!isNaN(parsedValue) && parsedValue > 0) {
        cleanupMinutes = parsedValue;
      }
    }
    
    console.log(`Using cleanup interval: ${cleanupMinutes} minutes`);

    // Delete payment requests that:
    // 1. Have empty transaction_id (never completed gateway checkout)
    // 2. Are older than configured minutes
    // 3. Are still in 'pending' status
    const cutoffTime = new Date(Date.now() - cleanupMinutes * 60 * 1000).toISOString();

    const { data: deletedRequests, error } = await supabaseClient
      .from("payment_requests")
      .delete()
      .eq("transaction_id", "")
      .eq("status", "pending")
      .lt("created_at", cutoffTime)
      .select("id, user_id, plan_type, amount");

    if (error) {
      console.error("Error deleting abandoned requests:", error);
      throw error;
    }

    const deletedCount = deletedRequests?.length || 0;
    console.log(`Cleaned up ${deletedCount} abandoned payment requests (older than ${cleanupMinutes} minutes)`);

    if (deletedCount > 0) {
      console.log("Deleted requests:", JSON.stringify(deletedRequests));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${deletedCount} abandoned payment requests`,
        deleted_count: deletedCount,
        cleanup_interval_minutes: cleanupMinutes,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Cleanup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
