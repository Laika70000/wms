/*
  # Returns Management System

  1. New Tables
    - returns: Track return requests
    - return_items: Individual items being returned
    - return_inspections: Quality control inspections
    - return_refunds: Refund processing

  2. Security
    - RLS enabled on all tables
    - Policies for merchants and logisticians
    - Secure functions with SECURITY DEFINER

  3. Changes
    - Drop and recreate tables with correct references
    - Fix location reference type
    - Add proper indexes
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS return_refunds CASCADE;
DROP TABLE IF EXISTS return_inspections CASCADE;
DROP TABLE IF EXISTS return_items CASCADE;
DROP TABLE IF EXISTS returns CASCADE;

-- Create returns table
CREATE TABLE returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('customer', 'carrier')),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'received', 'inspected', 'completed', 'rejected')),
  tracking_number text,
  carrier text,
  reason text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create return_items table
CREATE TABLE return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid REFERENCES returns(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  order_item_id uuid REFERENCES order_items(id) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  reason text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('new', 'like_new', 'damaged', 'unsellable')),
  storage_zone text,
  status text NOT NULL CHECK (status IN ('pending', 'inspected', 'restocked', 'disposed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create return_inspections table
CREATE TABLE return_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_item_id uuid REFERENCES return_items(id) NOT NULL,
  inspector_id uuid REFERENCES auth.users(id) NOT NULL,
  condition text NOT NULL CHECK (condition IN ('new', 'like_new', 'damaged', 'unsellable')),
  action text NOT NULL CHECK (action IN ('restock', 'refurbish', 'dispose')),
  notes text,
  photos text[],
  inspection_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create return_refunds table
CREATE TABLE return_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid REFERENCES returns(id) NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processed', 'failed')),
  processor text NOT NULL,
  processor_ref text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_refunds ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "returns_access_policy"
  ON returns
  FOR ALL
  TO authenticated
  USING (
    merchant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "return_items_access_policy"
  ON return_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM returns
      WHERE returns.id = return_id
      AND (
        returns.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

CREATE POLICY "return_inspections_access_policy"
  ON return_inspections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "return_refunds_access_policy"
  ON return_refunds
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM returns
      WHERE returns.id = return_id
      AND (
        returns.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

-- Create function to process return completion
CREATE OR REPLACE FUNCTION process_return_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Create stock movements for restocked items
    INSERT INTO stock_movements (
      product_id,
      type,
      quantity,
      reference,
      notes,
      created_by
    )
    SELECT 
      ri.product_id,
      'return',
      ri.quantity,
      NEW.id::text,
      'Return restock',
      NEW.created_by
    FROM return_items ri
    WHERE ri.return_id = NEW.id
    AND ri.status = 'restocked';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for return completion
CREATE TRIGGER process_return_completion_trigger
  AFTER UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION process_return_completion();

-- Create function to get return statistics
CREATE OR REPLACE FUNCTION get_return_statistics(
  p_merchant_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  total_returns bigint,
  total_items bigint,
  restocked_items bigint,
  disposed_items bigint,
  total_refund_amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT r.id)::bigint as total_returns,
    SUM(ri.quantity)::bigint as total_items,
    SUM(CASE WHEN ri.status = 'restocked' THEN ri.quantity ELSE 0 END)::bigint as restocked_items,
    SUM(CASE WHEN ri.status = 'disposed' THEN ri.quantity ELSE 0 END)::bigint as disposed_items,
    COALESCE(SUM(rf.amount), 0) as total_refund_amount
  FROM returns r
  LEFT JOIN return_items ri ON ri.return_id = r.id
  LEFT JOIN return_refunds rf ON rf.return_id = r.id AND rf.status = 'processed'
  WHERE r.merchant_id = p_merchant_id
  AND r.created_at BETWEEN p_start_date AND p_end_date;
END;
$$;

-- Create indexes
CREATE INDEX idx_returns_merchant ON returns(merchant_id);
CREATE INDEX idx_returns_order ON returns(order_id);
CREATE INDEX idx_returns_status ON returns(status);
CREATE INDEX idx_return_items_return ON return_items(return_id);
CREATE INDEX idx_return_items_product ON return_items(product_id);
CREATE INDEX idx_return_items_status ON return_items(status);
CREATE INDEX idx_return_inspections_item ON return_inspections(return_item_id);
CREATE INDEX idx_return_refunds_return ON return_refunds(return_id);
CREATE INDEX idx_return_refunds_status ON return_refunds(status);