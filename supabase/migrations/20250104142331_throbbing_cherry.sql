-- Create logisticians table
CREATE TABLE logisticians (
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

-- Create function to update last_login
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

-- Create function to get logistician statistics
CREATE OR REPLACE FUNCTION get_logistician_stats(logistician_id uuid)
RETURNS TABLE (
  merchant_count bigint,
  active_orders bigint,
  total_products bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT ml.merchant_id)::bigint as merchant_count,
    COUNT(DISTINCT o.id)::bigint as active_orders,
    COUNT(DISTINCT p.id)::bigint as total_products
  FROM merchant_logisticians ml
  LEFT JOIN orders o ON o.merchant_id = ml.merchant_id AND o.status IN ('pending', 'processing')
  LEFT JOIN products p ON p.merchant_id = ml.merchant_id
  WHERE ml.logistician_id = $1;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_logisticians_email ON logisticians(email);
CREATE INDEX idx_logisticians_status ON logisticians(status);