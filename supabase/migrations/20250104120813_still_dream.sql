/*
  # Fix Orders RLS and Views

  1. Changes
    - Drop existing policies
    - Create new RLS policies for orders and order items
    - Add helper function for role checking
    - Create proper indexes for performance
    
  2. Security
    - Maintain proper access control
    - Allow merchants to manage their own orders
    - Allow logisticians to manage all orders
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read orders" ON orders;
DROP POLICY IF EXISTS "Users can insert orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;
DROP POLICY IF EXISTS "Users can read order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON order_items;

-- Create helper function for role checking
CREATE OR REPLACE FUNCTION auth.is_logistician()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'logistician'
  );
$$;

-- Create simplified policies for orders
CREATE POLICY "Allow full access to authenticated users"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR auth.is_logistician()
  )
  WITH CHECK (
    merchant_id = auth.uid() OR auth.is_logistician()
  );

-- Create simplified policies for order_items
CREATE POLICY "Allow full access to order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.merchant_id = auth.uid() OR auth.is_logistician())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.merchant_id = auth.uid() OR auth.is_logistician())
    )
  );

-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status 
ON orders(merchant_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_date_merchant 
ON orders(date, merchant_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_product 
ON order_items(order_id, product_id);