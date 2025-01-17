/*
  # Correction des politiques RLS pour les produits
  
  1. Changements
    - Suppression des politiques existantes
    - Création d'une nouvelle politique simplifiée
    - Ajout d'un trigger SECURITY DEFINER pour merchant_id
    - Optimisation des index
  
  2. Sécurité
    - Utilisation de SECURITY DEFINER pour le trigger
    - Vérification du rôle via auth.jwt()
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

-- Création de la fonction trigger avec SECURITY DEFINER
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.merchant_id IS NULL THEN
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

-- Optimisation des index (avec vérification d'existence)
DO $$ 
BEGIN
  -- Suppression des anciens index s'ils existent
  DROP INDEX IF EXISTS idx_products_merchant;
  DROP INDEX IF EXISTS idx_products_sku;
  DROP INDEX IF EXISTS idx_products_category;
  
  -- Création des nouveaux index s'ils n'existent pas
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_merchant_id') THEN
    CREATE INDEX idx_products_merchant_id ON products(merchant_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_sku_unique') THEN
    CREATE UNIQUE INDEX idx_products_sku_unique ON products(sku);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_category_merchant') THEN
    CREATE INDEX idx_products_category_merchant ON products(category, merchant_id);
  END IF;
END $$;