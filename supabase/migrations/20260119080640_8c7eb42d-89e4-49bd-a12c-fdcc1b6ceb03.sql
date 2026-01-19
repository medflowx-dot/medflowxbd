-- Clean all client-specific data (keeping global data intact)
-- Order matters due to foreign key constraints

-- First, delete items that depend on other tables
DELETE FROM sale_items;
DELETE FROM stock_order_items;
DELETE FROM stock_short_items;
DELETE FROM supplier_order_items;

-- Delete payment records
DELETE FROM customer_payments;
DELETE FROM supplier_payments;

-- Delete transaction records
DELETE FROM sales;
DELETE FROM supplier_purchases;
DELETE FROM daily_costs;
DELETE FROM opening_cash;

-- Delete order records
DELETE FROM stock_orders;
DELETE FROM stock_short_notes;
DELETE FROM supplier_orders;

-- Delete medicine batches (before medicines)
DELETE FROM medicine_batches;

-- Delete main entities
DELETE FROM medicines;
DELETE FROM manufacturers;
DELETE FROM customers;
DELETE FROM suppliers;

-- Verify cleanup
SELECT 
  'medicines' as table_name, COUNT(*) as remaining FROM medicines
UNION ALL
SELECT 'manufacturers', COUNT(*) FROM manufacturers
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'medicine_batches', COUNT(*) FROM medicine_batches;