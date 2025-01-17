/*
  # Correction finale des politiques RLS pour les produits

  1. Changements
    - Suppression des politiques existantes
    - Création d'une politique unique simplifiée
    - Correction du trigger set_merchant_id
    - Ajout d'index pour améliorer les performances
*/

-- Suppression des politiques et triggers existants
DROP POLICY IF EXISTS "Allow merchants to read own products" ON products;
DROP POLICY IF EXISTS "Allow merchants to insert products" ON products;
DROP POLICY IF EXISTS "Allow merchants to update own products" ON products;
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP FUNCTION IF EXISTS set_merchant_id();

-- Création d'une politique unique pour toutes les opérations
CREATE POLICY "products_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'merchant'
      AND id = products.merchant_id
      OR raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'merchant'
      AND id = COALESCE(products.merchant_id, auth.uid())
      OR raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Création du trigger pour définir merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.merchant_id IS NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users 
       WHERE id = auth.uid() 
       AND raw_user_meta_data->>'role' = 'merchant'
     )
  THEN
    NEW.merchant_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création du trigger
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Activation de RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Création d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_merchant_role ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_sku_merchant ON products(sku, merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category_merchant ON products(category, merchant_id);