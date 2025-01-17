/*
  # Fix Product RLS Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policies
    - Add proper role checks
    - Ensure merchant_id is properly set

  2. Security
    - Enable RLS on products table
    - Add policies for merchants and logisticians
    - Ensure proper access control based on user roles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Merchants can read own products" ON products;
DROP POLICY IF EXISTS "Merchants can insert own products" ON products;
DROP POLICY IF EXISTS "Merchants can update own products" ON products;
DROP POLICY IF EXISTS "Merchants can delete own products" ON products;

-- Create simplified policy for all operations
CREATE POLICY "Allow merchant and logistician access"
  ON products
  FOR ALL
  TO authenticated
  USING (
    (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'merchant'
      )
      AND merchant_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'merchant'
      )
      AND merchant_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;