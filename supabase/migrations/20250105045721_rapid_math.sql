-- Drop existing policies if any
DROP POLICY IF EXISTS "sources_access_policy" ON sources;
DROP POLICY IF EXISTS "orders_access_policy" ON orders;
DROP POLICY IF EXISTS "order_items_access_policy" ON order_items;

-- Enable RLS on all tables
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policy for sources
CREATE POLICY "sources_access_policy"
  ON sources
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can only access their own sources
    merchant_id = auth.uid() OR
    -- Logisticians can access all sources
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (
    -- Only merchants can modify their own sources
    merchant_id = auth.uid()
  );

-- Create policy for orders
CREATE POLICY "orders_access_policy"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can only access their own orders
    merchant_id = auth.uid() OR
    -- Logisticians can access all orders
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (
    -- Merchants can only modify their own orders
    merchant_id = auth.uid() OR
    -- Logisticians can modify all orders
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Create policy for order items
CREATE POLICY "order_items_access_policy"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    -- Access through parent order
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE id = auth.uid()
          AND raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  )
  WITH CHECK (
    -- Modifications through parent order
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE id = auth.uid()
          AND raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sources_merchant_id ON sources(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);