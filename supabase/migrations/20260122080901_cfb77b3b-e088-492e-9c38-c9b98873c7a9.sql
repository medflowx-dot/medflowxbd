-- Create a security definer function to get user's pharmacy name
CREATE OR REPLACE FUNCTION public.get_user_pharmacy_name(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pharmacy_name FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view staff profiles in their pharmacy" ON public.profiles;

-- Create a new policy without the subquery (uses the security definer function)
CREATE POLICY "Admins can view staff profiles in their pharmacy" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'owner_admin'::app_role) 
  OR (auth.uid() = user_id) 
  OR (
    has_role(auth.uid(), 'client_admin'::app_role) 
    AND pharmacy_name IS NOT NULL 
    AND pharmacy_name = get_user_pharmacy_name(auth.uid())
  )
);