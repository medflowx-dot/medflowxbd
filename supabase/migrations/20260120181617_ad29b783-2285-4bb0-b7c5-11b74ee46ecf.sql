-- Add UPDATE policy for customer_payments table
CREATE POLICY "Users can update pharmacy customer payments" 
ON public.customer_payments 
FOR UPDATE 
USING (user_id = get_pharmacy_owner_id(auth.uid()));