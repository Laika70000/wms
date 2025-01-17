-- Drop existing policies if any
DROP POLICY IF EXISTS "merchants_access_policy" ON merchants;

-- Create policy for merchants table
CREATE POLICY "merchants_access_policy"
  ON merchants
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can only see their own data
    id = auth.uid() OR
    -- Logisticians can see all merchants
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_merchants_id ON merchants(id);