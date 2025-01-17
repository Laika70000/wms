/*
  # Fix Orders RLS and Test Data Access

  1. Changes
    - Simplify RLS policies for orders and order items
    - Add helper function for role checking
    - Ensure proper access for test data insertion
    
  2. Security
    - Maintain proper access control
    - Allow merchants to manage their own orders
    - Allow logisticians to manage all orders
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow full access to order items" ON order_items;

-- Create helper function for role checking
CREATE OR REPLACE FUNCTION auth.is_logistician()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'role' = 'logistician' OR
    (
      SELECT raw_user_meta_data->>'role' = 'logistician'
      FROM auth.users
      WHERE id = auth.uid()
    ),
    false
  );
$$;

-- Create simplified policies for orders
CREATE POLICY "Allow all operations for authorized users"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    auth.is_logistician() = true
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    auth.is_logistician() = true
  );

-- Create simplified policies for order_items
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
        auth.is_logistician() = true
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.merchant_id = auth.uid() OR
        auth.is_logistician() = true
      )
    )
  );

-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;