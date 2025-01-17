/*
  # Transport Management System Schema
  
  Creates tables and functions for:
  1. Carriers and shipping rates
  2. Shipments and tracking
  3. Performance metrics
  4. Label generation tracking
*/

-- Create carriers table
CREATE TABLE carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('express', 'standard', 'economy')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  api_key text,
  api_secret text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shipping_rates table
CREATE TABLE shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  zone text NOT NULL,
  weight_from numeric(10,2) NOT NULL,
  weight_to numeric(10,2) NOT NULL,
  price numeric(10,2) NOT NULL,
  transit_time_min integer NOT NULL,
  transit_time_max integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT weight_range_valid CHECK (weight_from <= weight_to)
);

-- Create shipments table
CREATE TABLE shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) NOT NULL,
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  tracking_number text,
  status text NOT NULL CHECK (status IN ('pending', 'label_created', 'picked_up', 'in_transit', 'delivered', 'exception')),
  shipping_label_url text,
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  weight numeric(10,2),
  cost numeric(10,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create shipment_tracking_updates table
CREATE TABLE shipment_tracking_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipments(id) NOT NULL,
  status text NOT NULL,
  location text,
  description text,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create carrier_performance_metrics table
CREATE TABLE carrier_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_shipments integer NOT NULL DEFAULT 0,
  on_time_deliveries integer NOT NULL DEFAULT 0,
  delayed_deliveries integer NOT NULL DEFAULT 0,
  damaged_shipments integer NOT NULL DEFAULT 0,
  average_transit_time numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_period CHECK (period_start <= period_end)
);

-- Enable RLS
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "carriers_access_policy"
  ON carriers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "shipping_rates_access_policy"
  ON shipping_rates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

CREATE POLICY "shipments_access_policy"
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

CREATE POLICY "shipment_tracking_updates_access_policy"
  ON shipment_tracking_updates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments s
      JOIN orders o ON o.id = s.order_id
      WHERE s.id = shipment_tracking_updates.shipment_id
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

CREATE POLICY "carrier_performance_metrics_access_policy"
  ON carrier_performance_metrics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'logistician'
    )
  );

-- Create function to calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_carrier_id uuid,
  p_zone text,
  p_weight numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rate numeric;
BEGIN
  SELECT price INTO v_rate
  FROM shipping_rates
  WHERE carrier_id = p_carrier_id
    AND zone = p_zone
    AND p_weight BETWEEN weight_from AND weight_to
  ORDER BY price ASC
  LIMIT 1;
  
  RETURN COALESCE(v_rate, 0);
END;
$$;

-- Create function to update carrier performance metrics
CREATE OR REPLACE FUNCTION update_carrier_performance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update metrics when shipment is delivered
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    INSERT INTO carrier_performance_metrics (
      carrier_id,
      period_start,
      period_end,
      total_shipments,
      on_time_deliveries,
      delayed_deliveries,
      average_transit_time
    )
    VALUES (
      NEW.carrier_id,
      date_trunc('month', NEW.actual_delivery),
      (date_trunc('month', NEW.actual_delivery) + interval '1 month - 1 day')::date,
      1,
      CASE WHEN NEW.actual_delivery <= NEW.estimated_delivery THEN 1 ELSE 0 END,
      CASE WHEN NEW.actual_delivery > NEW.estimated_delivery THEN 1 ELSE 0 END,
      EXTRACT(epoch FROM (NEW.actual_delivery - NEW.created_at))/3600/24
    )
    ON CONFLICT (carrier_id, period_start, period_end)
    DO UPDATE SET
      total_shipments = carrier_performance_metrics.total_shipments + 1,
      on_time_deliveries = carrier_performance_metrics.on_time_deliveries + 
        CASE WHEN NEW.actual_delivery <= NEW.estimated_delivery THEN 1 ELSE 0 END,
      delayed_deliveries = carrier_performance_metrics.delayed_deliveries +
        CASE WHEN NEW.actual_delivery > NEW.estimated_delivery THEN 1 ELSE 0 END,
      average_transit_time = (
        carrier_performance_metrics.average_transit_time * carrier_performance_metrics.total_shipments +
        EXTRACT(epoch FROM (NEW.actual_delivery - NEW.created_at))/3600/24
      ) / (carrier_performance_metrics.total_shipments + 1),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for updating carrier performance
CREATE TRIGGER update_carrier_performance_trigger
  AFTER UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_carrier_performance();

-- Create indexes
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_carrier ON shipments(carrier_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipping_rates_carrier ON shipping_rates(carrier_id);
CREATE INDEX idx_shipping_rates_zone ON shipping_rates(zone);
CREATE INDEX idx_tracking_updates_shipment ON shipment_tracking_updates(shipment_id);
CREATE INDEX idx_performance_metrics_carrier ON carrier_performance_metrics(carrier_id);
CREATE INDEX idx_performance_metrics_period ON carrier_performance_metrics(period_start, period_end);