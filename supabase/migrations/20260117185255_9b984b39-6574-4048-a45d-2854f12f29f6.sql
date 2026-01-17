-- Fix MD Ariful Islam's subscription with correct monthly data
UPDATE subscriptions 
SET 
  amount = 299,
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '30 days',
  trial_ends_at = NULL
WHERE id = '1bcc3802-0100-4578-b611-48eac8564b21';