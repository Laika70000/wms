-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP POLICY IF EXISTS "sources_access_policy" ON sources;

-- Create policy for products with JWT-based role checking
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can access their own products
    (auth.jwt()->>'role' = 'merchant' AND merchant_id = auth.uid())
    OR 
    -- Logisticians can access all products
    auth.jwt()->>'role' = 'logistician'
  )
  WITH CHECK (
    -- Merchants can modify their own products
    (auth.jwt()->>'role' = 'merchant' AND merchant_id = auth.uid())
    OR 
    -- Logisticians can modify all products
    auth.jwt()->>'role' = 'logistician'
  );

-- Create policy for sources with JWT-based role checking
CREATE POLICY "sources_access_policy"
  ON sources
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can access their own sources
    (auth.jwt()->>'role' = 'merchant' AND merchant_id = auth.uid())
    OR 
    -- Logisticians can access all sources
    auth.jwt()->>'role' = 'logistician'
  )
  WITH CHECK (
    -- Only merchants can modify their own sources
    auth.jwt()->>'role' = 'merchant' AND merchant_id = auth.uid()
  );

-- Create helper function for role checking
CREATE OR REPLACE FUNCTION auth.get_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt()->>'role',
    current_setting('request.jwt.claims', true)::json->>'role'
  );
$$;

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_sources_merchant_id ON sources(merchant_id);