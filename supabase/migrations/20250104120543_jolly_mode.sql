/*
  # Create orders view and policies

  1. New Objects
    - orders_view: Vue pour exposer les commandes avec des noms de colonnes en camelCase
    - insert_order(): Fonction pour gérer les insertions via la vue
    
  2. Security
    - Politiques RLS pour la vue
*/

-- Create a view for orders with camelCase columns
CREATE VIEW orders_view AS
SELECT
  o.id,
  o.order_number AS "orderNumber",
  o.customer_name AS "customerName",
  o.email,
  o.phone,
  o.date,
  o.status,
  o.source,
  o.carrier,
  o.priority,
  o.total,
  o.shipping_address AS "shippingAddress",
  o.billing_address AS "billingAddress",
  o.notes,
  o.tags,
  o.parent_order_id AS "parentOrderId",
  o.refund_status AS "refundStatus",
  o.refund_amount AS "refundAmount",
  o.refund_reason AS "refundReason",
  o.merchant_id AS "merchantId",
  o.created_at AS "createdAt",
  o.updated_at AS "updatedAt",
  (
    SELECT json_agg(
      json_build_object(
        'id', oi.id,
        'productId', oi.product_id,
        'productName', p.name,
        'quantity', oi.quantity,
        'price', oi.price,
        'refunded', oi.refunded,
        'returnReason', oi.return_reason
      )
    )
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = o.id
  ) AS items
FROM orders o;

-- Add function to handle inserts through the view
CREATE OR REPLACE FUNCTION insert_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO orders (
    order_number,
    customer_name,
    email,
    phone,
    date,
    status,
    source,
    carrier,
    priority,
    total,
    shipping_address,
    billing_address,
    notes,
    tags,
    parent_order_id,
    refund_status,
    refund_amount,
    refund_reason,
    merchant_id
  ) VALUES (
    NEW."orderNumber",
    NEW."customerName",
    NEW.email,
    NEW.phone,
    NEW.date,
    NEW.status,
    NEW.source,
    NEW.carrier,
    NEW.priority,
    NEW.total,
    NEW."shippingAddress",
    NEW."billingAddress",
    NEW.notes,
    NEW.tags,
    NEW."parentOrderId",
    NEW."refundStatus",
    NEW."refundAmount",
    NEW."refundReason",
    NEW."merchantId"
  )
  RETURNING * INTO NEW;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for handling inserts
CREATE TRIGGER orders_view_insert
  INSTEAD OF INSERT ON orders_view
  FOR EACH ROW
  EXECUTE FUNCTION insert_order();

-- Create policies for the view
CREATE POLICY "Users can access orders view"
  ON orders
  TO authenticated
  USING (
    merchant_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status 
ON orders(merchant_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_date_merchant 
ON orders(date, merchant_id);