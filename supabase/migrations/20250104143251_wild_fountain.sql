-- Create logisticians table if not exists
CREATE TABLE IF NOT EXISTS logisticians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE logisticians ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "logisticians_access_policy" ON logisticians;

-- Create policy for logisticians
CREATE POLICY "logisticians_access_policy"
  ON logisticians
  FOR ALL
  TO authenticated
  USING (
    -- Only admin can access logisticians
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS update_logistician_last_login_trigger ON auth.users;
DROP FUNCTION IF EXISTS update_logistician_last_login();

-- Create function to update last_login
CREATE FUNCTION update_logistician_last_login()
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

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_logisticians_email;
DROP INDEX IF EXISTS idx_logisticians_status;

-- Create indexes for better performance
CREATE INDEX idx_logisticians_email ON logisticians(email);
CREATE INDEX idx_logisticians_status ON logisticians(status);