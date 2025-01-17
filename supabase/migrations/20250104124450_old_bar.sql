/*
  # Fix Product RLS Policies

  1. Changes
    - Drop existing policies
    - Create new simplified policy
    - Ensure proper role checks
    - Add merchant_id handling

  2. Security
    - Enable RLS on products table
    - Add policy for merchants and logisticians
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow merchant and logistician access" ON products;

-- Create simplified policy for all operations
CREATE POLICY "Allow merchant and logistician access"
  ON products
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

-- Create trigger to automatically set merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.merchant_id IS NULL THEN
    NEW.merchant_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for merchant_id
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;