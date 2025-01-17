-- Drop existing policies and triggers
DROP POLICY IF EXISTS "products_policy" ON products;
DROP POLICY IF EXISTS "allow_product_access" ON products;
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP FUNCTION IF EXISTS set_merchant_id();

-- Create a simple policy for all operations
CREATE POLICY "allow_all_authenticated"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger function to set merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set merchant_id only for merchants
  IF NEW.merchant_id IS NULL AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND raw_user_meta_data->>'role' = 'merchant'
  ) THEN
    NEW.merchant_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category, merchant_id);