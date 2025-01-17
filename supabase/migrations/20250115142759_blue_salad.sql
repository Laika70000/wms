-- Create carrier_services table if not exists
CREATE TABLE IF NOT EXISTS carrier_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('express', 'standard', 'economy')),
  transit_time_min integer,
  transit_time_max integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(carrier_id, code)
);

-- Create carrier_zones table if not exists
CREATE TABLE IF NOT EXISTS carrier_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  countries text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(carrier_id, code)
);

-- Create carrier_rates table if not exists
CREATE TABLE IF NOT EXISTS carrier_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  service_id uuid REFERENCES carrier_services(id) NOT NULL,
  zone_id uuid REFERENCES carrier_zones(id) NOT NULL,
  weight_from numeric(10,3) NOT NULL,
  weight_to numeric(10,3) NOT NULL,
  price numeric(10,2) NOT NULL,
  fuel_surcharge_percent numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_weight_range CHECK (weight_from <= weight_to)
);

-- Create shipments table if not exists
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  service_id uuid REFERENCES carrier_services(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'label_created', 'picked_up', 'in_transit', 'delivered', 'exception')),
  tracking_number text,
  label_url text,
  weight numeric(10,3),
  length numeric(10,2),
  width numeric(10,2),
  height numeric(10,2),
  declared_value numeric(10,2),
  shipping_cost numeric(10,2),
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create shipment_events table if not exists
CREATE TABLE IF NOT EXISTS shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipments(id) NOT NULL,
  status text NOT NULL,
  location text,
  description text,
  occurred_at timestamptz NOT NULL,
  raw_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create carrier_allocation_rules table if not exists
CREATE TABLE IF NOT EXISTS carrier_allocation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  name text NOT NULL,
  priority integer NOT NULL,
  conditions jsonb NOT NULL,
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  service_id uuid REFERENCES carrier_services(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE carrier_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_allocation_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "carrier_services_policy" ON carrier_services;
DROP POLICY IF EXISTS "carrier_zones_policy" ON carrier_zones;
DROP POLICY IF EXISTS "carrier_rates_policy" ON carrier_rates;
DROP POLICY IF EXISTS "shipments_policy" ON shipments;
DROP POLICY IF EXISTS "shipment_events_policy" ON shipment_events;
DROP POLICY IF EXISTS "carrier_allocation_rules_policy" ON carrier_allocation_rules;

-- Create new policies with unique names
CREATE POLICY "tms_carrier_services_access"
  ON carrier_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "tms_carrier_zones_access"
  ON carrier_zones
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "tms_carrier_rates_access"
  ON carrier_rates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "tms_shipments_access"
  ON shipments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = shipments.order_id
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

CREATE POLICY "tms_shipment_events_access"
  ON shipment_events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments s
      JOIN orders o ON o.id = s.order_id
      WHERE s.id = shipment_events.shipment_id
      AND (
        o.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

CREATE POLICY "tms_carrier_allocation_rules_access"
  ON carrier_allocation_rules
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_carrier_services_carrier ON carrier_services(carrier_id);
CREATE INDEX IF NOT EXISTS idx_carrier_zones_carrier ON carrier_zones(carrier_id);
CREATE INDEX IF NOT EXISTS idx_carrier_rates_lookup ON carrier_rates(carrier_id, service_id, zone_id);
CREATE INDEX IF NOT EXISTS idx_carrier_allocation_rules_merchant ON carrier_allocation_rules(merchant_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment ON shipment_events(shipment_id);