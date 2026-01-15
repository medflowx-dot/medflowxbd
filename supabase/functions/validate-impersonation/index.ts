import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get the authorization header (original owner's token)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the caller is still the owner_admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get session token from request body
    const { sessionToken } = await req.json();
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Session token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Find and validate the impersonation session
    const { data: session, error: sessionError } = await adminClient
      .from('impersonation_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('admin_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired impersonation session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      // Mark session as inactive
      await adminClient
        .from('impersonation_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', session.id);

      return new Response(
        JSON.stringify({ error: 'Impersonation session has expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target user's email
    const { data: targetUserData } = await adminClient.auth.admin.getUserById(session.target_user_id);
    if (!targetUserData.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a magic link for the target user
    const { data: targetSession, error: signInError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUserData.user.email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://id-preview--42f9a3fe-6410-4bdd-89c7-4c194a2006c7.lovable.app'}/dashboard`,
      }
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log impersonation validation
    await adminClient.rpc('log_admin_action', {
      p_action_type: 'impersonation_access',
      p_target_type: 'user',
      p_target_user_id: session.target_user_id,
      p_details: { session_id: session.id }
    });

    return new Response(
      JSON.stringify({
        success: true,
        // Return the action link that the owner can use to login as the target user
        actionLink: targetSession.properties?.action_link,
        email: targetUserData.user.email,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
