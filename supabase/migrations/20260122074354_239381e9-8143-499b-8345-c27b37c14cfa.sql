-- Allow client_admins to view roles of users in their pharmacy
CREATE POLICY "Admins can view staff roles in their pharmacy"
ON public.user_roles
FOR SELECT
USING (
  -- Owner admins can see all
  has_role(auth.uid(), 'owner_admin'::app_role)
  OR
  -- Client admins can see roles of users in their pharmacy
  (
    has_role(auth.uid(), 'client_admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      JOIN public.profiles staff_profile ON admin_profile.pharmacy_name = staff_profile.pharmacy_name
      WHERE admin_profile.user_id = auth.uid()
      AND staff_profile.user_id = user_roles.user_id
      AND admin_profile.pharmacy_name IS NOT NULL
    )
  )
);