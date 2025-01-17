-- Drop existing policies and triggers
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP FUNCTION IF EXISTS set_merchant_id();

-- Create a secure trigger function for merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get user role from JWT claims
  user_role := auth.jwt()->>'role';
  
  -- Set merchant_id only if user is a merchant
  IF NEW.merchant_id IS NULL AND user_role = 'merchant' THEN
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

-- Create separate policies for better control
CREATE POLICY "merchants_manage_own_products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt()->>'role' = 'merchant' AND merchant_id = auth.uid())
  )
  WITH CHECK (
    (auth.jwt()->>'role' = 'merchant' AND merchant_id = auth.uid())
  );

CREATE POLICY "logisticians_manage_all_products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'logistician')
  WITH CHECK (auth.jwt()->>'role' = 'logistician');

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_merchant ON products(category, merchant_id);