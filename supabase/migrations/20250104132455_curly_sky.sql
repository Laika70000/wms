-- Ajout de la colonne status aux marchands
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'inactive', 'suspended'));

-- Ajout de la colonne role aux utilisateurs
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'merchant'
CHECK (role IN ('merchant', 'logistician'));

-- Création de la table de liaison entre marchands et logisticiens
CREATE TABLE IF NOT EXISTS merchant_logisticians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  logistician_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(merchant_id, logistician_id)
);

-- Activation de RLS
ALTER TABLE merchant_logisticians ENABLE ROW LEVEL SECURITY;

-- Politique pour merchant_logisticians
CREATE POLICY "merchant_logisticians_policy"
  ON merchant_logisticians
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    logistician_id = auth.uid()
  );

-- Mise à jour de la politique des marchands
DROP POLICY IF EXISTS "merchants_access_policy" ON merchants;

CREATE POLICY "merchants_access_policy"
  ON merchants
  FOR ALL
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM merchant_logisticians
      WHERE merchant_id = merchants.id
      AND logistician_id = auth.uid()
    )
  );

-- Fonction pour lier un marchand à un logisticien
CREATE OR REPLACE FUNCTION link_merchant_to_logistician(
  merchant_id uuid,
  logistician_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO merchant_logisticians (merchant_id, logistician_id)
  VALUES (merchant_id, logistician_id)
  ON CONFLICT (merchant_id, logistician_id) DO NOTHING;
END;
$$;

-- Fonction pour délier un marchand d'un logisticien
CREATE OR REPLACE FUNCTION unlink_merchant_from_logistician(
  merchant_id uuid,
  logistician_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM merchant_logisticians
  WHERE merchant_id = $1
  AND logistician_id = $2;
END;
$$;