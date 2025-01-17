/*
  # Add price column to products table
  
  1. Changes
    - Add price column to products table for stock value calculations
    - Update existing functions to use the new price column
    
  2. Schema Updates
    - Add price column to products table with NOT NULL constraint and default value
*/

-- Add price column to products table
ALTER TABLE products 
ADD COLUMN price numeric(10,2) NOT NULL DEFAULT 0;

-- Drop and recreate get_total_stock_value function to use the new price column
DROP FUNCTION IF EXISTS get_total_stock_value(uuid);

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
  WHERE (p_merchant_id IS NULL OR p.merchant_id = p_merchant_id);
  
  RETURN total_value;
END;
$$;