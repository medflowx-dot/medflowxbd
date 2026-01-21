-- First, clean up orphaned data from soft-deleted (is_active=false) customers
DELETE FROM public.customer_payments 
WHERE customer_id IN (SELECT id FROM public.customers WHERE is_active = false);

DELETE FROM public.customer_dues 
WHERE customer_id IN (SELECT id FROM public.customers WHERE is_active = false);

-- Now delete the soft-deleted customers (they are marked is_active=false but never actually deleted)
DELETE FROM public.customers WHERE is_active = false;

-- Clean up orphaned data from soft-deleted suppliers
DELETE FROM public.supplier_payments 
WHERE supplier_id IN (SELECT id FROM public.suppliers WHERE is_active = false);

DELETE FROM public.supplier_purchases 
WHERE supplier_id IN (SELECT id FROM public.suppliers WHERE is_active = false);

-- Now delete the soft-deleted suppliers
DELETE FROM public.suppliers WHERE is_active = false;

-- Add proper foreign key constraints with CASCADE if they don't exist
-- For customer_payments -> customers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_payments_customer_id_fkey_cascade'
        AND table_name = 'customer_payments'
    ) THEN
        -- Drop existing constraint if any
        ALTER TABLE public.customer_payments 
        DROP CONSTRAINT IF EXISTS customer_payments_customer_id_fkey;
        
        -- Add new constraint with CASCADE
        ALTER TABLE public.customer_payments
        ADD CONSTRAINT customer_payments_customer_id_fkey_cascade
        FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- For customer_dues -> customers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_dues_customer_id_fkey_cascade'
        AND table_name = 'customer_dues'
    ) THEN
        -- Drop existing constraint if any
        ALTER TABLE public.customer_dues 
        DROP CONSTRAINT IF EXISTS customer_dues_customer_id_fkey;
        
        -- Add new constraint with CASCADE
        ALTER TABLE public.customer_dues
        ADD CONSTRAINT customer_dues_customer_id_fkey_cascade
        FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- For supplier_payments -> suppliers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'supplier_payments_supplier_id_fkey_cascade'
        AND table_name = 'supplier_payments'
    ) THEN
        -- Drop existing constraint if any
        ALTER TABLE public.supplier_payments 
        DROP CONSTRAINT IF EXISTS supplier_payments_supplier_id_fkey;
        
        -- Add new constraint with CASCADE
        ALTER TABLE public.supplier_payments
        ADD CONSTRAINT supplier_payments_supplier_id_fkey_cascade
        FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- For supplier_purchases -> suppliers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'supplier_purchases_supplier_id_fkey_cascade'
        AND table_name = 'supplier_purchases'
    ) THEN
        -- Drop existing constraint if any
        ALTER TABLE public.supplier_purchases 
        DROP CONSTRAINT IF EXISTS supplier_purchases_supplier_id_fkey;
        
        -- Add new constraint with CASCADE
        ALTER TABLE public.supplier_purchases
        ADD CONSTRAINT supplier_purchases_supplier_id_fkey_cascade
        FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;
    END IF;
END $$;