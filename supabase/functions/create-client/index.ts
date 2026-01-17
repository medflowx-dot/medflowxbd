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
      return new Response(JSON.stringify({ error: "Only owner admins can create clients" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { email, password, fullName, pharmacyName, phone, planType } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the user in auth
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: newUserId,
        full_name: fullName || null,
        pharmacy_name: pharmacyName || null,
        phone: phone || null,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }

    // Create user role (client_admin)
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUserId,
        role: "client_admin",
      });

    if (roleError) {
      console.error("Error creating role:", roleError);
    }

    // Calculate subscription dates based on plan type
    const now = new Date();
    let currentPeriodEnd: Date | null = null;
    let trialEndsAt: Date | null = null;
    let status = "active";
    let amount = 0;

    switch (planType) {
      case "trial":
        trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
        currentPeriodEnd = trialEndsAt;
        status = "trial";
        break;
      case "monthly":
        currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        amount = 299;
        break;
      case "yearly":
        currentPeriodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
        amount = 2499;
        break;
      case "lifetime":
        currentPeriodEnd = null; // No expiry
        amount = 4999;
        break;
    }

    // Create subscription
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: newUserId,
        plan_type: planType,
        status,
        amount,
        current_period_start: now.toISOString(),
        current_period_end: currentPeriodEnd?.toISOString() || null,
        trial_ends_at: trialEndsAt?.toISOString() || null,
      });

    if (subError) {
      console.error("Error creating subscription:", subError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUserId,
        message: "Client created successfully",
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
