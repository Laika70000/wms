/*
  # Correction des politiques RLS pour les produits

  1. Changements
    - Suppression des politiques existantes
    - Création d'une nouvelle politique simplifiée
    - Activation de RLS
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

-- Activation de RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;