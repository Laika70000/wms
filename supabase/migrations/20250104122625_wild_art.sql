/*
  # Fix Orders RLS Policies
  
  1. Drop existing policies
  2. Create new simplified policies for orders and order_items
  3. Add necessary indexes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow all operations for order items" ON order_items;

-- Create simplified policy for orders
CREATE POLICY "Allow all operations for orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simplified policy for order items
CREATE POLICY "Allow all operations for order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_date_merchant ON orders(date, merchant_id);