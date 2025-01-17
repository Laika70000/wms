-- Drop existing policy if exists
DROP POLICY IF EXISTS "logisticians_access_policy" ON logisticians;

-- Create policy for logisticians
CREATE POLICY "logisticians_access_policy"
  ON logisticians
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_logistician_last_login_trigger ON auth.users;

-- Create or replace function
CREATE OR REPLACE FUNCTION update_logistician_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
BEGIN
  UPDATE logisticians
  SET last_login = now()
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER update_logistician_last_login_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'role' = 'logistician')
  EXECUTE FUNCTION update_logistician_last_login();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_logisticians_email ON logisticians(email);
CREATE INDEX IF NOT EXISTS idx_logisticians_status ON logisticians(status);