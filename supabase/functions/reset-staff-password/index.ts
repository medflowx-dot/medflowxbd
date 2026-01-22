import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetRequest {
  staff_user_id: string;
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
  const { data: settings } = await supabaseAdmin
    .from('platform_settings')
    .select('setting_key, setting_value')
    .in('setting_key', [
      'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password',
      'smtp_from_email', 'smtp_from_name', 'smtp_secure'
    ]);

  if (!settings || settings.length === 0) return null;

  const config: Record<string, any> = {};
  settings.forEach((s: any) => {
    let value = s.setting_value;
    if (typeof value === 'string') {
      value = value.replace(/^"|"$/g, '');
    }
    config[s.setting_key] = value;
  });

  if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
    return null;
  }

  return {
    smtp_host: config.smtp_host,
    smtp_port: Number(config.smtp_port) || 587,
    smtp_user: config.smtp_user,
    smtp_password: config.smtp_password,
    smtp_from_email: config.smtp_from_email || config.smtp_user,
    smtp_from_name: config.smtp_from_name || 'MedFlowX',
    smtp_secure: config.smtp_secure === true || config.smtp_secure === 'true',
  };
}

async function getEmailTemplate(supabaseAdmin: any, templateKey: string): Promise<{ subject: string; html_content: string } | null> {
  const { data } = await supabaseAdmin
    .from('email_templates')
    .select('subject, html_content')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .single();
  
  return data;
}

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });
  return result;
}

async function sendPasswordResetEmail(
  smtpConfig: SmtpConfig,
  template: { subject: string; html_content: string },
  data: Record<string, string>
): Promise<void> {
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

  const subject = replacePlaceholders(template.subject, data);
  const html = replacePlaceholders(template.html_content, data);

  await client.send({
    from: `${smtpConfig.smtp_from_name} <${smtpConfig.smtp_from_email}>`,
    to: data.email,
    subject: subject,
    html: html,
  });

  await client.close();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify caller
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

    // Check caller permission
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (!callerRole || (callerRole.role !== 'client_admin' && callerRole.role !== 'owner_admin')) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to reset passwords' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { staff_user_id }: ResetRequest = await req.json();

    if (!staff_user_id) {
      return new Response(
        JSON.stringify({ error: 'Staff user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify staff belongs to same pharmacy (for client_admin)
    if (callerRole.role === 'client_admin') {
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

      if (!callerProfile?.pharmacy_name || callerProfile.pharmacy_name !== staffProfile?.pharmacy_name) {
        return new Response(
          JSON.stringify({ error: 'You can only reset passwords for your own pharmacy staff' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Use fixed temporary password (same as invite-staff)
    const newPassword = '123456';

    // Update user password
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      staff_user_id,
      { password: newPassword }
    );

    if (updateError) {
      throw updateError;
    }

    // Set must_change_password flag
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ must_change_password: true })
      .eq('user_id', staff_user_id);

    if (profileError) {
      console.error('Failed to set must_change_password flag:', profileError);
    }

    // Also delete any existing PIN (force re-setup for security)
    await supabaseAdmin
      .from('user_pins')
      .delete()
      .eq('user_id', staff_user_id);

    // Get staff details for email
    const { data: staffProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', staff_user_id)
      .single();

    // Send email notification
    const smtpConfig = await getSmtpConfig(supabaseAdmin);
    const template = await getEmailTemplate(supabaseAdmin, 'password_reset');
    let emailSent = false;

    if (smtpConfig && template && updatedUser.user?.email) {
      try {
        const loginUrl = 'https://medflowxbd.lovable.app/login';
        const templateData = {
          staff_name: staffProfile?.full_name || 'Staff Member',
          email: updatedUser.user.email,
          new_password: newPassword,
          platform_name: smtpConfig.smtp_from_name,
          login_url: loginUrl,
        };
        await sendPasswordResetEmail(smtpConfig, template, templateData);
        emailSent = true;
        console.log('Password reset email sent to:', updatedUser.user.email);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: emailSent
          ? 'Password reset successfully. New credentials sent via email.'
          : 'Password reset successfully. Please share the new password manually.',
        new_password: emailSent ? undefined : newPassword,
        email_sent: emailSent,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error resetting password:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
