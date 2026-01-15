import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteStaffRequest {
  email: string;
  full_name: string;
  admin_user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the caller is authenticated and has permission
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller has permission to create staff
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (!callerRole || (callerRole.role !== 'client_admin' && callerRole.role !== 'owner_admin')) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to invite staff' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller is on trial (trial users cannot create staff)
    if (callerRole.role === 'client_admin') {
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', caller.id)
        .single();

      if (subscription?.plan_type === 'trial') {
        return new Response(
          JSON.stringify({ error: 'Trial users cannot invite staff. Please upgrade your plan.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Parse request body
    const { email, full_name }: InviteStaffRequest = await req.json();

    // Validate input
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!full_name || full_name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Full name must be at least 2 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the caller's pharmacy name to assign to new staff
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('pharmacy_name')
      .eq('user_id', caller.id)
      .single();

    // Generate a random password for the new user
    const tempPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!';

    // Create the new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        invited_by: caller.id,
      },
    });

    if (createError) {
      // Check for duplicate email
      if (createError.message.includes('already been registered')) {
        return new Response(
          JSON.stringify({ error: 'A user with this email already exists' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('Failed to create user');
    }

    // Update the profile with pharmacy name (profile is auto-created by trigger)
    await supabaseAdmin
      .from('profiles')
      .update({ 
        full_name: full_name.trim(),
        pharmacy_name: callerProfile?.pharmacy_name 
      })
      .eq('user_id', newUser.user.id);

    // Update role to client_staff (trigger creates with client_admin by default)
    await supabaseAdmin
      .from('user_roles')
      .update({ role: 'client_staff' })
      .eq('user_id', newUser.user.id);

    // Send password reset email so user can set their own password
    await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.toLowerCase().trim(),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Staff member invited successfully',
        user_id: newUser.user.id,
        temp_password: tempPassword, // Return this so admin can share it
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error inviting staff:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
