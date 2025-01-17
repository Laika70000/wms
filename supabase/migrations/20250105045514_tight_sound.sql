-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;

-- Create simplified RLS policy for products
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can access their own products
    (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'merchant'
        AND id = products.merchant_id
      )
    )
    OR
    -- Logisticians can access all products
    (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'logistician'
      )
    )
  )
  WITH CHECK (true);

-- Create trigger to automatically set merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.merchant_id IS NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE id = auth.uid()
       AND raw_user_meta_data->>'role' = 'merchant'
     )
  THEN
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

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;