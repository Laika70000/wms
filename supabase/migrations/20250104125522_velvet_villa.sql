/*
  # Correction finale des politiques RLS pour les produits
  
  1. Changements
    - Simplification des politiques RLS
    - Utilisation de current_setting pour les claims JWT
    - Suppression des index redondants
  
  2. Sécurité
    - Vérification simplifiée des rôles
    - Protection des données par merchant_id
*/

-- Suppression des politiques existantes
DROP POLICY IF EXISTS "products_access_policy" ON products;
DROP POLICY IF EXISTS "products_policy" ON products;

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

-- Mise à jour de la fonction trigger
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

-- Suppression et recréation du trigger si nécessaire
DROP TRIGGER IF EXISTS set_merchant_id_trigger ON products;

CREATE TRIGGER set_merchant_id_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_merchant_id();

-- Activation de RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;