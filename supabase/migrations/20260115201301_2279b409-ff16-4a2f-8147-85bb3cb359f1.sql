-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  placeholders JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Owner admins can manage all templates
CREATE POLICY "Owner admins can manage email templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'owner_admin'));

-- Anyone can read active templates (needed by edge functions via service role)
CREATE POLICY "Anyone can read active templates"
ON public.email_templates
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.email_templates (template_key, template_name, subject, html_content, placeholders) VALUES
(
  'staff_invite',
  'Staff Invitation',
  '🎉 You''re Invited! Join {{pharmacy_name}} on {{platform_name}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ''Segoe UI'', Tahoma, sans-serif; line-height: 1.6; color: #333; }
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
      <h1 style="margin: 0;">🎉 Welcome to {{platform_name}}!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">You''ve been invited as a Staff Member</p>
    </div>
    <div class="content">
      <p>Hello <strong>{{staff_name}}</strong>,</p>
      <p>You have been invited to join <strong>{{pharmacy_name}}</strong> as a staff member on {{platform_name}}.</p>
      
      <div class="credentials">
        <h3 style="margin-top: 0; color: #0ea5e9;">📧 Your Login Credentials</h3>
        <div class="credential-item">
          <div class="label">Email</div>
          <div class="value">{{email}}</div>
        </div>
        <div class="credential-item">
          <div class="label">Temporary Password</div>
          <div class="value">{{temp_password}}</div>
        </div>
      </div>

      <a href="{{login_url}}" class="btn">Login to Your Account →</a>

      <div class="warning">
        ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
      </div>
    </div>
    <div class="footer">
      <p>This email was sent by {{platform_name}}</p>
      <p>If you didn''t expect this invitation, please ignore this email.</p>
    </div>
  </div>
</body>
</html>',
  '["staff_name", "email", "temp_password", "pharmacy_name", "platform_name", "login_url"]'::jsonb
),
(
  'password_reset',
  'Password Reset',
  '🔐 Password Reset - {{platform_name}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ''Segoe UI'', Tahoma, sans-serif; line-height: 1.6; color: #333; }
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
      <p>Hello <strong>{{staff_name}}</strong>,</p>
      <p>Your password has been reset by your pharmacy administrator. Please use the new credentials below to log in.</p>
      
      <div class="credentials">
        <h3 style="margin-top: 0; color: #f59e0b;">🔑 Your New Credentials</h3>
        <div class="credential-item">
          <div class="label">Email</div>
          <div class="value">{{email}}</div>
        </div>
        <div class="credential-item">
          <div class="label">New Password</div>
          <div class="value">{{new_password}}</div>
        </div>
      </div>

      <a href="{{login_url}}" class="btn">Login Now →</a>

      <div class="warning">
        ⚠️ <strong>Security Tip:</strong> Please change your password after logging in for better security.
      </div>
    </div>
    <div class="footer">
      <p>This email was sent by {{platform_name}}</p>
      <p>If you didn''t expect this email, please contact your administrator.</p>
    </div>
  </div>
</body>
</html>',
  '["staff_name", "email", "new_password", "platform_name", "login_url"]'::jsonb
),
(
  'test_email',
  'Test Email',
  'SMTP Test Email - {{platform_name}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ''Segoe UI'', Tahoma, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px; }
    .success { background: #d1fae5; border: 1px solid #10b981; border-radius: 6px; padding: 20px; text-align: center; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ SMTP Configuration Test</h1>
    </div>
    <div class="content">
      <div class="success">
        <h2 style="color: #059669; margin: 0;">🎉 Success!</h2>
        <p style="margin: 10px 0 0 0;">If you received this email, your SMTP settings are configured correctly!</p>
      </div>
      <p style="margin-top: 20px; text-align: center;">Sent from {{platform_name}} Admin Panel</p>
    </div>
    <div class="footer">
      <p>This is a test email from {{platform_name}}</p>
    </div>
  </div>
</body>
</html>',
  '["platform_name"]'::jsonb
);