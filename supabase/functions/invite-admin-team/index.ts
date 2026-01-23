import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  full_name: string;
  email: string;
  team_role: 'manager' | 'support' | 'staff' | 'technical_it';
  permissions?: Record<string, boolean>;
}

interface SmtpConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  smtp_secure: boolean;
}

async function getSmtpConfig(supabaseAdmin: any): Promise<SmtpConfig | null> {
  const keys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_email', 'smtp_from_name', 'smtp_secure'];
  const { data: settings, error } = await supabaseAdmin
    .from('platform_settings')
    .select('setting_key, setting_value')
    .in('setting_key', keys);

  if (error || !settings || settings.length === 0) return null;

  const config: Record<string, any> = {};
  for (const s of settings) {
    config[s.setting_key] = s.setting_value;
  }

  if (!config.smtp_host || !config.smtp_user || !config.smtp_password) return null;

  return {
    smtp_host: config.smtp_host,
    smtp_port: config.smtp_port || 587,
    smtp_user: config.smtp_user,
    smtp_password: config.smtp_password,
    smtp_from_email: config.smtp_from_email || config.smtp_user,
    smtp_from_name: config.smtp_from_name || 'MedFlowX',
    smtp_secure: config.smtp_secure ?? false
  };
}

async function sendInviteEmail(smtpConfig: SmtpConfig, email: string, fullName: string, password: string, role: string): Promise<void> {
  const client = new SMTPClient({
    connection: {
      hostname: smtpConfig.smtp_host,
      port: smtpConfig.smtp_port,
      tls: smtpConfig.smtp_secure,
      auth: {
        username: smtpConfig.smtp_user,
        password: smtpConfig.smtp_password,
      },
    },
  });

  const roleLabels: Record<string, string> = {
    'manager': 'Manager',
    'support': 'Support',
    'staff': 'Staff',
    'technical_it': 'Technical IT'
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .credential-item { margin: 10px 0; }
    .label { color: #6b7280; font-size: 14px; }
    .value { font-weight: bold; color: #111827; font-size: 16px; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px; }
    .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Admin Team এ স্বাগতম!</h1>
      <p>MedFlowX Owner Panel</p>
    </div>
    <div class="content">
      <p>প্রিয় ${fullName},</p>
      <p>আপনাকে <strong>MedFlowX Admin Team</strong> এ <strong>${roleLabels[role] || role}</strong> হিসেবে যুক্ত করা হয়েছে।</p>
      
      <div class="credentials">
        <h3 style="margin-top: 0;">আপনার লগইন তথ্য:</h3>
        <div class="credential-item">
          <div class="label">Email:</div>
          <div class="value">${email}</div>
        </div>
        <div class="credential-item">
          <div class="label">Password:</div>
          <div class="value">${password}</div>
        </div>
        <div class="credential-item">
          <div class="label">Login URL:</div>
          <div class="value">https://medflowxbd.lovable.app/staff-login</div>
        </div>
      </div>
      
      <div class="warning">
        ⚠️ <strong>গুরুত্বপূর্ণ:</strong> প্রথম লগইন এর পর অবশ্যই আপনার password পরিবর্তন করুন।
      </div>
      
      <a href="https://medflowxbd.lovable.app/staff-login" class="btn">Login করুন</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} MedFlowX. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  await client.send({
    from: `${smtpConfig.smtp_from_name} <${smtpConfig.smtp_from_email}>`,
    to: email,
    subject: `MedFlowX Admin Team এ স্বাগতম - ${roleLabels[role] || role}`,
    html
  });

  await client.close();
}

// Generate a random password
function generatePassword(length = 10): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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

    const { full_name, email, team_role, permissions } = await req.json() as InviteRequest;

    if (!full_name || !email || !team_role) {
      return new Response(
        JSON.stringify({ error: 'Name, email এবং role আবশ্যক' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (existingUser) {
      // Check if already a team member
      const { data: existingMember } = await supabaseAdmin
        .from('admin_team_members')
        .select('id')
        .eq('user_id', existingUser.id)
        .single();

      if (existingMember) {
        return new Response(
          JSON.stringify({ error: 'এই email দিয়ে ইতিমধ্যে একজন team member আছে' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate password
    const tempPassword = generatePassword();

    // Create user or use existing
    let userId: string;
    
    if (existingUser) {
      userId = existingUser.id;
      // Update password for existing user
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword });
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name }
      });

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: 'User তৈরি করতে সমস্যা হয়েছে' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = newUser.user.id;

      // Create profile
      await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: userId,
          full_name,
          must_change_password: true
        }, { onConflict: 'user_id' });
    }

    // Create admin team member
    const { data: teamMember, error: memberError } = await supabaseAdmin
      .from('admin_team_members')
      .insert({
        user_id: userId,
        team_role,
        full_name,
        email: normalizedEmail,
        is_active: true,
        created_by: user.id
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error creating team member:', memberError);
      return new Response(
        JSON.stringify({ error: 'Team member তৈরি করতে সমস্যা হয়েছে' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create default permissions based on role
    const defaultPermissions = getDefaultPermissions(team_role, permissions);
    
    await supabaseAdmin
      .from('admin_team_permissions')
      .insert({
        team_member_id: teamMember.id,
        ...defaultPermissions
      });

    // Try to send email
    let emailSent = false;
    try {
      const smtpConfig = await getSmtpConfig(supabaseAdmin);
      if (smtpConfig) {
        await sendInviteEmail(smtpConfig, normalizedEmail, full_name, tempPassword, team_role);
        emailSent = true;
        console.log(`Invite email sent to ${normalizedEmail}`);
      }
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
    }

    // Log the action
    await supabaseAdmin.rpc('log_admin_action', {
      p_action_type: 'invite_admin_team',
      p_target_type: 'admin_team_member',
      p_target_id: teamMember.id,
      p_target_user_id: userId,
      p_details: { full_name, email: normalizedEmail, team_role, email_sent: emailSent }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: emailSent 
          ? `${full_name} কে সফলভাবে invite করা হয়েছে। Email পাঠানো হয়েছে।`
          : `${full_name} কে সফলভাবে invite করা হয়েছে। Email পাঠানো যায়নি, password: ${tempPassword}`,
        teamMember,
        tempPassword: emailSent ? undefined : tempPassword
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Invite admin team error:', error);
    return new Response(
      JSON.stringify({ error: 'Invite করতে সমস্যা হয়েছে' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDefaultPermissions(role: string, customPermissions?: Record<string, boolean>) {
  const basePermissions = {
    can_view_dashboard: true,
    can_view_clients: false,
    can_manage_clients: false,
    can_delete_clients: false,
    can_view_subscriptions: false,
    can_manage_subscriptions: false,
    can_view_payments: false,
    can_manage_payments: false,
    can_process_refunds: false,
    can_view_pricing: false,
    can_manage_pricing: false,
    can_view_master_data: false,
    can_manage_master_data: false,
    can_view_settings: false,
    can_manage_settings: false,
    can_view_audit_logs: false,
    can_view_feature_flags: false,
    can_manage_feature_flags: false,
    can_view_cms: false,
    can_manage_cms: false,
    can_view_email_templates: false,
    can_manage_email_templates: false,
    can_send_notifications: false,
    can_impersonate_users: false
  };

  // Apply role-based defaults
  switch (role) {
    case 'manager':
      return {
        ...basePermissions,
        can_view_clients: true,
        can_manage_clients: true,
        can_view_subscriptions: true,
        can_manage_subscriptions: true,
        can_view_payments: true,
        can_manage_payments: true,
        can_view_pricing: true,
        can_view_master_data: true,
        can_view_settings: true,
        can_view_audit_logs: true,
        can_send_notifications: true,
        ...customPermissions
      };
    case 'support':
      return {
        ...basePermissions,
        can_view_clients: true,
        can_manage_clients: true,
        can_view_subscriptions: true,
        can_view_payments: true,
        can_send_notifications: true,
        ...customPermissions
      };
    case 'staff':
      return {
        ...basePermissions,
        can_view_clients: true,
        can_view_subscriptions: true,
        can_view_payments: true,
        ...customPermissions
      };
    case 'technical_it':
      return {
        ...basePermissions,
        can_view_settings: true,
        can_manage_settings: true,
        can_view_feature_flags: true,
        can_manage_feature_flags: true,
        can_view_audit_logs: true,
        can_view_cms: true,
        can_manage_cms: true,
        can_impersonate_users: true,
        ...customPermissions
      };
    default:
      return { ...basePermissions, ...customPermissions };
  }
}
