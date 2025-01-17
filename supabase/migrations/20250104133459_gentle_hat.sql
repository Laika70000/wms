-- Drop existing policies
DROP POLICY IF EXISTS "products_policy" ON products;
DROP POLICY IF EXISTS "allow_product_access" ON products;

-- Create a simple policy for products
CREATE POLICY "allow_product_access"
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
      AND (merchant_id = auth.uid() OR merchant_id IS NULL)
    )
    OR
    -- Logisticians can modify all products
    auth.jwt()->>'role' = 'logistician'
  );

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create trigger to automatically set merchant_id for merchants
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.merchant_id IS NULL AND auth.jwt()->>'role' = 'merchant' THEN
    NEW.merchant_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();