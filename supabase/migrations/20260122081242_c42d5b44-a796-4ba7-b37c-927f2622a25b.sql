-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "No direct access to login attempts" ON public.login_attempts;

-- Create policy for owner admins to view login attempts
CREATE POLICY "Owner admins can view login attempts"
ON public.login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'owner_admin'::app_role));

-- Create policy for owner admins to update login attempts (unlock accounts)
CREATE POLICY "Owner admins can update login attempts"
ON public.login_attempts
FOR UPDATE
USING (has_role(auth.uid(), 'owner_admin'::app_role));

-- Edge functions still need access via service role - no policy needed as they bypass RLS