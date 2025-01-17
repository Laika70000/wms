/*
  # Update Product Policies and Role Functions

  1. Changes
    - Drop existing policies and triggers in correct order
    - Recreate role check functions
    - Create new product policies with proper permissions
    - Add automatic merchant_id setting
    - Add automatic updated_at timestamp update

  2. Security
    - Enable RLS on products table
    - Add policies for merchants and logisticians
    - Ensure proper access control based on user roles
*/

-- First drop policies to remove dependencies
DROP POLICY IF EXISTS "Merchants can manage own products" ON products;

-- Then drop triggers
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP TRIGGER IF EXISTS products_update_updated_at_trigger ON products;

-- Create role check functions with proper JWT claims check
CREATE OR REPLACE FUNCTION auth.user_is_merchant()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (
      raw_user_meta_data->>'role' = 'merchant'
      OR
      auth.jwt()->>'role' = 'merchant'
    )
  );
$$;

CREATE OR REPLACE FUNCTION auth.user_is_logistician()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (
      raw_user_meta_data->>'role' = 'logistician'
      OR
      auth.jwt()->>'role' = 'logistician'
    )
  );
$$;

-- Create separate policies for better control
CREATE POLICY "Merchants can read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    (auth.user_is_merchant() AND merchant_id = auth.uid())
    OR auth.user_is_logistician()
  );

CREATE POLICY "Merchants can insert own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.user_is_merchant()
  );

CREATE POLICY "Merchants can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    (auth.user_is_merchant() AND merchant_id = auth.uid())
    OR auth.user_is_logistician()
  )
  WITH CHECK (
    (auth.user_is_merchant() AND merchant_id = auth.uid())
    OR auth.user_is_logistician()
  );

CREATE POLICY "Merchants can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    (auth.user_is_merchant() AND merchant_id = auth.uid())
    OR auth.user_is_logistician()
  );

-- Create trigger functions
CREATE OR REPLACE FUNCTION products_set_merchant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.merchant_id IS NULL THEN
    NEW.merchant_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER products_set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_set_merchant_id();

CREATE TRIGGER products_update_updated_at_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();