-- Drop existing policies, triggers and functions first
DROP POLICY IF EXISTS "logisticians_access_policy" ON logisticians;
DROP POLICY IF EXISTS "admin_manage_logisticians" ON logisticians;
DROP TRIGGER IF EXISTS update_logistician_last_login_trigger ON auth.users;
DROP FUNCTION IF EXISTS update_logistician_last_login();

-- Create or replace function for last_login update
CREATE OR REPLACE FUNCTION update_logistician_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE logisticians
  SET last_login = now()
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$;

-- Create trigger for last_login update
CREATE TRIGGER update_logistician_last_login_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'role' = 'logistician')
  EXECUTE FUNCTION update_logistician_last_login();

-- Create new policy with unique name
CREATE POLICY "admin_only_logisticians_access"
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

-- Ensure RLS is enabled
ALTER TABLE logisticians ENABLE ROW LEVEL SECURITY;

-- Recreate indexes with IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_logisticians_email ON logisticians(email);
CREATE INDEX IF NOT EXISTS idx_logisticians_status ON logisticians(status);