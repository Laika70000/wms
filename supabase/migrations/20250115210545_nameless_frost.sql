-- Drop existing policies
DROP POLICY IF EXISTS "carriers_access_policy" ON carriers;

-- Create new policy for carriers with proper role checking
CREATE POLICY "carriers_access_policy"
  ON carriers
  FOR ALL
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'logistician' OR
    auth.jwt()->>'role' = 'admin'
  );

-- Ensure RLS is enabled
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;

-- Insert default carriers if they don't exist
INSERT INTO carriers (name, code, type, status)
VALUES 
  ('Colissimo', 'COLISSIMO', 'standard', 'active'),
  ('DHL Express', 'DHL', 'express', 'active'),
  ('UPS', 'UPS', 'express', 'active'),
  ('FedEx', 'FEDEX', 'express', 'active'),
  ('Chronopost', 'CHRONOPOST', 'express', 'active'),
  ('Mondial Relay', 'MONDIAL_RELAY', 'standard', 'active')
ON CONFLICT (code) DO UPDATE
SET 
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status;

-- Create carrier settings for each carrier if they don't exist
INSERT INTO carrier_settings (carrier_id)
SELECT id FROM carriers
WHERE NOT EXISTS (
  SELECT 1 FROM carrier_settings cs 
  WHERE cs.carrier_id = carriers.id
)
ON CONFLICT (carrier_id) DO NOTHING;

-- Create policy for carrier_settings
DROP POLICY IF EXISTS "carrier_settings_access_policy" ON carrier_settings;

CREATE POLICY "carrier_settings_access_policy"
  ON carrier_settings
  FOR ALL
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'logistician' OR
    auth.jwt()->>'role' = 'admin'
  );