import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

// Format phone number to Bangladesh format (880XXXXXXXXXX)
function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/\s+/g, "").replace(/-/g, "");
  
  if (formatted.startsWith("+")) {
    formatted = formatted.substring(1);
  }
  
  if (formatted.startsWith("0")) {
    formatted = "880" + formatted.substring(1);
  } else if (!formatted.startsWith("880")) {
    formatted = "880" + formatted;
  }
  
  return formatted;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return new Response(
        JSON.stringify({ error: "Phone and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if account is locked
    const { data: attemptData } = await supabaseAdmin
      .from("login_attempts")
      .select("*")
      .eq("identifier", formattedPhone)
      .single();

    if (attemptData?.locked_until) {
      const lockedUntil = new Date(attemptData.locked_until);
      if (lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
        return new Response(
          JSON.stringify({ 
            error: `অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে। ${remainingMinutes} মিনিট পর আবার চেষ্টা করুন।`,
            locked: true,
            lockedUntil: attemptData.locked_until,
            remainingMinutes
          }),
          { status: 423, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Lock expired, reset attempts
        await supabaseAdmin
          .from("login_attempts")
          .update({ attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
          .eq("identifier", formattedPhone);
      }
    }

    // Find user by phone number in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, pharmacy_name, phone_verified")
      .eq("phone", formattedPhone)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "No account found with this phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.phone_verified) {
      return new Response(
        JSON.stringify({ error: "Phone number not verified. Please complete registration." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's email from auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Account not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to sign in with email and password
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (signInError) {
      // Record failed attempt
      const currentAttempts = (attemptData?.attempts || 0) + 1;
      const shouldLock = currentAttempts >= MAX_ATTEMPTS;
      
      const updateData: Record<string, unknown> = {
        identifier: formattedPhone,
        identifier_type: 'phone',
        attempts: currentAttempts,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (shouldLock) {
        const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        updateData.locked_until = lockUntil.toISOString();
      }

      await supabaseAdmin
        .from("login_attempts")
        .upsert(updateData, { onConflict: 'identifier' });

      if (shouldLock) {
        return new Response(
          JSON.stringify({ 
            error: `অনেক বার ভুল পাসওয়ার্ড দেওয়া হয়েছে। অ্যাকাউন্ট ${LOCK_DURATION_MINUTES} মিনিটের জন্য লক করা হয়েছে।`,
            locked: true,
            remainingMinutes: LOCK_DURATION_MINUTES
          }),
          { status: 423, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const attemptsRemaining = MAX_ATTEMPTS - currentAttempts;
      return new Response(
        JSON.stringify({ 
          error: `ভুল পাসওয়ার্ড। আর ${attemptsRemaining} বার চেষ্টা করতে পারবেন।`,
          attemptsRemaining
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Successful login - reset attempts
    if (attemptData) {
      await supabaseAdmin
        .from("login_attempts")
        .update({ attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
        .eq("identifier", formattedPhone);
    }

    // Check if user has PIN set up
    const { data: pinData } = await supabaseAdmin
      .from("user_pins")
      .select("id, is_active")
      .eq("user_id", profile.user_id)
      .eq("is_active", true)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        session: signInData.session,
        user: {
          id: profile.user_id,
          fullName: profile.full_name,
          pharmacyName: profile.pharmacy_name,
          phone: formattedPhone,
        },
        hasPinSetup: !!pinData
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in phone-login:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
