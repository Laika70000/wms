-- Drop existing policies
DROP POLICY IF EXISTS "Logisticians can manage locations" ON locations;

-- Enable RLS on locations table (if not already enabled)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create separate policies for each operation
CREATE POLICY "Logisticians can read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'logistician'
    )
  );

CREATE POLICY "Logisticians can insert locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'logistician'
    )
  );

CREATE POLICY "Logisticians can update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'logistician'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'logistician'
    )
  );

CREATE POLICY "Logisticians can delete locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'logistician'
    )
  );

-- Allow merchants to read locations
CREATE POLICY "Merchants can read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'merchant'
    )
  );