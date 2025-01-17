-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP POLICY IF EXISTS "allow_all_authenticated" ON products;
DROP POLICY IF EXISTS "products_policy" ON products;

-- Create new RLS policy for products
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can only access their own products
    (
      auth.jwt()->>'role' = 'merchant' 
      AND merchant_id = auth.uid()
    )
    OR 
    -- Logisticians can access all products
    auth.jwt()->>'role' = 'logistician'
  )
  WITH CHECK (
    -- Merchants can only modify their own products
    (
      auth.jwt()->>'role' = 'merchant' 
      AND merchant_id = auth.uid()
    )
    OR 
    -- Logisticians can modify all products
    auth.jwt()->>'role' = 'logistician'
  );

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;