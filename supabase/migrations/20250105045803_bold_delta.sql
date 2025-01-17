-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP POLICY IF EXISTS "sources_access_policy" ON sources;

-- Create policy for products with proper role checking
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can access their own products
    merchant_id = auth.uid() OR
    -- Logisticians can access all products
    auth.jwt()->>'role' = 'logistician'
  )
  WITH CHECK (
    -- Merchants can modify their own products
    merchant_id = auth.uid() OR
    -- Logisticians can modify all products
    auth.jwt()->>'role' = 'logistician'
  );

-- Create policy for sources with proper role checking
CREATE POLICY "sources_access_policy"
  ON sources
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can access their own sources
    merchant_id = auth.uid() OR
    -- Logisticians can access all sources
    auth.jwt()->>'role' = 'logistician'
  )
  WITH CHECK (
    -- Only merchants can modify their own sources
    merchant_id = auth.uid()
  );

-- Create function to check user role without accessing auth.users table
CREATE OR REPLACE FUNCTION auth.check_role(required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    auth.jwt()->>'role'
  ) = required_role;
$$;

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_sources_merchant_id ON sources(merchant_id);