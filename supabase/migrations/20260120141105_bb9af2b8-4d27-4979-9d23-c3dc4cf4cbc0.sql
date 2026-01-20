-- Insert subscription expiry reminder email template
INSERT INTO email_templates (template_key, template_name, subject, html_content, placeholders, is_active)
VALUES (
  'subscription_expiry_reminder',
  'Subscription Expiry Reminder',
  'আপনার সাবস্ক্রিপশন {{days_remaining}} দিনের মধ্যে শেষ হবে - MedFlowX',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">MedFlowX</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">সাবস্ক্রিপশন রিমাইন্ডার</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <h2 style="color: #f59e0b; margin-top: 0;">⚠️ আপনার সাবস্ক্রিপশন শীঘ্রই শেষ হবে!</h2>
    
    <p>প্রিয় {{pharmacy_name}},</p>
    
    <p>আপনার MedFlowX <strong>{{plan_type}}</strong> সাবস্ক্রিপশন আগামী <strong style="color: #f59e0b;">{{days_remaining}} দিনের</strong> মধ্যে শেষ হতে যাচ্ছে।</p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0;"><strong>মেয়াদ শেষ:</strong> {{expiry_date}}</p>
    </div>
    
    <p>সাবস্ক্রিপশন শেষ হলে আপনি আর MedFlowX এর সেবা ব্যবহার করতে পারবেন না। এখনই রিনিউ করুন এবং নিরবচ্ছিন্ন সেবা উপভোগ করুন।</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{billing_url}}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">এখনই রিনিউ করুন</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">কোনো সমস্যা হলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p>
  </div>
  
  <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="margin: 0; color: #6b7280; font-size: 12px;">© 2024 MedFlowX. সর্বস্বত্ব সংরক্ষিত।</p>
  </div>
</body>
</html>',
  '["pharmacy_name", "plan_type", "days_remaining", "expiry_date", "billing_url"]'::jsonb,
  true
)
ON CONFLICT (template_key) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  subject = EXCLUDED.subject,
  placeholders = EXCLUDED.placeholders;

-- Insert subscription expired template
INSERT INTO email_templates (template_key, template_name, subject, html_content, placeholders, is_active)
VALUES (
  'subscription_expired',
  'Subscription Expired',
  'আপনার সাবস্ক্রিপশন মেয়াদ শেষ - MedFlowX',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">MedFlowX</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">সাবস্ক্রিপশন বিজ্ঞপ্তি</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <h2 style="color: #ef4444; margin-top: 0;">❌ আপনার সাবস্ক্রিপশন মেয়াদ শেষ হয়ে গেছে!</h2>
    
    <p>প্রিয় {{pharmacy_name}},</p>
    
    <p>আপনার MedFlowX <strong>{{plan_type}}</strong> সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে।</p>
    
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0;"><strong>মেয়াদ শেষ হয়েছে:</strong> {{expiry_date}}</p>
    </div>
    
    <p>আপনার অ্যাকাউন্ট পুনরায় সক্রিয় করতে এখনই রিনিউ করুন।</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{billing_url}}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">এখনই রিনিউ করুন</a>
    </div>
  </div>
  
  <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="margin: 0; color: #6b7280; font-size: 12px;">© 2024 MedFlowX. সর্বস্বত্ব সংরক্ষিত।</p>
  </div>
</body>
</html>',
  '["pharmacy_name", "plan_type", "expiry_date", "billing_url"]'::jsonb,
  true
)
ON CONFLICT (template_key) DO UPDATE SET
  html_content = EXCLUDED.html_content,
  subject = EXCLUDED.subject,
  placeholders = EXCLUDED.placeholders;

-- Create notification_logs table to track sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'email' or 'sms'
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  days_before_expiry INTEGER,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_type ON notification_logs(user_id, notification_type, sent_at);

-- Enable RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Only owner admins can view notification logs
CREATE POLICY "Owner admins can manage notification logs"
ON notification_logs
FOR ALL
USING (has_role(auth.uid(), 'owner_admin'::app_role));