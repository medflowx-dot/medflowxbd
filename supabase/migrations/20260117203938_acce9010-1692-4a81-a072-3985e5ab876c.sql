-- Insert test manufacturers
INSERT INTO manufacturers (id, user_id, name, phone, contact_person, address)
VALUES 
  ('a1111111-aaaa-1111-aaaa-111111111111', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Square Pharmaceuticals', '01711111111', 'Mr. Rahman', 'Dhaka'),
  ('a2222222-aaaa-2222-aaaa-222222222222', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Beximco Pharma', '01722222222', 'Mr. Hasan', 'Dhaka'),
  ('a3333333-aaaa-3333-aaaa-333333333333', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Incepta Pharmaceuticals', '01733333333', 'Mr. Karim', 'Dhaka')
ON CONFLICT DO NOTHING;

-- Insert test medicines  
INSERT INTO medicines (id, user_id, name, generic_name, manufacturer, manufacturer_id, category, unit, min_stock_level, is_tax_applicable)
VALUES 
  ('11111111-aaaa-1111-aaaa-111111111111', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Napa Extra', 'Paracetamol + Caffeine', 'Beximco Pharma', 'a2222222-aaaa-2222-aaaa-222222222222', 'Analgesic', 'strip', 50, false),
  ('22222222-aaaa-2222-aaaa-222222222222', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Seclo 20', 'Omeprazole', 'Square Pharmaceuticals', 'a1111111-aaaa-1111-aaaa-111111111111', 'Antacid', 'strip', 30, false),
  ('33333333-aaaa-3333-aaaa-333333333333', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Azithromycin 500', 'Azithromycin', 'Incepta Pharmaceuticals', 'a3333333-aaaa-3333-aaaa-333333333333', 'Antibiotic', 'strip', 20, true),
  ('44444444-aaaa-4444-aaaa-444444444444', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Losectil 20', 'Omeprazole', 'Square Pharmaceuticals', 'a1111111-aaaa-1111-aaaa-111111111111', 'Antacid', 'box', 15, false),
  ('55555555-aaaa-5555-aaaa-555555555555', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Ciprocin 500', 'Ciprofloxacin', 'Square Pharmaceuticals', 'a1111111-aaaa-1111-aaaa-111111111111', 'Antibiotic', 'strip', 25, true)
ON CONFLICT DO NOTHING;

-- Insert test batches (some expired, some expiring soon)
INSERT INTO medicine_batches (id, user_id, medicine_id, batch_number, quantity, purchase_price, selling_price, expiry_date, manufactured_date)
VALUES 
  ('b1111111-aaaa-1111-aaaa-111111111111', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', '11111111-aaaa-1111-aaaa-111111111111', 'NE-2024-001', 10, 8.00, 12.00, '2025-01-01', '2024-01-01'),
  ('b2222222-aaaa-2222-aaaa-222222222222', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', '11111111-aaaa-1111-aaaa-111111111111', 'NE-2025-002', 100, 8.50, 12.00, CURRENT_DATE + INTERVAL '15 days', '2024-06-01'),
  ('b3333333-aaaa-3333-aaaa-333333333333', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', '22222222-aaaa-2222-aaaa-222222222222', 'SC-2025-001', 80, 15.00, 22.00, CURRENT_DATE + INTERVAL '45 days', '2024-08-01'),
  ('b4444444-aaaa-4444-aaaa-444444444444', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', '33333333-aaaa-3333-aaaa-333333333333', 'AZ-2025-001', 50, 45.00, 65.00, CURRENT_DATE + INTERVAL '75 days', '2024-09-01'),
  ('b5555555-aaaa-5555-aaaa-555555555555', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', '44444444-aaaa-4444-aaaa-444444444444', 'LS-2026-001', 200, 18.00, 25.00, CURRENT_DATE + INTERVAL '1 year', '2025-01-01'),
  ('b6666666-aaaa-6666-aaaa-666666666666', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', '55555555-aaaa-5555-aaaa-555555555555', 'CP-2026-001', 5, 35.00, 50.00, CURRENT_DATE + INTERVAL '6 months', '2025-01-01')
ON CONFLICT DO NOTHING;

-- Insert test customers with dues
INSERT INTO customers (id, user_id, name, phone, address, total_due)
VALUES 
  ('c1111111-aaaa-1111-aaaa-111111111111', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Mohammad Ali', '01811111111', 'Mirpur, Dhaka', 1500.00),
  ('c2222222-aaaa-2222-aaaa-222222222222', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Fatima Begum', '01822222222', 'Dhanmondi, Dhaka', 850.00),
  ('c3333333-aaaa-3333-aaaa-333333333333', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Karim Uddin', '01833333333', 'Uttara, Dhaka', 0.00)
ON CONFLICT DO NOTHING;

-- Insert test suppliers with dues
INSERT INTO suppliers (id, user_id, name, phone, contact_person, address, total_due, total_paid)
VALUES 
  ('d1111111-aaaa-1111-aaaa-111111111111', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'City Drug House', '01911111111', 'Mr. Alam', 'Mitford, Dhaka', 25000.00, 50000.00),
  ('d2222222-aaaa-2222-aaaa-222222222222', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Popular Medicine Corner', '01922222222', 'Mr. Salam', 'Motijheel, Dhaka', 15000.00, 30000.00),
  ('d3333333-aaaa-3333-aaaa-333333333333', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'National Pharma', '01933333333', 'Mr. Kabir', 'Gulshan, Dhaka', 0.00, 20000.00)
ON CONFLICT DO NOTHING;

-- Insert test sales
INSERT INTO sales (id, user_id, invoice_number, sale_date, subtotal, discount, total_amount, paid_amount, due_amount, payment_method, entry_type, customer_id)
VALUES 
  ('e1111111-aaaa-1111-aaaa-111111111111', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'SE-20250117-0001', CURRENT_DATE, 500.00, 0.00, 500.00, 500.00, 0.00, 'cash', 'quick', NULL),
  ('e2222222-aaaa-2222-aaaa-222222222222', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'SE-20250117-0002', CURRENT_DATE, 1200.00, 50.00, 1150.00, 1150.00, 0.00, 'cash', 'detailed', NULL),
  ('e3333333-aaaa-3333-aaaa-333333333333', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'SE-20250116-0001', CURRENT_DATE - INTERVAL '1 day', 800.00, 0.00, 800.00, 300.00, 500.00, 'due', 'detailed', 'c1111111-aaaa-1111-aaaa-111111111111')
ON CONFLICT DO NOTHING;

-- Insert test sale items
INSERT INTO sale_items (id, sale_id, medicine_id, medicine_name, batch_id, batch_number, quantity, unit_price, total_price, purchase_price, sale_unit)
VALUES 
  ('f1111111-aaaa-1111-aaaa-111111111111', 'e2222222-aaaa-2222-aaaa-222222222222', '11111111-aaaa-1111-aaaa-111111111111', 'Napa Extra', 'b2222222-aaaa-2222-aaaa-222222222222', 'NE-2025-002', 10, 12.00, 120.00, 8.50, 'strip'),
  ('f2222222-aaaa-2222-aaaa-222222222222', 'e2222222-aaaa-2222-aaaa-222222222222', '22222222-aaaa-2222-aaaa-222222222222', 'Seclo 20', 'b3333333-aaaa-3333-aaaa-333333333333', 'SC-2025-001', 5, 22.00, 110.00, 15.00, 'strip'),
  ('f3333333-aaaa-3333-aaaa-333333333333', 'e3333333-aaaa-3333-aaaa-333333333333', '33333333-aaaa-3333-aaaa-333333333333', 'Azithromycin 500', 'b4444444-aaaa-4444-aaaa-444444444444', 'AZ-2025-001', 2, 65.00, 130.00, 45.00, 'strip')
ON CONFLICT DO NOTHING;

-- Insert test supplier purchases
INSERT INTO supplier_purchases (id, user_id, supplier_id, invoice_number, purchase_date, total_amount, paid_amount, due_amount)
VALUES 
  ('11111111-bbbb-1111-bbbb-111111111111', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'd1111111-aaaa-1111-aaaa-111111111111', 'INV-CDH-001', CURRENT_DATE - INTERVAL '5 days', 50000.00, 25000.00, 25000.00),
  ('22222222-bbbb-2222-bbbb-222222222222', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'd2222222-aaaa-2222-aaaa-222222222222', 'INV-PMC-001', CURRENT_DATE - INTERVAL '3 days', 30000.00, 15000.00, 15000.00)
ON CONFLICT DO NOTHING;

-- Insert test stock order
INSERT INTO stock_orders (id, user_id, manufacturer, manufacturer_phone, status, notes)
VALUES 
  ('33333333-bbbb-3333-bbbb-333333333333', 'f5f047a0-7db4-4612-b8f3-1915f1ce235f', 'Square Pharmaceuticals', '01711111111', 'pending', 'Weekly restock order')
ON CONFLICT DO NOTHING;

-- Insert test stock order items
INSERT INTO stock_order_items (id, order_id, medicine_id, medicine_name, current_stock, min_stock_level, quantity_to_order, unit)
VALUES 
  ('44444444-bbbb-4444-bbbb-444444444444', '33333333-bbbb-3333-bbbb-333333333333', '55555555-aaaa-5555-aaaa-555555555555', 'Ciprocin 500', 5, 25, 50, 'strip')
ON CONFLICT DO NOTHING;