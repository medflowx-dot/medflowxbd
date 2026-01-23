import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginRequest {
  email: string;
  password: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { email, password } = await req.json() as LoginRequest;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email এবং password আবশ্যক' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check login attempts for lockout
    const { data: loginAttempt } = await supabaseAdmin
      .from('login_attempts')
      .select('*')
      .eq('identifier', normalizedEmail)
      .eq('identifier_type', 'email')
      .single();

    if (loginAttempt?.locked_until && new Date(loginAttempt.locked_until) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(loginAttempt.locked_until).getTime() - Date.now()) / 60000);
      return new Response(
        JSON.stringify({ 
          error: 'অ্যাকাউন্ট লক করা হয়েছে',
          locked: true,
          remainingMinutes 
        }),
        { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to sign in
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (authError || !authData.user) {
      // Record failed attempt
      const currentAttempts = (loginAttempt?.attempts || 0) + 1;
      const maxAttempts = 5;
      const shouldLock = currentAttempts >= maxAttempts;
      
      await supabaseAdmin
        .from('login_attempts')
        .upsert({
          identifier: normalizedEmail,
          identifier_type: 'email',
          attempts: shouldLock ? 0 : currentAttempts,
          locked_until: shouldLock ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null,
          last_attempt_at: new Date().toISOString()
        }, { onConflict: 'identifier,identifier_type' });

      return new Response(
        JSON.stringify({ 
          error: 'Email বা password ভুল',
          attemptsRemaining: maxAttempts - currentAttempts
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is an admin team member
    const { data: teamMember, error: teamError } = await supabaseAdmin
      .from('admin_team_members')
      .select('*, admin_team_permissions(*)')
      .eq('user_id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (teamError || !teamMember) {
      // Sign out since not a valid team member
      await supabaseAdmin.auth.admin.signOut(authData.session.access_token);
      
      return new Response(
        JSON.stringify({ error: 'আপনি Admin Team এর সদস্য নন' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear login attempts on success
    await supabaseAdmin
      .from('login_attempts')
      .delete()
      .eq('identifier', normalizedEmail)
      .eq('identifier_type', 'email');

    // Get profile info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', authData.user.id)
      .single();

    console.log(`Admin team member logged in: ${normalizedEmail}, role: ${teamMember.team_role}`);

    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: profile?.full_name || teamMember.full_name,
          teamRole: teamMember.team_role,
          permissions: teamMember.admin_team_permissions
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin team login error:', error);
    return new Response(
      JSON.stringify({ error: 'Login এ সমস্যা হয়েছে' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
