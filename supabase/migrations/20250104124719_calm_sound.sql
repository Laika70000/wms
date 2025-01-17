/*
  # Correction des politiques RLS pour les produits

  1. Changements
    - Suppression des politiques existantes
    - Création de politiques séparées pour chaque opération
    - Ajout d'un trigger pour définir automatiquement merchant_id
*/

-- Suppression des politiques existantes
DROP POLICY IF EXISTS "Allow merchant and logistician access" ON products;

-- Création de politiques séparées pour plus de clarté
CREATE POLICY "Allow merchants to read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "Allow merchants to insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'merchant'
    )
  );

CREATE POLICY "Allow merchants to update own products"
  ON products
  FOR UPDATE
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

-- Création du trigger pour définir merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.merchant_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Suppression du trigger s'il existe déjà
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;

-- Création du trigger
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Activation de RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;