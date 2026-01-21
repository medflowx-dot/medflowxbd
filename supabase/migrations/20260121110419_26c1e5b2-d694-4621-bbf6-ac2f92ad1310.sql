-- Migrate existing customer dues to the new customer_dues table
-- Insert initial due = current_total_due + sum_of_payments (so that trigger recalculates correctly)

-- First temporarily disable the trigger to avoid double calculation
ALTER TABLE public.customer_dues DISABLE TRIGGER recalculate_due_on_dues_change;

-- Insert migration dues for all customers with positive balance or existing payments
INSERT INTO public.customer_dues (user_id, customer_id, amount, notes, due_date, created_at)
SELECT 
  c.user_id,
  c.id,
  c.total_due + COALESCE((SELECT SUM(amount) FROM customer_payments WHERE customer_id = c.id), 0),
  'Initial balance (migrated from legacy system)',
  c.created_at,
  c.created_at
FROM customers c
WHERE c.is_active = true 
  AND (c.total_due > 0 OR EXISTS (SELECT 1 FROM customer_payments WHERE customer_id = c.id))
  AND NOT EXISTS (SELECT 1 FROM customer_dues WHERE customer_id = c.id);

-- Re-enable the trigger
ALTER TABLE public.customer_dues ENABLE TRIGGER recalculate_due_on_dues_change;