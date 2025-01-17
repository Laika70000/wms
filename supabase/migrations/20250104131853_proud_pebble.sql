-- Drop existing policies and triggers
DROP POLICY IF EXISTS "merchants_manage_own_products" ON products;
DROP POLICY IF EXISTS "logisticians_access_all_products" ON products;
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP FUNCTION IF EXISTS set_merchant_id();

-- Create a single comprehensive policy
CREATE POLICY "allow_product_access"
  ON products
  FOR ALL
  TO authenticated
  USING (
    -- For SELECT operations
    CASE 
      WHEN auth.jwt()->>'role' = 'merchant' THEN merchant_id = auth.uid()
      WHEN auth.jwt()->>'role' = 'logistician' THEN true
      ELSE false
    END
  )
  WITH CHECK (
    -- For INSERT/UPDATE operations
    CASE 
      WHEN auth.jwt()->>'role' = 'merchant' THEN 
        COALESCE(merchant_id = auth.uid(), true) -- Allow null merchant_id for new inserts
      WHEN auth.jwt()->>'role' = 'logistician' THEN true
      ELSE false
    END
  );

-- Create trigger function to automatically set merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only set merchant_id if user is a merchant and merchant_id is not already set
  IF NEW.merchant_id IS NULL AND auth.jwt()->>'role' = 'merchant' THEN
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