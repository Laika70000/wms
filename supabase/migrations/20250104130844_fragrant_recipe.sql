-- Insert test merchant
INSERT INTO merchants (id, name, email)
VALUES (
  '987fcdeb-51a2-43d7-9b56-254415174000',
  'Jane Smith',
  'merchant@example.com'
) ON CONFLICT (id) DO NOTHING;

-- Insert test products for the merchant
INSERT INTO products (name, sku, category, price, min_stock, merchant_id)
VALUES 
  ('Test Product 1', 'TST-001', 'Test', 99.99, 10, '987fcdeb-51a2-43d7-9b56-254415174000'),
  ('Test Product 2', 'TST-002', 'Test', 149.99, 5, '987fcdeb-51a2-43d7-9b56-254415174000')
ON CONFLICT (sku) DO NOTHING;