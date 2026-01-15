import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteStaffRequest {
  email: string;
  full_name: string;
  admin_user_id: string;
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

async function sendInviteEmail(
  smtpConfig: SmtpConfig,
  toEmail: string,
  staffName: string,
  tempPassword: string,
  pharmacyName: string,
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
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
        .credentials { background: white; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .label { color: #64748b; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; font-weight: 600; color: #0f172a; background: #f1f5f9; padding: 8px 12px; border-radius: 4px; margin-top: 4px; }
        .btn { display: inline-block; background: #0ea5e9; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin-top: 20px; font-size: 13px; color: #92400e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 Welcome to ${smtpConfig.smtp_from_name}!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You've been invited as a Staff Member</p>
        </div>
        <div class="content">
          <p>Hello <strong>${staffName}</strong>,</p>
          <p>You have been invited to join <strong>${pharmacyName || 'our pharmacy'}</strong> as a staff member on ${smtpConfig.smtp_from_name}.</p>
          
          <div class="credentials">
            <h3 style="margin-top: 0; color: #0ea5e9;">📧 Your Login Credentials</h3>
            <div class="credential-item">
              <div class="label">Email</div>
              <div class="value">${toEmail}</div>
            </div>
            <div class="credential-item">
              <div class="label">Temporary Password</div>
              <div class="value">${tempPassword}</div>
            </div>
          </div>

          <a href="${loginUrl}" class="btn">Login to Your Account →</a>

          <div class="warning">
            ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
          </div>
        </div>
        <div class="footer">
          <p>This email was sent by ${smtpConfig.smtp_from_name}</p>
          <p>If you didn't expect this invitation, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await client.send({
    from: `${smtpConfig.smtp_from_name} <${smtpConfig.smtp_from_email}>`,
    to: toEmail,
    subject: `🎉 You're Invited! Join ${pharmacyName || 'our pharmacy'} on ${smtpConfig.smtp_from_name}`,
    html: html,
  });

  await client.close();
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

    // Get SMTP config and send invite email
    const smtpConfig = await getSmtpConfig(supabaseAdmin);
    let emailSent = false;
    
    if (smtpConfig) {
      try {
        const loginUrl = 'https://medflowxbd.lovable.app/login';
        await sendInviteEmail(
          smtpConfig,
          email.toLowerCase().trim(),
          full_name.trim(),
          tempPassword,
          callerProfile?.pharmacy_name || '',
          loginUrl
        );
        emailSent = true;
        console.log('Invite email sent successfully to:', email);
      } catch (emailError) {
        console.error('Failed to send invite email:', emailError);
        // Don't fail the whole operation if email fails
      }
    } else {
      console.log('SMTP not configured, skipping invite email');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: emailSent 
          ? 'Staff member invited successfully. Login credentials sent via email.'
          : 'Staff member created successfully. Please share the credentials manually.',
        user_id: newUser.user.id,
        temp_password: emailSent ? undefined : tempPassword, // Only return if email not sent
        email_sent: emailSent,
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
