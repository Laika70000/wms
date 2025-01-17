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

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION auth.has_permission(required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.get_role() = required_role;
$$;

-- Create function to check if user is merchant
CREATE OR REPLACE FUNCTION auth.is_merchant()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.get_role() = 'merchant';
$$;

-- Create function to check if user is logistician
CREATE OR REPLACE FUNCTION auth.is_logistician()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.get_role() = 'logistician';
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.get_role() = 'admin';
$$;

-- Drop and recreate policies for products
DROP POLICY IF EXISTS "products_access_policy" ON products;
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    CASE auth.get_role()
      WHEN 'merchant' THEN merchant_id = auth.uid()
      WHEN 'logistician' THEN true
      WHEN 'admin' THEN true
      ELSE false
    END
  )
  WITH CHECK (
    CASE auth.get_role()
      WHEN 'merchant' THEN merchant_id = auth.uid()
      WHEN 'logistician' THEN true
      WHEN 'admin' THEN true
      ELSE false
    END
  );

-- Drop and recreate policies for merchants
DROP POLICY IF EXISTS "merchants_access_policy" ON merchants;
CREATE POLICY "merchants_access_policy"
  ON merchants
  FOR ALL
  TO authenticated
  USING (
    CASE auth.get_role()
      WHEN 'merchant' THEN id = auth.uid()
      WHEN 'logistician' THEN true
      WHEN 'admin' THEN true
      ELSE false
    END
  );

-- Drop and recreate policies for orders
DROP POLICY IF EXISTS "orders_access_policy" ON orders;
CREATE POLICY "orders_access_policy"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    CASE auth.get_role()
      WHEN 'merchant' THEN merchant_id = auth.uid()
      WHEN 'logistician' THEN true
      WHEN 'admin' THEN true
      ELSE false
    END
  );

-- Drop and recreate policies for sources
DROP POLICY IF EXISTS "sources_access_policy" ON sources;
CREATE POLICY "sources_access_policy"
  ON sources
  FOR ALL
  TO authenticated
  USING (
    CASE auth.get_role()
      WHEN 'merchant' THEN merchant_id = auth.uid()
      WHEN 'logistician' THEN true
      WHEN 'admin' THEN true
      ELSE false
    END
  )
  WITH CHECK (
    CASE auth.get_role()
      WHEN 'merchant' THEN merchant_id = auth.uid()
      WHEN 'admin' THEN true
      ELSE false
    END
  );