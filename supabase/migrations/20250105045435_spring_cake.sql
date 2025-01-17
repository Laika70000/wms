-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;

-- Create simplified RLS policy for products
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can only access their own products
    merchant_id = auth.uid() OR
    -- Logisticians can access all products
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (
    -- Merchants can only modify their own products
    merchant_id = auth.uid() OR
    -- Logisticians can modify all products
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;