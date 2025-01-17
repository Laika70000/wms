-- Create carrier_services table
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

-- Create carrier_zones table
CREATE TABLE IF NOT EXISTS carrier_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  countries text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(carrier_id, code)
);

-- Create carrier_rates table
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

-- Create carrier_allocation_rules table
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
ALTER TABLE carrier_allocation_rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "carrier_services_policy"
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

CREATE POLICY "carrier_zones_policy"
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

CREATE POLICY "carrier_rates_policy"
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

CREATE POLICY "carrier_allocation_rules_policy"
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

-- Create function to calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_carrier_id uuid,
  p_service_id uuid,
  p_zone_id uuid,
  p_weight numeric,
  p_declared_value numeric DEFAULT 0
)
RETURNS TABLE (
  base_cost numeric,
  fuel_surcharge numeric,
  total_cost numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rate carrier_rates%ROWTYPE;
BEGIN
  -- Get applicable rate
  SELECT * INTO v_rate
  FROM carrier_rates
  WHERE carrier_id = p_carrier_id
    AND service_id = p_service_id
    AND zone_id = p_zone_id
    AND p_weight BETWEEN weight_from AND weight_to;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::numeric, 0::numeric, 0::numeric;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    v_rate.price as base_cost,
    (v_rate.price * v_rate.fuel_surcharge_percent / 100) as fuel_surcharge,
    (v_rate.price + (v_rate.price * v_rate.fuel_surcharge_percent / 100)) as total_cost;
END;
$$;

-- Create function to find best carrier service
CREATE OR REPLACE FUNCTION find_best_carrier_service(
  p_merchant_id uuid,
  p_destination_country text,
  p_weight numeric,
  p_declared_value numeric DEFAULT 0
)
RETURNS TABLE (
  carrier_id uuid,
  service_id uuid,
  zone_id uuid,
  total_cost numeric,
  transit_time_min integer,
  transit_time_max integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH applicable_zones AS (
    SELECT z.id as zone_id, z.carrier_id
    FROM carrier_zones z
    WHERE p_destination_country = ANY(z.countries)
  ),
  applicable_rates AS (
    SELECT 
      r.carrier_id,
      r.service_id,
      r.zone_id,
      r.price + (r.price * r.fuel_surcharge_percent / 100) as total_cost
    FROM carrier_rates r
    JOIN applicable_zones z ON z.carrier_id = r.carrier_id AND z.zone_id = r.zone_id
    WHERE p_weight BETWEEN r.weight_from AND r.weight_to
  ),
  carrier_rules AS (
    SELECT 
      r.carrier_id,
      r.service_id,
      r.priority
    FROM carrier_allocation_rules r
    WHERE r.merchant_id = p_merchant_id
    AND (r.conditions->>'min_weight')::numeric <= p_weight
    AND (r.conditions->>'max_weight')::numeric >= p_weight
    AND (r.conditions->>'min_value')::numeric <= p_declared_value
    AND (r.conditions->>'max_value')::numeric >= p_declared_value
  )
  SELECT 
    r.carrier_id,
    r.service_id,
    r.zone_id,
    r.total_cost,
    s.transit_time_min,
    s.transit_time_max
  FROM applicable_rates r
  JOIN carrier_services s ON s.id = r.service_id
  LEFT JOIN carrier_rules cr ON 
    cr.carrier_id = r.carrier_id AND 
    cr.service_id = r.service_id
  WHERE EXISTS (
    SELECT 1 FROM carriers c
    WHERE c.id = r.carrier_id
    AND c.status = 'active'
  )
  ORDER BY 
    cr.priority NULLS LAST,
    r.total_cost ASC
  LIMIT 1;
END;
$$;

-- Create indexes
CREATE INDEX idx_carrier_services_carrier ON carrier_services(carrier_id);
CREATE INDEX idx_carrier_zones_carrier ON carrier_zones(carrier_id);
CREATE INDEX idx_carrier_rates_lookup ON carrier_rates(carrier_id, service_id, zone_id);
CREATE INDEX idx_carrier_allocation_rules_merchant ON carrier_allocation_rules(merchant_id);