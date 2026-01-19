-- Update the subscription RLS policy to use get_pharmacy_owner_id
-- This allows both admin and their staff to read the admin's subscription

-- First drop the existing policy
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

-- Create new policy that uses get_pharmacy_owner_id
CREATE POLICY "Users can view pharmacy subscription" 
ON public.subscriptions 
FOR SELECT 
USING (
  user_id = get_pharmacy_owner_id(auth.uid()) 
  OR auth.uid() = user_id
  OR has_role(auth.uid(), 'owner_admin'::app_role)
);