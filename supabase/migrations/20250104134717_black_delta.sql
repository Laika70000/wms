-- Drop existing policies
DROP POLICY IF EXISTS "products_access_policy" ON products;

-- Create a simplified policy for products
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (true);

-- Update the merchant_id trigger to be more reliable
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role text;
BEGIN
  -- Get current user role
  SELECT raw_user_meta_data->>'role'
  INTO current_role
  FROM auth.users
  WHERE id = auth.uid();

  -- Set merchant_id only if user is a merchant and merchant_id is not set
  IF NEW.merchant_id IS NULL AND current_role = 'merchant' THEN
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