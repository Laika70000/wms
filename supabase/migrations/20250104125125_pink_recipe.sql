/*
  # Correction finale des politiques RLS pour les produits
  
  1. Changements
    - Suppression de toutes les politiques existantes
    - Création d'une nouvelle politique simplifiée
    - Ajout d'une fonction helper pour la vérification des rôles
    - Optimisation des triggers
  
  2. Sécurité
    - Utilisation de SECURITY DEFINER pour les fonctions
    - Vérification du rôle via auth.jwt() et raw_user_meta_data
*/

-- Suppression des politiques et triggers existants
DROP POLICY IF EXISTS "products_policy" ON products;
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP FUNCTION IF EXISTS set_merchant_id();

-- Fonction helper pour vérifier le rôle
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'role',
    users.raw_user_meta_data ->> 'role'
  )
  FROM auth.users
  WHERE id = auth.uid();
$$;

-- Création d'une politique unique pour toutes les opérations
CREATE POLICY "products_policy"
  ON products
  FOR ALL
  TO authenticated
  USING (
    CASE auth.get_user_role()
      WHEN 'merchant' THEN merchant_id = auth.uid()
      WHEN 'logistician' THEN true
      ELSE false
    END
  )
  WITH CHECK (
    CASE auth.get_user_role()
      WHEN 'merchant' THEN merchant_id = auth.uid()
      WHEN 'logistician' THEN true
      ELSE false
    END
  );

-- Création de la fonction trigger avec SECURITY DEFINER
CREATE OR REPLACE FUNCTION set_merchant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.merchant_id IS NULL AND auth.get_user_role() = 'merchant' THEN
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