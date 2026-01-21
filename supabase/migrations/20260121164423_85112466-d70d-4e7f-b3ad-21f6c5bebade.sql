-- Create login attempts tracking table
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- phone or email
  identifier_type TEXT NOT NULL DEFAULT 'phone', -- 'phone' or 'email'
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on identifier
CREATE UNIQUE INDEX idx_login_attempts_identifier ON public.login_attempts(identifier);

-- Create index for cleanup queries
CREATE INDEX idx_login_attempts_locked_until ON public.login_attempts(locked_until);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- No direct access - only through edge functions with service role
CREATE POLICY "No direct access to login attempts"
ON public.login_attempts
FOR ALL
USING (false);

-- Function to clean up old login attempts (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE locked_until < now() - INTERVAL '1 day'
    AND attempts = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;