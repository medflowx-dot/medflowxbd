import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteStaffRequest {
  full_name: string;
  invite_method: 'email' | 'phone';
  email?: string;
  phone?: string;
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

interface SmsConfig {
  api_key: string;
  sender_id: string;
  template: string | null;
}

// Format phone number to Bangladesh format (880XXXXXXXXXX)
function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/\s+/g, "").replace(/-/g, "");
  
  if (formatted.startsWith("+")) {
    formatted = formatted.substring(1);
  }
  
  if (formatted.startsWith("0")) {
    formatted = "880" + formatted.substring(1);
  } else if (!formatted.startsWith("880")) {
    formatted = "880" + formatted;
  }
  
  return formatted;
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

async function getSmsConfig(supabaseAdmin: any): Promise<SmsConfig | null> {
  const { data: settings } = await supabaseAdmin
    .from('platform_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['bulksmsbd_api_key', 'bulksmsbd_sender_id', 'bulksmsbd_enabled', 'sms_template_staff_invite']);

  if (!settings || settings.length === 0) return null;

  const config: Record<string, any> = {};
  settings.forEach((s: any) => {
    let value = s.setting_value;
    if (typeof value === 'string') {
      value = value.replace(/^"|"$/g, '');
    }
    config[s.setting_key] = value;
  });

  const isEnabled = config.bulksmsbd_enabled === true || config.bulksmsbd_enabled === 'true';
  if (!isEnabled || !config.bulksmsbd_api_key) {
    return null;
  }

  return {
    api_key: config.bulksmsbd_api_key,
    sender_id: config.bulksmsbd_sender_id || 'MedFlowX',
    template: config.sms_template_staff_invite || null,
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

async function sendInviteEmail(
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

async function sendInviteSms(smsConfig: SmsConfig, phone: string, message: string): Promise<boolean> {
  try {
    const smsUrl = `https://bulksmsbd.net/api/smsapi?api_key=${smsConfig.api_key}&type=text&number=${phone}&senderid=${smsConfig.sender_id}&message=${encodeURIComponent(message)}`;
    
    const response = await fetch(smsUrl);
    const result = await response.json();
    
    if (result.response_code === 202) {
      console.log('Invite SMS sent successfully to:', phone);
      return true;
    } else {
      console.error('SMS send failed:', result);
      return false;
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
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
    const { full_name, invite_method, email, phone }: InviteStaffRequest = await req.json();

    // Validate input based on invite method
    if (!invite_method || !['email', 'phone'].includes(invite_method)) {
      return new Response(
        JSON.stringify({ error: 'Invalid invite method. Use "email" or "phone".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!full_name || full_name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Full name must be at least 2 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (invite_method === 'email') {
      if (!email || !email.includes('@')) {
        return new Response(
          JSON.stringify({ error: 'Valid email is required for email invitation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (invite_method === 'phone') {
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        return new Response(
          JSON.stringify({ error: 'Valid phone number is required for phone invitation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get the caller's pharmacy name to assign to new staff
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('pharmacy_name')
      .eq('user_id', caller.id)
      .single();

    // Generate a random password for the new user
    const tempPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!';

    // Prepare user email - for phone invites, create a placeholder email
    let userEmail: string;
    let formattedPhone: string | null = null;

    if (invite_method === 'email') {
      userEmail = email!.toLowerCase().trim();
    } else {
      formattedPhone = formatPhoneNumber(phone!);
      userEmail = `${formattedPhone}@phone.medflowx.local`;
    }

    // Create the new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        invited_by: caller.id,
        invite_method: invite_method,
      },
    });

    if (createError) {
      // Check for duplicate email
      if (createError.message.includes('already been registered')) {
        return new Response(
          JSON.stringify({ error: invite_method === 'email' ? 'A user with this email already exists' : 'A user with this phone number already exists' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('Failed to create user');
    }

    // Update the profile with pharmacy name and phone (profile is auto-created by trigger)
    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const profileUpdate: Record<string, any> = { 
      full_name: full_name.trim(),
      pharmacy_name: callerProfile?.pharmacy_name,
      must_change_password: true, // Force password change on first login
    };

    if (invite_method === 'phone' && formattedPhone) {
      profileUpdate.phone = formattedPhone;
      profileUpdate.phone_verified = true; // Consider phone verified since admin invited them
    }

    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('user_id', newUser.user.id);

    if (profileUpdateError) {
      console.error('Failed to update profile:', profileUpdateError);
      // Try upsert as fallback
      const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: newUser.user.id,
          ...profileUpdate,
        }, { onConflict: 'user_id' });
      
      if (upsertError) {
        console.error('Failed to upsert profile:', upsertError);
      }
    }

    console.log('Profile updated for user:', newUser.user.id, 'pharmacy_name:', callerProfile?.pharmacy_name);

    // Update role to client_staff (trigger creates with client_admin by default)
    const { error: roleUpdateError } = await supabaseAdmin
      .from('user_roles')
      .update({ role: 'client_staff' })
      .eq('user_id', newUser.user.id);

    if (roleUpdateError) {
      console.error('Failed to update role:', roleUpdateError);
    }

    // Send credentials based on invite method
    let credentialsSent = false;
    const loginUrl = 'https://medflowxbd.lovable.app/login';

    if (invite_method === 'email') {
      // Get SMTP config and email template
      const smtpConfig = await getSmtpConfig(supabaseAdmin);
      const template = await getEmailTemplate(supabaseAdmin, 'staff_invite');
      
      if (smtpConfig && template) {
        try {
          const templateData = {
            staff_name: full_name.trim(),
            email: userEmail,
            temp_password: tempPassword,
            pharmacy_name: callerProfile?.pharmacy_name || 'our pharmacy',
            platform_name: smtpConfig.smtp_from_name,
            login_url: loginUrl,
          };
          await sendInviteEmail(smtpConfig, template, templateData);
          credentialsSent = true;
          console.log('Invite email sent successfully to:', userEmail);
        } catch (emailError) {
          console.error('Failed to send invite email:', emailError);
        }
      } else {
        console.log('SMTP not configured or template not found, skipping invite email');
      }
    } else {
      // Send SMS for phone invite
      const smsConfig = await getSmsConfig(supabaseAdmin);
      
      if (smsConfig && formattedPhone) {
        // Use custom template if available, otherwise use default
        let smsMessage: string;
        
        if (smsConfig.template) {
          // Replace placeholders in custom template
          smsMessage = smsConfig.template
            .replace(/\{\{staff_name\}\}/g, full_name.trim())
            .replace(/\{\{phone\}\}/g, formattedPhone)
            .replace(/\{\{password\}\}/g, tempPassword)
            .replace(/\{\{pharmacy_name\}\}/g, callerProfile?.pharmacy_name || '')
            .replace(/\{\{login_url\}\}/g, loginUrl)
            .replace(/\{\{platform_name\}\}/g, 'MedFlowX');
        } else {
          // Default template
          smsMessage = `MedFlowX স্টাফ অ্যাক্সেস:
Login: ${loginUrl}
Phone: ${formattedPhone}
Pass: ${tempPassword}
প্রথম লগইনে পাসওয়ার্ড পরিবর্তন করুন।`;
        }

        credentialsSent = await sendInviteSms(smsConfig, formattedPhone, smsMessage);
      } else {
        console.log('SMS not configured, skipping invite SMS');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: credentialsSent 
          ? (invite_method === 'email' 
              ? 'Staff member invited successfully. Login credentials sent via email.'
              : 'Staff member invited successfully. Login credentials sent via SMS.')
          : 'Staff member created successfully. Please share the credentials manually.',
        user_id: newUser.user.id,
        temp_password: credentialsSent ? undefined : tempPassword, // Only return if credentials not sent
        credentials_sent: credentialsSent,
        invite_method: invite_method,
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
