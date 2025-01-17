/*
  # Fix orders policies and indexes

  1. Changes
    - Correction des politiques RLS pour les commandes
    - Utilisation de raw_user_meta_data au lieu de jwt()
    - Ajout d'index optimisés
    
  2. Security
    - Maintien de la sécurité par rôle utilisateur
    - Permission d'insertion pour les marchands et logisticiens
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can access orders view" ON orders;
DROP POLICY IF EXISTS "Merchants can read own orders" ON orders;
DROP POLICY IF EXISTS "Merchants can insert own orders" ON orders;
DROP POLICY IF EXISTS "Merchants can update own orders" ON orders;

-- Create new policies for orders
CREATE POLICY "Users can read orders"
  ON orders
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

CREATE POLICY "Users can insert orders"
  ON orders
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

CREATE POLICY "Users can update orders"
  ON orders
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

-- Create policies for order_items
CREATE POLICY "Users can read order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

CREATE POLICY "Users can insert order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status 
ON orders(merchant_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_date_merchant 
ON orders(date, merchant_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_product 
ON order_items(order_id, product_id);