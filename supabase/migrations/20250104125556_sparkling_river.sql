/*
  # Correction finale des politiques RLS pour les produits
  
  1. Changements
    - Suppression propre des politiques et triggers existants
    - Simplification de la logique d'accès
    - Utilisation de current_setting pour les JWT claims
  
  2. Sécurité
    - Vérification robuste des rôles
    - Protection des données par merchant_id
    - Trigger SECURITY DEFINER pour merchant_id
*/

-- Suppression propre des éléments existants
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP POLICY IF EXISTS "products_policy" ON products;
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;
DROP FUNCTION IF EXISTS set_merchant_id();

-- Création d'une politique unique et robuste
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

-- Fonction trigger sécurisée pour merchant_id
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

-- Création du trigger
CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Activation de RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;