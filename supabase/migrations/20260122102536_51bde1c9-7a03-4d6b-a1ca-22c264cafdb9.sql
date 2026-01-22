-- Add must_change_password column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'must_change_password'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN must_change_password boolean DEFAULT false;
  END IF;
END $$;

-- Update the existing staff profile that was created without pharmacy_name
UPDATE public.profiles 
SET pharmacy_name = 'New', 
    phone = '8801331277449', 
    phone_verified = true
WHERE user_id = '8517de9b-1d95-4ad0-8d05-2cd62f1e1107';