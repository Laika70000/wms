-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;

-- Create a simplified policy that allows merchants to manage their products
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can access their own products
    (
      auth.jwt()->>'role' = 'merchant' 
      AND merchant_id = auth.uid()
    )
    OR 
    -- Logisticians can access all products
    auth.jwt()->>'role' = 'logistician'
  )
  WITH CHECK (true); -- Allow all authenticated users to insert/update

-- Update the merchant_id trigger to be more permissive during import
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

-- Recreate trigger
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();