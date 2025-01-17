-- Check if admin user exists before creating
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ) THEN
    -- Insert admin user
    INSERT INTO auth.users (
      id,
      email,
      raw_user_meta_data,
      encrypted_password,
      email_confirmed_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      jsonb_build_object('role', 'admin', 'name', 'Admin'),
      crypt('admin123', gen_salt('bf')),
      now()
    );
  END IF;
END $$;

-- Update existing policies to include admin access
DO $$ 
BEGIN
  -- Update merchants policy
  DROP POLICY IF EXISTS "merchants_access_policy" ON merchants;
  CREATE POLICY "merchants_access_policy"
    ON merchants
    FOR ALL
    TO authenticated
    USING (
      id = auth.uid() OR
      auth.jwt()->>'role' = 'logistician' OR
      auth.jwt()->>'role' = 'admin'
    );

  -- Update products policy
  DROP POLICY IF EXISTS "products_policy" ON products;
  CREATE POLICY "products_policy"
    ON products
    FOR ALL
    TO authenticated
    USING (
      merchant_id = auth.uid() OR
      auth.jwt()->>'role' = 'logistician' OR
      auth.jwt()->>'role' = 'admin'
    );

  -- Update orders policy
  DROP POLICY IF EXISTS "orders_policy" ON orders;
  CREATE POLICY "orders_policy"
    ON orders
    FOR ALL
    TO authenticated
    USING (
      merchant_id = auth.uid() OR
      auth.jwt()->>'role' = 'logistician' OR
      auth.jwt()->>'role' = 'admin'
    );
END $$;