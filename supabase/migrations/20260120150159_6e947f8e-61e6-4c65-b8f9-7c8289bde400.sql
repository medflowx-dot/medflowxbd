-- Schedule daily SMS balance check at 9:00 AM BST (3:00 AM UTC)
SELECT cron.schedule(
  'check-sms-balance-daily',
  '0 3 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://pjowmwyaribfewhbaazl.supabase.co/functions/v1/check-sms-balance',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb3dtd3lhcmliZmV3aGJhYXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTU2NzcsImV4cCI6MjA4Mzk5MTY3N30.D-F39Tn63HPdHTvYIbe2DQ_Jw9zDJj4C4WlZBqn34-A'
      ),
      body:='{}'::jsonb
    ) as request_id;
  $$
);