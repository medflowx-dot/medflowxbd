import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { 
      phone, 
      verificationToken, 
      email, 
      password, 
      fullName, 
      pharmacyName 
    } = await req.json();

    if (!phone || !verificationToken || !password) {
      return new Response(
        JSON.stringify({ error: "Phone, verification token, and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the verification token
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("phone_otp_verifications")
      .select("*")
      .eq("phone", formattedPhone)
      .eq("otp_code", verificationToken) // Token stored in otp_code after verification
      .eq("is_verified", true)
      .eq("purpose", "signup")
      .gte("verified_at", fifteenMinutesAgo)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification. Please start over." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if phone already registered
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", formattedPhone)
      .eq("phone_verified", true)
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "This phone number is already registered" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a unique email if not provided (using phone as identifier)
    const userEmail = email || `${formattedPhone}@phone.medflowx.local`;

    // Create user in Supabase Auth
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      password,
      phone: "+" + formattedPhone,
      email_confirm: true, // Auto-confirm since we verified via OTP
      phone_confirm: true,
      user_metadata: {
        full_name: fullName,
        pharmacy_name: pharmacyName,
        phone: formattedPhone,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    // Update profile with phone and pharmacy info
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        user_id: userId,
        full_name: fullName || null,
        pharmacy_name: pharmacyName || null,
        phone: formattedPhone,
        phone_verified: true,
      }, { onConflict: "user_id" });

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }

    // Check if role already exists
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "client_admin")
      .single();

    if (!existingRole) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: "client_admin" });
    }

    // Create trial subscription
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!existingSub) {
      await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_type: "trial",
          status: "active",
          amount: 0,
          current_period_start: now.toISOString(),
          current_period_end: trialEndsAt.toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
        });
    }

    // Delete used OTP records for this phone
    await supabaseAdmin
      .from("phone_otp_verifications")
      .delete()
      .eq("phone", formattedPhone)
      .eq("purpose", "signup");

    // Sign in the user to get a session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: userEmail,
      password,
    });

    if (signInError) {
      console.error("Auto sign-in failed:", signInError);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Account created successfully. Please login.",
          userId,
          requiresLogin: true
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account created successfully",
        userId,
        session: signInData.session
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in phone-signup:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
