-- Create or replace function to update supplier totals after purchase changes
CREATE OR REPLACE FUNCTION public.update_supplier_totals_from_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Recalculate totals for the deleted purchase's supplier
    UPDATE suppliers SET
      total_paid = COALESCE((
        SELECT SUM(paid_amount) FROM supplier_purchases WHERE supplier_id = OLD.supplier_id
      ), 0),
      total_due = COALESCE((
        SELECT SUM(due_amount) FROM supplier_purchases WHERE supplier_id = OLD.supplier_id
      ), 0),
      updated_at = now()
    WHERE id = OLD.supplier_id;
    RETURN OLD;
  ELSE
    -- Recalculate totals for the new/updated purchase's supplier
    UPDATE suppliers SET
      total_paid = COALESCE((
        SELECT SUM(paid_amount) FROM supplier_purchases WHERE supplier_id = NEW.supplier_id
      ), 0),
      total_due = COALESCE((
        SELECT SUM(due_amount) FROM supplier_purchases WHERE supplier_id = NEW.supplier_id
      ), 0),
      updated_at = now()
    WHERE id = NEW.supplier_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create or replace function to update supplier totals after payment changes
CREATE OR REPLACE FUNCTION public.update_supplier_totals_from_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Recalculate totals for the deleted payment's supplier
    UPDATE suppliers SET
      total_paid = (
        COALESCE((SELECT SUM(paid_amount) FROM supplier_purchases WHERE supplier_id = OLD.supplier_id), 0) +
        COALESCE((SELECT SUM(amount) FROM supplier_payments WHERE supplier_id = OLD.supplier_id), 0)
      ),
      total_due = GREATEST(0, 
        COALESCE((SELECT SUM(total_amount) FROM supplier_purchases WHERE supplier_id = OLD.supplier_id), 0) -
        COALESCE((SELECT SUM(paid_amount) FROM supplier_purchases WHERE supplier_id = OLD.supplier_id), 0) -
        COALESCE((SELECT SUM(amount) FROM supplier_payments WHERE supplier_id = OLD.supplier_id), 0)
      ),
      updated_at = now()
    WHERE id = OLD.supplier_id;
    RETURN OLD;
  ELSE
    -- Recalculate totals for the new/updated payment's supplier
    UPDATE suppliers SET
      total_paid = (
        COALESCE((SELECT SUM(paid_amount) FROM supplier_purchases WHERE supplier_id = NEW.supplier_id), 0) +
        COALESCE((SELECT SUM(amount) FROM supplier_payments WHERE supplier_id = NEW.supplier_id), 0)
      ),
      total_due = GREATEST(0, 
        COALESCE((SELECT SUM(total_amount) FROM supplier_purchases WHERE supplier_id = NEW.supplier_id), 0) -
        COALESCE((SELECT SUM(paid_amount) FROM supplier_purchases WHERE supplier_id = NEW.supplier_id), 0) -
        COALESCE((SELECT SUM(amount) FROM supplier_payments WHERE supplier_id = NEW.supplier_id), 0)
      ),
      updated_at = now()
    WHERE id = NEW.supplier_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_supplier_on_purchase ON supplier_purchases;
DROP TRIGGER IF EXISTS update_supplier_on_payment ON supplier_payments;

-- Create triggers
CREATE TRIGGER update_supplier_on_purchase
AFTER INSERT OR UPDATE OR DELETE ON supplier_purchases
FOR EACH ROW EXECUTE FUNCTION update_supplier_totals_from_purchase();

CREATE TRIGGER update_supplier_on_payment
AFTER INSERT OR UPDATE OR DELETE ON supplier_payments
FOR EACH ROW EXECUTE FUNCTION update_supplier_totals_from_payment();

-- Fix existing data: Recalculate all supplier totals
UPDATE suppliers s SET
  total_paid = (
    COALESCE((SELECT SUM(paid_amount) FROM supplier_purchases WHERE supplier_id = s.id), 0) +
    COALESCE((SELECT SUM(amount) FROM supplier_payments WHERE supplier_id = s.id), 0)
  ),
  total_due = GREATEST(0, 
    COALESCE((SELECT SUM(total_amount) FROM supplier_purchases WHERE supplier_id = s.id), 0) -
    COALESCE((SELECT SUM(paid_amount) FROM supplier_purchases WHERE supplier_id = s.id), 0) -
    COALESCE((SELECT SUM(amount) FROM supplier_payments WHERE supplier_id = s.id), 0)
  ),
  updated_at = now();