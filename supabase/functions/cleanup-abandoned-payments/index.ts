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

    // Delete payment requests that:
    // 1. Have empty transaction_id (never completed gateway checkout)
    // 2. Are older than 1 hour
    // 3. Are still in 'pending' status
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: deletedRequests, error } = await supabaseClient
      .from("payment_requests")
      .delete()
      .eq("transaction_id", "")
      .eq("status", "pending")
      .lt("created_at", oneHourAgo)
      .select("id, user_id, plan_type, amount");

    if (error) {
      console.error("Error deleting abandoned requests:", error);
      throw error;
    }

    const deletedCount = deletedRequests?.length || 0;
    console.log(`Cleaned up ${deletedCount} abandoned payment requests`);

    if (deletedCount > 0) {
      console.log("Deleted requests:", JSON.stringify(deletedRequests));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${deletedCount} abandoned payment requests`,
        deleted_count: deletedCount,
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
