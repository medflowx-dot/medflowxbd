-- Add a restrictive policy for phone_otp_verifications
-- This table should only be accessed by edge functions using service role key
-- Adding a policy that denies all direct access ensures security

CREATE POLICY "No direct access to OTP table"
  ON public.phone_otp_verifications
  FOR ALL
  USING (false);