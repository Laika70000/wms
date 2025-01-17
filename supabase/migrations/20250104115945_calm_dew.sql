/*
  # Add orders table and related schemas

  1. New Tables
    - orders: Stores order information
    - order_items: Stores order line items
    - refunds: Stores refund information
    - returns: Stores return information
    
  2. Security
    - Enable RLS on all tables
    - Add policies for merchants and logisticians
*/

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'ready', 'shipped', 'delivered', 'returned', 'cancelled', 'refunded')),
  source text NOT NULL CHECK (source IN ('manual', 'shopify', 'amazon', 'marketplace')),
  carrier text NOT NULL CHECK (carrier IN ('ups', 'fedex', 'dhl', 'local')),
  priority text NOT NULL CHECK (priority IN ('high', 'normal', 'low')),
  total numeric(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  notes text,
  tags text[],
  parent_order_id uuid REFERENCES orders(id),
  refund_status text CHECK (refund_status IN ('none', 'partial', 'full')),
  refund_amount numeric(10,2),
  refund_reason text,
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL,
  refunded boolean DEFAULT false,
  return_reason text,
  created_at timestamptz DEFAULT now()
);

-- Create refunds table
CREATE TABLE refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  amount numeric(10,2) NOT NULL,
  reason text NOT NULL,
  items jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  processed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create returns table
CREATE TABLE returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  items jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_by uuid REFERENCES auth.users(id),
  processed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Merchants can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (merchant_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "Merchants can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (merchant_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "Merchants can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (merchant_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (merchant_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Indexes for better performance
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_returns_order_id ON returns(order_id);

-- Function to get merchant order statistics
CREATE OR REPLACE FUNCTION get_merchant_order_stats(merchant_id uuid)
RETURNS TABLE (
  total_orders bigint,
  pending_orders bigint,
  last_activity timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_orders,
    COUNT(*) FILTER (WHERE status = 'pending')::bigint as pending_orders,
    MAX(updated_at) as last_activity
  FROM orders
  WHERE orders.merchant_id = $1;
END;
$$;