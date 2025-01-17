/*
  # Update inventory management functions
  
  1. Changes
    - Fix parameter naming in get_low_stock_products function
    - Add security definer to all functions
    - Improve error handling in update_stock function
    
  2. Functions Updated
    - get_low_stock_products
    - get_total_stock_value
    - get_stock_turnover
    - update_stock
*/

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_low_stock_products(uuid);
DROP FUNCTION IF EXISTS get_total_stock_value(uuid);
DROP FUNCTION IF EXISTS get_stock_turnover(uuid);
DROP FUNCTION IF EXISTS update_stock(uuid, uuid, integer, text, text, text);

-- Recreate functions with proper parameter names
CREATE OR REPLACE FUNCTION get_low_stock_products(p_merchant_id uuid DEFAULT NULL)
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM products p
  LEFT JOIN product_locations pl ON p.id = pl.product_id
  WHERE (p_merchant_id IS NULL OR p.merchant_id = p_merchant_id)
  GROUP BY p.id
  HAVING COALESCE(SUM(pl.quantity), 0) <= p.min_stock;
END;
$$;

CREATE OR REPLACE FUNCTION get_total_stock_value(p_merchant_id uuid DEFAULT NULL)
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
  WHERE p_merchant_id IS NULL OR p.merchant_id = p_merchant_id;
  
  RETURN total_value;
END;
$$;

CREATE OR REPLACE FUNCTION get_stock_turnover(p_merchant_id uuid DEFAULT NULL)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_stock numeric;
  total_output numeric;
BEGIN
  -- Calculate average stock
  SELECT COALESCE(AVG(pl.quantity), 0)
  INTO avg_stock
  FROM product_locations pl
  JOIN products p ON p.id = pl.product_id
  WHERE p_merchant_id IS NULL OR p.merchant_id = p_merchant_id;

  -- Calculate total output (orders + transfers)
  SELECT COALESCE(ABS(SUM(CASE WHEN sm.type IN ('order', 'transfer') THEN sm.quantity ELSE 0 END)), 0)
  INTO total_output
  FROM stock_movements sm
  JOIN products p ON p.id = sm.product_id
  WHERE p_merchant_id IS NULL OR p.merchant_id = p_merchant_id
  AND sm.created_at >= NOW() - INTERVAL '30 days';

  -- Return annualized turnover rate
  RETURN CASE 
    WHEN avg_stock = 0 THEN 0
    ELSE (total_output * 12) / avg_stock
  END;
END;
$$;

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
  -- Validate movement type
  IF p_type NOT IN ('reception', 'order', 'transfer', 'adjustment') THEN
    RAISE EXCEPTION 'Invalid movement type: %', p_type;
  END IF;

  -- Update quantity in product_locations
  INSERT INTO product_locations (product_id, location_id, quantity)
  VALUES (p_product_id, p_location_id, p_quantity)
  ON CONFLICT (product_id, location_id)
  DO UPDATE SET 
    quantity = product_locations.quantity + p_quantity,
    updated_at = NOW();

  -- Record movement
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

  -- Update location occupancy
  UPDATE locations
  SET occupied = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM product_locations
    WHERE location_id = p_location_id
  )
  WHERE id = p_location_id;
END;
$$;