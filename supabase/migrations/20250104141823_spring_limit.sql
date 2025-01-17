-- Create merchant_logisticians table if not exists
CREATE TABLE IF NOT EXISTS merchant_logisticians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  logistician_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(merchant_id, logistician_id)
);

-- Enable RLS
ALTER TABLE merchant_logisticians ENABLE ROW LEVEL SECURITY;

-- Create policy for merchant_logisticians
CREATE POLICY "merchant_logisticians_access"
  ON merchant_logisticians
  FOR ALL
  TO authenticated
  USING (
    logistician_id = auth.uid() OR
    merchant_id = auth.uid()
  );

-- Create functions for linking/unlinking
CREATE OR REPLACE FUNCTION link_merchant_to_logistician(merchant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO merchant_logisticians (merchant_id, logistician_id)
  VALUES ($1, auth.uid())
  ON CONFLICT (merchant_id, logistician_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION unlink_merchant_from_logistician(merchant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM merchant_logisticians
  WHERE merchant_id = $1
  AND logistician_id = auth.uid();
END;
$$;