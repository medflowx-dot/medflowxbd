-- Update test subscription to expire in 2 days
UPDATE subscriptions 
SET current_period_end = NOW() + INTERVAL '2 days'
WHERE user_id = '6f1ea21f-93ac-41e2-938f-1b162ed8f8af';

-- Add phone number to the test user's profile for SMS testing
UPDATE profiles 
SET phone = '01700000000'
WHERE user_id = '6f1ea21f-93ac-41e2-938f-1b162ed8f8af' AND (phone IS NULL OR phone = '');