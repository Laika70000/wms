-- Drop existing policies
DROP POLICY IF EXISTS "tms_carrier_services_access" ON carrier_services;
DROP POLICY IF EXISTS "carrier_services_policy" ON carrier_services;

-- Create new policy for carrier services
CREATE POLICY "carrier_services_access_policy"
  ON carrier_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('logistician', 'admin')
    )
  );

-- Ensure RLS is enabled
ALTER TABLE carrier_services ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carrier_services_carrier_id ON carrier_services(carrier_id);
CREATE INDEX IF NOT EXISTS idx_carrier_services_code ON carrier_services(code);