-- Fix the current user's profile
UPDATE profiles 
SET full_name = 'Niloy', pharmacy_name = 'Niloy Pharmacy'
WHERE user_id = '9beca866-72dd-4ac6-96a1-5612dd8c1c52';

-- Delete the duplicate trial subscription (keep the monthly one)
DELETE FROM subscriptions 
WHERE user_id = '9beca866-72dd-4ac6-96a1-5612dd8c1c52' 
AND plan_type = 'trial';