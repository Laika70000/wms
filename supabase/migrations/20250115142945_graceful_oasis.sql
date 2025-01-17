-- Create carriers table if not exists
CREATE TABLE IF NOT EXISTS carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('express', 'standard', 'economy')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "carriers_access_policy" ON carriers;

-- Create policy with unique name
CREATE POLICY "tms_carriers_access_policy"
  ON carriers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_carriers_code ON carriers(code);
CREATE INDEX IF NOT EXISTS idx_carriers_status ON carriers(status);

-- Insert some default carriers
INSERT INTO carriers (name, code, type) VALUES
  ('UPS', 'UPS', 'express'),
  ('FedEx', 'FEDEX', 'express'),
  ('DHL', 'DHL', 'express'),
  ('La Poste', 'LAPOSTE', 'standard'),
  ('Chronopost', 'CHRONOPOST', 'express')
ON CONFLICT (code) DO NOTHING;