-- Drop existing policies first
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP POLICY IF EXISTS "merchants_access_policy" ON merchants;
DROP POLICY IF EXISTS "orders_access_policy" ON orders;
DROP POLICY IF EXISTS "sources_access_policy" ON sources;

-- Create helper function for role checking
CREATE OR REPLACE FUNCTION auth.get_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    auth.users.raw_user_meta_data->>'role'
  )
  FROM auth.users
  WHERE id = auth.uid();
$$;

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION auth.is_merchant()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.get_role() = 'merchant';
$$;

CREATE OR REPLACE FUNCTION auth.is_logistician()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.get_role() = 'logistician';
$$;

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.get_role() = 'admin';
$$;

-- Create new policies using helper functions
CREATE POLICY "rls_products_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    auth.is_logistician() OR
    auth.is_admin()
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    auth.is_logistician() OR
    auth.is_admin()
  );

CREATE POLICY "rls_merchants_policy"
  ON merchants
  FOR ALL
  TO authenticated
  USING (
    id = auth.uid() OR
    auth.is_logistician() OR
    auth.is_admin()
  );

CREATE POLICY "rls_orders_policy"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    auth.is_logistician() OR
    auth.is_admin()
  );

CREATE POLICY "rls_sources_policy"
  ON sources
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    auth.is_logistician() OR
    auth.is_admin()
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    auth.is_admin()
  );