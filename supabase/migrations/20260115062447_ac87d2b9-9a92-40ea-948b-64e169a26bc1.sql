-- Allow users to see impersonation sessions targeting them
CREATE POLICY "Users can view impersonation sessions targeting them"
    ON public.impersonation_sessions FOR SELECT
    USING (target_user_id = auth.uid());