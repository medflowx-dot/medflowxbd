-- Add payment_type column to supplier_payments table
ALTER TABLE supplier_payments 
ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'due_payment';

-- Add constraint to ensure valid payment types
ALTER TABLE supplier_payments 
ADD CONSTRAINT supplier_payments_payment_type_check 
CHECK (payment_type IN ('due_payment', 'advance', 'others'));

-- Add comment for documentation
COMMENT ON COLUMN supplier_payments.payment_type IS 'Type of payment: due_payment (paying off debt), advance (prepayment for future orders), others (miscellaneous payments)';