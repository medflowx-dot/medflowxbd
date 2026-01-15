import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RemoveStaffRequest {
  staff_user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller has permission
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (!callerRole || (callerRole.role !== 'client_admin' && callerRole.role !== 'owner_admin')) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to remove staff' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { staff_user_id }: RemoveStaffRequest = await req.json();

    if (!staff_user_id) {
      return new Response(
        JSON.stringify({ error: 'Staff user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the target user is a staff member
    const { data: targetRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', staff_user_id)
      .single();

    if (!targetRole || targetRole.role !== 'client_staff') {
      return new Response(
        JSON.stringify({ error: 'Can only remove staff members' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the staff belongs to the same pharmacy (check pharmacy_name match)
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('pharmacy_name')
      .eq('user_id', caller.id)
      .single();

    const { data: staffProfile } = await supabaseAdmin
      .from('profiles')
      .select('pharmacy_name')
      .eq('user_id', staff_user_id)
      .single();

    // Owner admins can remove anyone, but client_admins can only remove their own staff
    if (callerRole.role === 'client_admin') {
      if (callerProfile?.pharmacy_name !== staffProfile?.pharmacy_name) {
        return new Response(
          JSON.stringify({ error: 'You can only remove staff from your own pharmacy' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delete the user (this will cascade to profiles and user_roles)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(staff_user_id);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Staff member removed successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error removing staff:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
