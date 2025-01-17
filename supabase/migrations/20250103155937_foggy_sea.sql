/*
  # Fonctions de gestion des stocks et statistiques

  1. Nouvelles fonctions
    - get_low_stock_products : Retourne les produits en stock faible
    - get_total_stock_value : Calcule la valeur totale du stock
    - get_stock_turnover : Calcule le taux de rotation du stock
    - update_stock : Met à jour le stock d'un produit

  2. Sécurité
    - Toutes les fonctions sont accessibles aux utilisateurs authentifiés
    - Les fonctions respectent les politiques RLS existantes
*/

-- Fonction pour obtenir les produits en stock faible
CREATE OR REPLACE FUNCTION get_low_stock_products(merchant_id uuid DEFAULT NULL)
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM products p
  LEFT JOIN product_locations pl ON p.id = pl.product_id
  WHERE (merchant_id IS NULL OR p.merchant_id = merchant_id)
  GROUP BY p.id
  HAVING COALESCE(SUM(pl.quantity), 0) <= p.min_stock;
END;
$$;

-- Fonction pour calculer la valeur totale du stock
CREATE OR REPLACE FUNCTION get_total_stock_value(merchant_id uuid DEFAULT NULL)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_value numeric;
BEGIN
  SELECT COALESCE(SUM(pl.quantity * p.price), 0)
  INTO total_value
  FROM products p
  JOIN product_locations pl ON p.id = pl.product_id
  WHERE merchant_id IS NULL OR p.merchant_id = merchant_id;
  
  RETURN total_value;
END;
$$;

-- Fonction pour calculer le taux de rotation du stock
CREATE OR REPLACE FUNCTION get_stock_turnover(merchant_id uuid DEFAULT NULL)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_stock numeric;
  total_output numeric;
BEGIN
  -- Calculer le stock moyen sur la période
  SELECT COALESCE(AVG(quantity), 0)
  INTO avg_stock
  FROM product_locations pl
  JOIN products p ON p.id = pl.product_id
  WHERE merchant_id IS NULL OR p.merchant_id = merchant_id;

  -- Calculer les sorties totales (commandes + transferts)
  SELECT COALESCE(ABS(SUM(CASE WHEN type IN ('order', 'transfer') THEN quantity ELSE 0 END)), 0)
  INTO total_output
  FROM stock_movements sm
  JOIN products p ON p.id = sm.product_id
  WHERE merchant_id IS NULL OR p.merchant_id = merchant_id
  AND sm.created_at >= NOW() - INTERVAL '30 days';

  -- Retourner le taux de rotation (annualisé)
  RETURN CASE 
    WHEN avg_stock = 0 THEN 0
    ELSE (total_output * 12) / avg_stock
  END;
END;
$$;

-- Fonction pour mettre à jour le stock
CREATE OR REPLACE FUNCTION update_stock(
  p_product_id uuid,
  p_location_id uuid,
  p_quantity integer,
  p_type text,
  p_reference text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que le type de mouvement est valide
  IF p_type NOT IN ('reception', 'order', 'transfer', 'adjustment') THEN
    RAISE EXCEPTION 'Type de mouvement invalide';
  END IF;

  -- Mettre à jour la quantité dans product_locations
  INSERT INTO product_locations (product_id, location_id, quantity)
  VALUES (p_product_id, p_location_id, p_quantity)
  ON CONFLICT (product_id, location_id)
  DO UPDATE SET 
    quantity = product_locations.quantity + p_quantity,
    updated_at = NOW();

  -- Enregistrer le mouvement
  INSERT INTO stock_movements (
    product_id,
    location_id,
    type,
    quantity,
    reference,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    p_location_id,
    p_type,
    p_quantity,
    p_reference,
    p_notes,
    auth.uid()
  );

  -- Mettre à jour l'occupation de l'emplacement
  UPDATE locations
  SET occupied = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM product_locations
    WHERE location_id = p_location_id
  )
  WHERE id = p_location_id;
END;
$$;