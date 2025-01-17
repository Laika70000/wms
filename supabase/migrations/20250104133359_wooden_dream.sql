-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP POLICY IF EXISTS "merchants_access_policy" ON merchants;
DROP POLICY IF EXISTS "merchant_logisticians_policy" ON merchant_logisticians;

-- Create helper function for role checking
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    auth.users.raw_user_meta_data->>'role'
  )
  FROM auth.users
  WHERE id = auth.uid();
$$;

-- Products policy
CREATE POLICY "products_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    auth.get_user_role() = 'logistician'
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    auth.get_user_role() = 'logistician'
  );

-- Merchants policy
CREATE POLICY "merchants_policy"
  ON merchants
  FOR ALL
  TO authenticated
  USING (
    id = auth.uid() OR
    auth.get_user_role() = 'logistician'
  )
  WITH CHECK (
    id = auth.uid() OR
    auth.get_user_role() = 'logistician'
  );

-- Merchant-logistician links policy
CREATE POLICY "merchant_logisticians_policy"
  ON merchant_logisticians
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    logistician_id = auth.uid()
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    logistician_id = auth.uid()
  );

-- Ensure RLS is enabled on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_logisticians ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_logisticians_merchant_id ON merchant_logisticians(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_logisticians_logistician_id ON merchant_logisticians(logistician_id);