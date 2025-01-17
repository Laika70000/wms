-- Drop existing policies
DROP POLICY IF EXISTS "Users can read products" ON products;
DROP POLICY IF EXISTS "Users can insert products" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;

-- Create helper function for role checking
CREATE OR REPLACE FUNCTION auth.user_is_merchant()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'merchant'
  );
$$;

CREATE OR REPLACE FUNCTION auth.user_is_logistician()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'logistician'
  );
$$;

-- Create simplified policies for products
CREATE POLICY "Merchants can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    (auth.user_is_merchant() AND merchant_id = auth.uid()) OR
    auth.user_is_logistician()
  )
  WITH CHECK (
    (auth.user_is_merchant() AND merchant_id = auth.uid()) OR
    auth.user_is_logistician()
  );

-- Add trigger to set merchant_id on insert
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.merchant_id IS NULL THEN
    NEW.merchant_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();