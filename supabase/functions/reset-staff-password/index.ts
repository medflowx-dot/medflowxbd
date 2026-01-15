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

async function sendPasswordResetEmail(
  smtpConfig: SmtpConfig,
  toEmail: string,
  staffName: string,
  newPassword: string,
  loginUrl: string
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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
        .credentials { background: white; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .label { color: #64748b; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; font-weight: 600; color: #0f172a; background: #f1f5f9; padding: 8px 12px; border-radius: 4px; margin-top: 4px; }
        .btn { display: inline-block; background: #f59e0b; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin-top: 20px; font-size: 13px; color: #92400e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🔐 Password Reset</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your password has been reset</p>
        </div>
        <div class="content">
          <p>Hello <strong>${staffName}</strong>,</p>
          <p>Your password has been reset by your pharmacy administrator. Please use the new credentials below to log in.</p>
          
          <div class="credentials">
            <h3 style="margin-top: 0; color: #f59e0b;">🔑 Your New Credentials</h3>
            <div class="credential-item">
              <div class="label">Email</div>
              <div class="value">${toEmail}</div>
            </div>
            <div class="credential-item">
              <div class="label">New Password</div>
              <div class="value">${newPassword}</div>
            </div>
          </div>

          <a href="${loginUrl}" class="btn">Login Now →</a>

          <div class="warning">
            ⚠️ <strong>Security Tip:</strong> Please change your password after logging in for better security.
          </div>
        </div>
        <div class="footer">
          <p>This email was sent by ${smtpConfig.smtp_from_name}</p>
          <p>If you didn't expect this email, please contact your administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await client.send({
    from: `${smtpConfig.smtp_from_name} <${smtpConfig.smtp_from_email}>`,
    to: toEmail,
    subject: `🔐 Password Reset - ${smtpConfig.smtp_from_name}`,
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

    // Generate new password
    const newPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!';

    // Update user password
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      staff_user_id,
      { password: newPassword }
    );

    if (updateError) {
      throw updateError;
    }

    // Get staff details for email
    const { data: staffProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', staff_user_id)
      .single();

    // Send email notification
    const smtpConfig = await getSmtpConfig(supabaseAdmin);
    let emailSent = false;

    if (smtpConfig && updatedUser.user?.email) {
      try {
        const loginUrl = 'https://medflowxbd.lovable.app/login';
        await sendPasswordResetEmail(
          smtpConfig,
          updatedUser.user.email,
          staffProfile?.full_name || 'Staff Member',
          newPassword,
          loginUrl
        );
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
