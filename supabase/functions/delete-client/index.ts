import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the requesting user's token to verify they're an owner_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if requesting user is owner_admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "owner_admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Only owner admins can delete clients" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent deleting owner_admin users
    const { data: targetRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "owner_admin")
      .single();

    if (targetRole) {
      return new Response(JSON.stringify({ error: "Cannot delete owner admin accounts" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Deleting client: ${userId}`);

    // Delete related data first (in order to avoid foreign key constraints)
    // Note: Some tables have CASCADE delete, but we'll be explicit

    // Delete customer payments
    await supabaseAdmin.from("customer_payments").delete().eq("user_id", userId);
    
    // Delete sale items (through sales)
    const { data: sales } = await supabaseAdmin.from("sales").select("id").eq("user_id", userId);
    if (sales && sales.length > 0) {
      const saleIds = sales.map(s => s.id);
      await supabaseAdmin.from("sale_items").delete().in("sale_id", saleIds);
    }
    
    // Delete sales
    await supabaseAdmin.from("sales").delete().eq("user_id", userId);
    
    // Delete customers
    await supabaseAdmin.from("customers").delete().eq("user_id", userId);
    
    // Delete medicine batches
    await supabaseAdmin.from("medicine_batches").delete().eq("user_id", userId);
    
    // Delete medicines
    await supabaseAdmin.from("medicines").delete().eq("user_id", userId);
    
    // Delete manufacturers
    await supabaseAdmin.from("manufacturers").delete().eq("user_id", userId);
    
    // Delete supplier payments
    await supabaseAdmin.from("supplier_payments").delete().eq("user_id", userId);
    
    // Delete supplier purchases
    await supabaseAdmin.from("supplier_purchases").delete().eq("user_id", userId);
    
    // Delete suppliers
    await supabaseAdmin.from("suppliers").delete().eq("user_id", userId);
    
    // Delete stock order items (through stock orders)
    const { data: stockOrders } = await supabaseAdmin.from("stock_orders").select("id").eq("user_id", userId);
    if (stockOrders && stockOrders.length > 0) {
      const orderIds = stockOrders.map(o => o.id);
      await supabaseAdmin.from("stock_order_items").delete().in("order_id", orderIds);
    }
    
    // Delete stock orders
    await supabaseAdmin.from("stock_orders").delete().eq("user_id", userId);
    
    // Delete daily costs
    await supabaseAdmin.from("daily_costs").delete().eq("user_id", userId);
    
    // Delete opening cash
    await supabaseAdmin.from("opening_cash").delete().eq("user_id", userId);
    
    // Delete payments (subscription payments)
    await supabaseAdmin.from("payments").delete().eq("user_id", userId);
    
    // Delete subscriptions
    await supabaseAdmin.from("subscriptions").delete().eq("user_id", userId);
    
    // Delete user roles
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    
    // Delete profile
    await supabaseAdmin.from("profiles").delete().eq("user_id", userId);
    
    // Delete impersonation sessions
    await supabaseAdmin.from("impersonation_sessions").delete().eq("target_user_id", userId);

    // Finally, delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user from auth:", deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Successfully deleted client: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Client deleted successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
