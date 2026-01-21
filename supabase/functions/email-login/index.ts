import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if account is locked
    const { data: attemptData } = await supabaseAdmin
      .from("login_attempts")
      .select("*")
      .eq("identifier", normalizedEmail)
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
          .eq("identifier", normalizedEmail);
      }
    }

    // Try to sign in with email and password
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      // Record failed attempt
      const currentAttempts = (attemptData?.attempts || 0) + 1;
      const shouldLock = currentAttempts >= MAX_ATTEMPTS;
      
      const updateData: Record<string, unknown> = {
        identifier: normalizedEmail,
        identifier_type: 'email',
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
      
      // Determine error message based on the error
      let errorMessage = `ভুল ইমেইল বা পাসওয়ার্ড। আর ${attemptsRemaining} বার চেষ্টা করতে পারবেন।`;
      if (signInError.message.includes("Invalid login credentials")) {
        errorMessage = `ভুল ইমেইল বা পাসওয়ার্ড। আর ${attemptsRemaining} বার চেষ্টা করতে পারবেন।`;
      } else if (signInError.message.includes("Email not confirmed")) {
        errorMessage = "ইমেইল এখনও ভেরিফাই হয়নি। অনুগ্রহ করে আপনার ইমেইল চেক করুন।";
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
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
        .eq("identifier", normalizedEmail);
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, pharmacy_name")
      .eq("user_id", signInData.user.id)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        session: signInData.session,
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
          fullName: profile?.full_name,
          pharmacyName: profile?.pharmacy_name,
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in email-login:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
