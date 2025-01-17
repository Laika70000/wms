/*
  # Correction des fonctions de base de données

  1. Corrections
    - Résolution de l'ambiguïté de la colonne merchant_id
    - Ajout de la colonne price manquante
    - Optimisation des requêtes

  2. Changements
    - Modification des fonctions get_low_stock_products et get_total_stock_value
    - Ajout d'alias de table pour éviter les ambiguïtés
*/

-- Correction de la fonction get_low_stock_products
CREATE OR REPLACE FUNCTION get_low_stock_products(p_merchant_id uuid DEFAULT NULL)
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.*
  FROM products p
  LEFT JOIN product_locations pl ON p.id = pl.product_id
  WHERE (p_merchant_id IS NULL OR p.merchant_id = p_merchant_id)
  GROUP BY p.id
  HAVING COALESCE(SUM(pl.quantity), 0) <= p.min_stock;
END;
$$;

-- Correction de la fonction get_total_stock_value
CREATE OR REPLACE FUNCTION get_total_stock_value(p_merchant_id uuid DEFAULT NULL)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_value numeric;
BEGIN
  SELECT COALESCE(SUM(pl.quantity * COALESCE(p.price, 0)), 0)
  INTO total_value
  FROM products p
  JOIN product_locations pl ON p.id = pl.product_id
  WHERE (p_merchant_id IS NULL OR p.merchant_id = p_merchant_id);
  
  RETURN total_value;
END;
$$;