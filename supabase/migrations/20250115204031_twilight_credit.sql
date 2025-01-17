-- Check if carrier_settings table exists and create if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'carrier_settings') THEN
    -- Create carrier_settings table
    CREATE TABLE carrier_settings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      carrier_id uuid REFERENCES carriers(id) NOT NULL,
      contract_number text,
      api_key text,
      api_secret text,
      settings jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(carrier_id)
    );

    -- Enable RLS
    ALTER TABLE carrier_settings ENABLE ROW LEVEL SECURITY;

    -- Create policy
    CREATE POLICY "carrier_settings_access_policy"
      ON carrier_settings
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      );

    -- Create indexes
    CREATE INDEX idx_carrier_settings_carrier ON carrier_settings(carrier_id);
  END IF;
END $$;

-- Insert default settings for existing carriers if not already present
INSERT INTO carrier_settings (carrier_id)
SELECT id FROM carriers c
WHERE NOT EXISTS (
  SELECT 1 FROM carrier_settings cs 
  WHERE cs.carrier_id = c.id
)
ON CONFLICT (carrier_id) DO NOTHING;