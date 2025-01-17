/*
  # Correction finale des politiques RLS pour les produits
  
  1. Changements
    - Simplification maximale des politiques
    - Utilisation directe de auth.role()
    - Suppression des dépendances à auth.users
  
  2. Sécurité
    - Vérification simplifiée des rôles
    - Protection des données par merchant_id
*/

-- Suppression des politiques et fonctions existantes
DROP POLICY IF EXISTS "products_policy" ON products;
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP FUNCTION IF EXISTS set_merchant_id();

-- Création d'une politique simple et robuste
CREATE POLICY "products_access_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    current_setting('request.jwt.claims', true)::json->>'role' = 'logistician'
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    current_setting('request.jwt.claims', true)::json->>'role' = 'logistician'
  );

-- Trigger pour définir automatiquement merchant_id
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.merchant_id IS NULL THEN
    NEW.merchant_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Activation de RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Index optimisés
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_merchant ON products(category, merchant_id);