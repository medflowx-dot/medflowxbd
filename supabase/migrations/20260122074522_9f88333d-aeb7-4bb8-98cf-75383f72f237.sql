-- Allow client_admins to view profiles of users in their pharmacy
CREATE POLICY "Admins can view staff profiles in their pharmacy"
ON public.profiles
FOR SELECT
USING (
  -- Owner admins can see all (already covered by existing policy)
  has_role(auth.uid(), 'owner_admin'::app_role)
  OR
  -- Users can see their own profile (already covered, but keep for completeness)
  auth.uid() = user_id
  OR
  -- Client admins can see profiles of users in their pharmacy
  (
    has_role(auth.uid(), 'client_admin'::app_role)
    AND pharmacy_name IS NOT NULL
    AND pharmacy_name = (
      SELECT pharmacy_name FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);