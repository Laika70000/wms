-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP POLICY IF EXISTS "allow_product_access" ON products;

-- Create a single, simple policy for products
CREATE POLICY "products_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (true); -- Allow all authenticated users to insert/update

-- Create trigger function to set merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set merchant_id only if user is a merchant
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

-- Recreate trigger
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;