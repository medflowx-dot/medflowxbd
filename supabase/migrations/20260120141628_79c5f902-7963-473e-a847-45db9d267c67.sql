-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the subscription expiry notification job to run daily at 9 AM Bangladesh time (3 AM UTC)
SELECT cron.schedule(
  'subscription-expiry-notifications-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pjowmwyaribfewhbaazl.supabase.co/functions/v1/subscription-expiry-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb3dtd3lhcmliZmV3aGJhYXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTU2NzcsImV4cCI6MjA4Mzk5MTY3N30.D-F39Tn63HPdHTvYIbe2DQ_Jw9zDJj4C4WlZBqn34-A"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);