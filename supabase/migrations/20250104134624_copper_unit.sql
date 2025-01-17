-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;

-- Create a simplified policy for products
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    auth.jwt()->>'role' = 'logistician'
  )
  WITH CHECK (true);

-- Update the merchant_id trigger
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set merchant_id for merchants only if not already set
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