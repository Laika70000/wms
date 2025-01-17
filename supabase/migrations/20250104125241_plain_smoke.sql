/*
  # Correction finale des politiques RLS pour les produits
  
  1. Changements
    - Suppression de toutes les politiques existantes
    - Création d'une politique simplifiée
    - Simplification de la vérification des rôles
    - Optimisation des triggers
  
  2. Sécurité
    - Utilisation de SECURITY DEFINER pour les fonctions
    - Vérification du rôle via raw_user_meta_data uniquement
*/

-- Suppression des politiques et triggers existants
DROP POLICY IF EXISTS "products_policy" ON products;
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP FUNCTION IF EXISTS set_merchant_id();
DROP FUNCTION IF EXISTS auth.get_user_role();

-- Création d'une politique unique pour toutes les opérations
CREATE POLICY "products_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        (raw_user_meta_data->>'role' = 'merchant' AND merchant_id = auth.uid())
        OR raw_user_meta_data->>'role' = 'logistician'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        (raw_user_meta_data->>'role' = 'merchant' AND merchant_id = auth.uid())
        OR raw_user_meta_data->>'role' = 'logistician'
      )
    )
  );

-- Création de la fonction trigger avec SECURITY DEFINER
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.merchant_id IS NULL AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'merchant'
  ) THEN
    NEW.merchant_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Création du trigger
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Activation de RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Optimisation des index
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category, merchant_id);