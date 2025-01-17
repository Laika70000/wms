-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can insert locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can update locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can delete locations" ON locations;

-- Create new RLS policies with proper authentication checks
CREATE POLICY "Allow read access to authenticated users"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert for authenticated logisticians"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "Allow update for authenticated logisticians"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "Allow delete for authenticated logisticians"
  ON locations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );