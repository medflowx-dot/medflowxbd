import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RemoveRequest {
  team_member_id: string;
  delete_user?: boolean;
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

    // Verify caller is owner_admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller is owner_admin
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (callerRole?.role !== 'owner_admin') {
      return new Response(
        JSON.stringify({ error: 'শুধুমাত্র Owner Admin এই কাজ করতে পারবেন' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { team_member_id, delete_user } = await req.json() as RemoveRequest;

    if (!team_member_id) {
      return new Response(
        JSON.stringify({ error: 'Team member ID আবশ্যক' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get team member info for logging
    const { data: teamMember } = await supabaseAdmin
      .from('admin_team_members')
      .select('*')
      .eq('id', team_member_id)
      .single();

    if (!teamMember) {
      return new Response(
        JSON.stringify({ error: 'Team member খুঁজে পাওয়া যায়নি' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete team member (permissions will cascade)
    const { error: deleteError } = await supabaseAdmin
      .from('admin_team_members')
      .delete()
      .eq('id', team_member_id);

    if (deleteError) {
      console.error('Error deleting team member:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Team member মুছতে সমস্যা হয়েছে' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optionally delete the user account
    if (delete_user && teamMember.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(teamMember.user_id);
      console.log(`Deleted user account: ${teamMember.user_id}`);
    }

    // Log the action
    await supabaseAdmin.rpc('log_admin_action', {
      p_action_type: 'remove_admin_team',
      p_target_type: 'admin_team_member',
      p_target_id: team_member_id,
      p_target_user_id: teamMember.user_id,
      p_details: { 
        full_name: teamMember.full_name, 
        email: teamMember.email, 
        team_role: teamMember.team_role,
        user_deleted: delete_user 
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `${teamMember.full_name} কে Team থেকে সরানো হয়েছে`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Remove admin team error:', error);
    return new Response(
      JSON.stringify({ error: 'Team member সরাতে সমস্যা হয়েছে' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
