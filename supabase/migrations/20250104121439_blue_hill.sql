/*
  # Fix Orders Migration
  
  1. Add merchant_id column to orders table
  2. Create policies for orders and order items
  3. Add performance indexes
*/

-- Add merchant_id column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'merchant_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN merchant_id uuid REFERENCES merchants(id);
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow all operations for order items" ON order_items;

-- Create simplified policies for orders
CREATE POLICY "Allow all operations for authenticated users"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Create simplified policies for order items
CREATE POLICY "Allow all operations for order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_date_merchant ON orders(date, merchant_id);