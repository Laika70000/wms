/*
  # Correction des permissions RLS pour les produits

  1. Changements
    - Suppression des politiques existantes
    - Création d'une politique simplifiée sans accès direct à auth.users
    - Utilisation des claims JWT pour la vérification des rôles
*/

-- Suppression des politiques et triggers existants
DROP POLICY IF EXISTS "products_policy" ON products;
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP FUNCTION IF EXISTS set_merchant_id();

-- Création d'une politique unique pour toutes les opérations
CREATE POLICY "products_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    auth.jwt()->>'role' = 'logistician'
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    auth.jwt()->>'role' = 'logistician'
  );

-- Création du trigger pour définir merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.merchant_id IS NULL THEN
    NEW.merchant_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Création du trigger
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Activation de RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Création d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);