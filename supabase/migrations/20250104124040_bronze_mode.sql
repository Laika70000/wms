-- Drop existing products table
DROP TABLE IF EXISTS products CASCADE;

-- Recreate products table with snake_case column names
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  weight numeric(10,2),
  width numeric(10,2),
  height numeric(10,2),
  depth numeric(10,2),
  min_stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "Users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "Users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  )
  WITH CHECK (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Create indexes
CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);