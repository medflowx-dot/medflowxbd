-- Insert payment success email template
INSERT INTO public.email_templates (template_key, template_name, subject, html_content, placeholders, is_active)
VALUES (
  'payment_success',
  'Payment Success Notification',
  'পেমেন্ট সফল - {{plan_name}} প্ল্যান অ্যাক্টিভ হয়েছে!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
    .plan-box { background: white; border: 2px solid #22c55e; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .plan-name { font-size: 24px; font-weight: bold; color: #16a34a; }
    .amount { font-size: 32px; font-weight: bold; color: #1f2937; }
    .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .details { background: white; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .details-row:last-child { border-bottom: none; }
    .check-icon { color: #22c55e; font-size: 48px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="check-icon">✓</div>
      <h1>পেমেন্ট সফল হয়েছে!</h1>
    </div>
    <div class="content">
      <p>প্রিয় {{user_name}},</p>
      <p>আপনার পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে এবং আপনার সাবস্ক্রিপশন অ্যাক্টিভ করা হয়েছে।</p>
      
      <div class="plan-box">
        <div class="plan-name">{{plan_name}}</div>
        <div class="amount">৳{{amount}}</div>
      </div>

      <div class="details">
        <div class="details-row">
          <span>Transaction ID:</span>
          <strong>{{transaction_id}}</strong>
        </div>
        <div class="details-row">
          <span>পেমেন্ট মেথড:</span>
          <strong>{{payment_method}}</strong>
        </div>
        <div class="details-row">
          <span>অ্যাক্টিভেশন তারিখ:</span>
          <strong>{{activation_date}}</strong>
        </div>
        <div class="details-row">
          <span>মেয়াদ শেষ:</span>
          <strong>{{expiry_date}}</strong>
        </div>
      </div>

      <p>এখন থেকে আপনি MedFlowX এর সকল ফিচার ব্যবহার করতে পারবেন।</p>
      
      <center>
        <a href="{{dashboard_url}}" class="button">ড্যাশবোর্ডে যান</a>
      </center>

      <p>কোন সমস্যা হলে আমাদের সাপোর্ট টিমে যোগাযোগ করুন।</p>
      
      <p>ধন্যবাদ,<br>MedFlowX টিম</p>
    </div>
    <div class="footer">
      <p>© {{current_year}} MedFlowX. All rights reserved.</p>
      <p>এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।</p>
    </div>
  </div>
</body>
</html>',
  '["user_name", "plan_name", "amount", "transaction_id", "payment_method", "activation_date", "expiry_date", "dashboard_url", "current_year"]',
  true
) ON CONFLICT (template_key) DO UPDATE SET 
  html_content = EXCLUDED.html_content,
  subject = EXCLUDED.subject,
  placeholders = EXCLUDED.placeholders;