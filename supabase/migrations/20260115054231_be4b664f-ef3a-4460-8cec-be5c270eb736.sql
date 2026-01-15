-- Update the user's role to owner_admin
UPDATE public.user_roles 
SET role = 'owner_admin' 
WHERE user_id = 'f5f047a0-7db4-4612-b8f3-1915f1ce235f';

-- If no row exists, insert one
INSERT INTO public.user_roles (user_id, role)
SELECT 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'owner_admin'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = 'f5f047a0-7db4-4612-b8f3-1915f1ce235f'
);