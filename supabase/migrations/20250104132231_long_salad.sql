-- Drop existing policies
DROP POLICY IF EXISTS "merchants_access_policy" ON merchants;

-- Create new policy with proper role checking
CREATE POLICY "merchants_access_policy"
  ON merchants
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can only see their own data
    id = auth.uid() OR
    -- Logisticians can see all merchants
    auth.jwt()->>'role' = 'logistician'
  );

-- Ensure RLS is enabled
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_merchants_id ON merchants(id);

-- Insert test merchant if not exists
INSERT INTO merchants (id, name, email)
VALUES (
  '987fcdeb-51a2-43d7-9b56-254415174000',
  'Jane Smith',
  'merchant@example.com'
) ON CONFLICT (id) DO NOTHING;