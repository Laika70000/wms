-- Add cascade delete to merchant_logisticians
ALTER TABLE merchant_logisticians
DROP CONSTRAINT merchant_logisticians_logistician_id_fkey,
ADD CONSTRAINT merchant_logisticians_logistician_id_fkey
  FOREIGN KEY (logistician_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Update merchant_logisticians policy
DROP POLICY IF EXISTS "merchant_logisticians_access" ON merchant_logisticians;

CREATE POLICY "merchant_logisticians_access_policy"
  ON merchant_logisticians
  FOR ALL
  TO authenticated
  USING (
    -- Merchants can see their own links
    merchant_id = auth.uid() OR
    -- Logisticians can see their own links
    logistician_id = auth.uid() OR
    -- Admins can see all links
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create function to count merchants per logistician
CREATE OR REPLACE FUNCTION get_merchant_count(logistician_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::bigint
  FROM merchant_logisticians
  WHERE logistician_id = $1;
$$;