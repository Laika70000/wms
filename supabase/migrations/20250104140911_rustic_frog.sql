-- Drop existing policies
DROP POLICY IF EXISTS "merchants_access_policy" ON merchants;
DROP POLICY IF EXISTS "merchant_logisticians_policy" ON merchant_logisticians;

-- Create simplified policies
CREATE POLICY "merchants_access_policy"
  ON merchants
  FOR ALL
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "merchant_logisticians_policy"
  ON merchant_logisticians
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    logistician_id = auth.uid()
  );

-- Insert test data if not exists
INSERT INTO merchants (id, name, email, status)
VALUES 
  ('987fcdeb-51a2-43d7-9b56-254415174000', 'Jane Smith', 'merchant@example.com', 'active'),
  ('123e4567-e89b-12d3-a456-426614174000', 'John Doe', 'merchant2@example.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_merchants_id ON merchants(id);
CREATE INDEX IF NOT EXISTS idx_merchant_logisticians_merchant_id ON merchant_logisticians(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_logisticians_logistician_id ON merchant_logisticians(logistician_id);