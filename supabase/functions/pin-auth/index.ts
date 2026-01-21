import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple hash function for PIN (in production, use bcrypt or similar)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.substring(0, 16));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, pin, deviceId } = await req.json();

    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // For setup and verify, we need user authentication
    if (action === "setup" || action === "verify" || action === "remove") {
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authorization required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = user.id;

      // SETUP PIN
      if (action === "setup") {
        if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
          return new Response(
            JSON.stringify({ error: "PIN must be 4 digits" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const pinHash = await hashPin(pin);

        // Upsert PIN (replace if exists)
        const { error: upsertError } = await supabaseAdmin
          .from("user_pins")
          .upsert({
            user_id: userId,
            pin_hash: pinHash,
            device_id: deviceId || null,
            is_active: true,
            failed_attempts: 0,
            locked_until: null,
          }, { onConflict: "user_id" });

        if (upsertError) {
          console.error("Error setting up PIN:", upsertError);
          return new Response(
            JSON.stringify({ error: "Failed to setup PIN" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "PIN setup successfully" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // VERIFY PIN
      if (action === "verify") {
        if (!pin) {
          return new Response(
            JSON.stringify({ error: "PIN is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user's PIN
        const { data: pinData, error: pinError } = await supabaseAdmin
          .from("user_pins")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .single();

        if (pinError || !pinData) {
          return new Response(
            JSON.stringify({ error: "PIN not set up" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if locked
        if (pinData.locked_until && new Date(pinData.locked_until) > new Date()) {
          const remainingMinutes = Math.ceil((new Date(pinData.locked_until).getTime() - Date.now()) / 60000);
          return new Response(
            JSON.stringify({ 
              error: `PIN locked. Try again in ${remainingMinutes} minutes.`,
              locked: true,
              lockedUntil: pinData.locked_until
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const pinHash = await hashPin(pin);

        if (pinData.pin_hash !== pinHash) {
          const newAttempts = pinData.failed_attempts + 1;
          let lockedUntil = null;

          // Lock after 5 failed attempts for 15 minutes
          if (newAttempts >= 5) {
            lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          }

          await supabaseAdmin
            .from("user_pins")
            .update({ 
              failed_attempts: newAttempts,
              locked_until: lockedUntil
            })
            .eq("id", pinData.id);

          return new Response(
            JSON.stringify({ 
              error: "Invalid PIN",
              attemptsRemaining: Math.max(0, 5 - newAttempts)
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Reset failed attempts on success
        await supabaseAdmin
          .from("user_pins")
          .update({ failed_attempts: 0, locked_until: null })
          .eq("id", pinData.id);

        return new Response(
          JSON.stringify({ success: true, message: "PIN verified" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // REMOVE PIN
      if (action === "remove") {
        const { error: deleteError } = await supabaseAdmin
          .from("user_pins")
          .delete()
          .eq("user_id", userId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: "Failed to remove PIN" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "PIN removed successfully" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // CHECK if PIN exists for a user (public endpoint for login flow)
    if (action === "check") {
      const { userId } = await req.json();
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: pinData } = await supabaseAdmin
        .from("user_pins")
        .select("id, is_active")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      return new Response(
        JSON.stringify({ hasPin: !!pinData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in pin-auth:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
