-- Update Niloy's subscription to expire in 2 days to trigger SMS notification
UPDATE subscriptions 
SET current_period_end = NOW() + INTERVAL '2 days'
WHERE user_id = '9beca866-72dd-4ac6-96a1-5612dd8c1c52';