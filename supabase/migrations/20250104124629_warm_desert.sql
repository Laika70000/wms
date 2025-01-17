/*
  # Correction des politiques RLS pour les produits

  1. Changements
    - Suppression des politiques existantes
    - Création d'une nouvelle politique simplifiée
    - Mise à jour des triggers
*/

-- Suppression des politiques existantes
DROP POLICY IF EXISTS "Allow merchant and logistician access" ON products;

-- Création d'une politique simplifiée pour toutes les opérations
CREATE POLICY "Allow merchant and logistician access"
  ON products
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Mise à jour du trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création du trigger pour updated_at s'il n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'products_update_updated_at_trigger'
  ) THEN
    CREATE TRIGGER products_update_updated_at_trigger
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;