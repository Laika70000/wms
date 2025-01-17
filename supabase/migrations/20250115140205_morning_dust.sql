/*
  # WMS Features Implementation

  1. Tables
    - inbound_shipments: Track incoming shipments
    - inbound_items: Track items within shipments
    - inventory_adjustments: Record stock adjustments
    - carrier_claims: Manage carrier claims

  2. Features
    - Fast inbound processing (24h)
    - Real-time stock tracking
    - 72h carrier claim window
    - Automated stock updates
*/

-- Create inbound_shipments table
CREATE TABLE inbound_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  reference_number text NOT NULL UNIQUE,
  carrier text NOT NULL,
  tracking_number text,
  status text NOT NULL CHECK (status IN ('pending', 'received', 'processed', 'completed', 'cancelled')),
  expected_arrival timestamptz,
  actual_arrival timestamptz,
  processing_started_at timestamptz,
  processing_completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create inbound_items table
CREATE TABLE inbound_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES inbound_shipments(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  expected_quantity integer NOT NULL CHECK (expected_quantity > 0),
  received_quantity integer CHECK (received_quantity >= 0),
  damaged_quantity integer DEFAULT 0 CHECK (damaged_quantity >= 0),
  storage_zone text NOT NULL,
  label_printed boolean DEFAULT false,
  status text NOT NULL CHECK (status IN ('pending', 'received', 'stored', 'discrepancy')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory_adjustments table
CREATE TABLE inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) NOT NULL,
  storage_zone text NOT NULL,
  quantity integer NOT NULL,
  type text NOT NULL CHECK (type IN ('count', 'damage', 'loss', 'found')),
  reason text NOT NULL,
  reference_number text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Create carrier_claims table
CREATE TABLE carrier_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES inbound_shipments(id) NOT NULL,
  claim_number text,
  type text NOT NULL CHECK (type IN ('damage', 'loss', 'delay')),
  status text NOT NULL CHECK (status IN ('draft', 'submitted', 'in_progress', 'resolved', 'rejected')),
  amount numeric(10,2),
  submitted_at timestamptz,
  resolved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inbound_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_claims ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "inbound_shipments_policy"
  ON inbound_shipments
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

CREATE POLICY "inbound_items_policy"
  ON inbound_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inbound_shipments
      WHERE inbound_shipments.id = shipment_id
      AND (
        inbound_shipments.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

CREATE POLICY "inventory_adjustments_policy"
  ON inventory_adjustments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "carrier_claims_policy"
  ON carrier_claims
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inbound_shipments
      WHERE inbound_shipments.id = shipment_id
      AND (
        inbound_shipments.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

-- Create function to check claim deadline
CREATE OR REPLACE FUNCTION check_claim_deadline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ship_arrival timestamptz;
BEGIN
  SELECT actual_arrival INTO ship_arrival
  FROM inbound_shipments
  WHERE id = NEW.shipment_id;

  IF ship_arrival < NOW() - INTERVAL '72 hours' THEN
    RAISE EXCEPTION 'Claim deadline (72 hours) has passed';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for claim deadline
CREATE TRIGGER check_claim_deadline_trigger
  BEFORE INSERT ON carrier_claims
  FOR EACH ROW
  EXECUTE FUNCTION check_claim_deadline();

-- Create function to update stock on inbound completion
CREATE OR REPLACE FUNCTION process_inbound_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Create stock movements for received items
    INSERT INTO stock_movements (
      product_id,
      type,
      quantity,
      reference,
      notes,
      created_by
    )
    SELECT 
      ii.product_id,
      'reception',
      ii.received_quantity,
      NEW.reference_number,
      'Inbound shipment completion',
      NEW.created_by
    FROM inbound_items ii
    WHERE ii.shipment_id = NEW.id
    AND ii.status = 'stored'
    AND ii.received_quantity > 0;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for inbound completion
CREATE TRIGGER process_inbound_completion_trigger
  AFTER UPDATE ON inbound_shipments
  FOR EACH ROW
  EXECUTE FUNCTION process_inbound_completion();

-- Create indexes
CREATE INDEX idx_inbound_shipments_merchant ON inbound_shipments(merchant_id);
CREATE INDEX idx_inbound_shipments_status ON inbound_shipments(status);
CREATE INDEX idx_inbound_items_shipment ON inbound_items(shipment_id);
CREATE INDEX idx_inbound_items_product ON inbound_items(product_id);
CREATE INDEX idx_inventory_adjustments_product ON inventory_adjustments(product_id);
CREATE INDEX idx_carrier_claims_shipment ON carrier_claims(shipment_id);