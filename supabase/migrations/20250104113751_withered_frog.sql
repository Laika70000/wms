-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON locations;
DROP POLICY IF EXISTS "Allow insert for authenticated logisticians" ON locations;
DROP POLICY IF EXISTS "Allow update for authenticated logisticians" ON locations;
DROP POLICY IF EXISTS "Allow delete for authenticated logisticians" ON locations;

-- Create new RLS policies with proper role checks
CREATE POLICY "Anyone authenticated can read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Logisticians can insert locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'logistician'
  );

CREATE POLICY "Logisticians can update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'logistician'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'logistician'
  );

CREATE POLICY "Logisticians can delete locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'logistician'
  );