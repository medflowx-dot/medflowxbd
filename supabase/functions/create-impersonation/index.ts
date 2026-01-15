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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify they're owner_admin
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

    // Verify user is owner_admin using the has_role function
    const { data: isOwnerAdmin, error: roleError } = await userClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'owner_admin'
    });

    if (roleError || !isOwnerAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Owner admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target user ID from request body
    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Target user ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify target user exists
    const { data: targetUser, error: targetError } = await adminClient.auth.admin.getUserById(targetUserId);
    if (targetError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a secure random token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const sessionToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Set expiry to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Deactivate any existing sessions for this admin-target pair
    await adminClient
      .from('impersonation_sessions')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('admin_user_id', user.id)
      .eq('target_user_id', targetUserId)
      .eq('is_active', true);

    // Create impersonation session record
    const { data: session, error: sessionError } = await adminClient
      .from('impersonation_sessions')
      .insert({
        admin_user_id: user.id,
        target_user_id: targetUserId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create impersonation session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the action
    await adminClient.rpc('log_admin_action', {
      p_action_type: 'impersonation_start',
      p_target_type: 'user',
      p_target_user_id: targetUserId,
      p_details: { session_id: session.id, expires_at: expiresAt.toISOString() }
    });

    // Get target user's profile for display
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, pharmacy_name')
      .eq('user_id', targetUserId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        sessionToken,
        expiresAt: expiresAt.toISOString(),
        targetUser: {
          id: targetUserId,
          email: targetUser.user.email,
          fullName: profile?.full_name,
          pharmacyName: profile?.pharmacy_name,
        }
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
