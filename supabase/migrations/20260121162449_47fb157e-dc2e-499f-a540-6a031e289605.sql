-- Create table for storing OTP verification codes
CREATE TABLE public.phone_otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'signup', -- 'signup', 'login', 'reset'
  is_verified BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX idx_phone_otp_phone_purpose ON public.phone_otp_verifications (phone, purpose, is_verified);
CREATE INDEX idx_phone_otp_expires ON public.phone_otp_verifications (expires_at);

-- Enable RLS
ALTER TABLE public.phone_otp_verifications ENABLE ROW LEVEL SECURITY;

-- Only allow inserts and selects via edge functions (no direct user access)
-- Edge functions use service role key which bypasses RLS

-- Create table for storing user PINs (only for app/mobile)
CREATE TABLE public.user_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  device_id TEXT, -- Optional: to track which device the PIN is for
  is_active BOOLEAN NOT NULL DEFAULT true,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

-- Users can manage their own PIN
CREATE POLICY "Users can view their own PIN record"
  ON public.user_pins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own PIN"
  ON public.user_pins
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PIN"
  ON public.user_pins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PIN"
  ON public.user_pins
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add phone column to profiles table if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Create trigger for updated_at
CREATE TRIGGER update_user_pins_updated_at
  BEFORE UPDATE ON public.user_pins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to clean up expired OTPs (can be called by a cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.phone_otp_verifications
  WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$;