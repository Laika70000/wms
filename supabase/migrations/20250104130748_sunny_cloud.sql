-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_low_stock_products();

-- Create function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM products p
  LEFT JOIN product_locations pl ON p.id = pl.product_id
  GROUP BY p.id
  HAVING COALESCE(SUM(pl.quantity), 0) <= p.min_stock;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_low_stock_products() TO authenticated;