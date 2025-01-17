-- Create storage_pricing_tiers table
CREATE TABLE storage_pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  name text NOT NULL,
  days_from integer NOT NULL,
  days_to integer NOT NULL,
  price_per_cubic_meter numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_days_range CHECK (days_from <= days_to),
  CONSTRAINT positive_price CHECK (price_per_cubic_meter >= 0)
);

-- Create package_pricing_rules table
CREATE TABLE package_pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  carrier_id uuid REFERENCES carriers(id) NOT NULL,
  zone text NOT NULL,
  weight_from numeric(10,2) NOT NULL,
  weight_to numeric(10,2) NOT NULL,
  base_price numeric(10,2) NOT NULL,
  price_per_kg numeric(10,2) NOT NULL,
  fuel_surcharge_percent numeric(5,2) DEFAULT 0,
  handling_fee numeric(10,2) DEFAULT 0,
  insurance_percent numeric(5,2) DEFAULT 0,
  min_insurance_value numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_weight_range CHECK (weight_from <= weight_to),
  CONSTRAINT positive_base_price CHECK (base_price >= 0),
  CONSTRAINT positive_price_per_kg CHECK (price_per_kg >= 0)
);

-- Create merchant_pricing_settings table
CREATE TABLE merchant_pricing_settings (
  merchant_id uuid PRIMARY KEY REFERENCES merchants(id),
  storage_pricing_enabled boolean DEFAULT false,
  storage_billing_day integer CHECK (storage_billing_day BETWEEN 1 AND 28),
  min_storage_days integer DEFAULT 0,
  auto_charge_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create storage_charges table
CREATE TABLE storage_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_volume numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_period CHECK (period_start <= period_end)
);

-- Create storage_charge_items table
CREATE TABLE storage_charge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id uuid REFERENCES storage_charges(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL,
  volume numeric(10,2) NOT NULL,
  days_stored integer NOT NULL,
  tier_price numeric(10,2) NOT NULL,
  amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE storage_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_charge_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "storage_pricing_tiers_policy"
  ON storage_pricing_tiers
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

CREATE POLICY "package_pricing_rules_policy"
  ON package_pricing_rules
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

CREATE POLICY "merchant_pricing_settings_policy"
  ON merchant_pricing_settings
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

CREATE POLICY "storage_charges_policy"
  ON storage_charges
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

CREATE POLICY "storage_charge_items_policy"
  ON storage_charge_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM storage_charges sc
      WHERE sc.id = charge_id
      AND (
        sc.merchant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'logistician'
        )
      )
    )
  );

-- Create function to calculate package shipping cost
CREATE OR REPLACE FUNCTION calculate_package_shipping_cost(
  p_merchant_id uuid,
  p_carrier_id uuid,
  p_zone text,
  p_weight numeric,
  p_declared_value numeric DEFAULT 0
)
RETURNS TABLE (
  base_cost numeric,
  weight_cost numeric,
  fuel_surcharge numeric,
  handling_fee numeric,
  insurance_cost numeric,
  total_cost numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rule package_pricing_rules;
BEGIN
  -- Get applicable pricing rule
  SELECT * INTO v_rule
  FROM package_pricing_rules
  WHERE merchant_id = p_merchant_id
    AND carrier_id = p_carrier_id
    AND zone = p_zone
    AND p_weight BETWEEN weight_from AND weight_to
  ORDER BY base_price ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      0::numeric as base_cost,
      0::numeric as weight_cost,
      0::numeric as fuel_surcharge,
      0::numeric as handling_fee,
      0::numeric as insurance_cost,
      0::numeric as total_cost;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    v_rule.base_price as base_cost,
    (p_weight * v_rule.price_per_kg) as weight_cost,
    (v_rule.base_price + (p_weight * v_rule.price_per_kg)) * (v_rule.fuel_surcharge_percent / 100) as fuel_surcharge,
    v_rule.handling_fee as handling_fee,
    GREATEST(
      p_declared_value * (v_rule.insurance_percent / 100),
      v_rule.min_insurance_value
    ) as insurance_cost,
    v_rule.base_price + 
    (p_weight * v_rule.price_per_kg) +
    ((v_rule.base_price + (p_weight * v_rule.price_per_kg)) * (v_rule.fuel_surcharge_percent / 100)) +
    v_rule.handling_fee +
    GREATEST(
      p_declared_value * (v_rule.insurance_percent / 100),
      v_rule.min_insurance_value
    ) as total_cost;
END;
$$;

-- Create function to calculate storage charges
CREATE OR REPLACE FUNCTION calculate_storage_charges(
  p_merchant_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  product_id uuid,
  quantity integer,
  volume numeric,
  days_stored integer,
  tier_price numeric,
  amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH product_storage AS (
    SELECT 
      p.id as product_id,
      p.width * p.height * p.depth / 1000000 as volume_m3,
      COUNT(*) as quantity,
      p_end_date - p_start_date as days_stored
    FROM products p
    JOIN product_locations pl ON pl.product_id = p.id
    WHERE p.merchant_id = p_merchant_id
    GROUP BY p.id, p.width, p.height, p.depth
  ),
  applicable_tiers AS (
    SELECT 
      ps.product_id,
      ps.quantity,
      ps.volume_m3 * ps.quantity as total_volume,
      ps.days_stored,
      spt.price_per_cubic_meter
    FROM product_storage ps
    JOIN storage_pricing_tiers spt ON 
      spt.merchant_id = p_merchant_id AND
      ps.days_stored BETWEEN spt.days_from AND spt.days_to
  )
  SELECT
    at.product_id,
    at.quantity,
    at.total_volume,
    at.days_stored,
    at.price_per_cubic_meter,
    (at.total_volume * at.price_per_cubic_meter * at.days_stored) as amount
  FROM applicable_tiers at;
END;
$$;

-- Create indexes
CREATE INDEX idx_storage_tiers_merchant ON storage_pricing_tiers(merchant_id);
CREATE INDEX idx_package_rules_merchant ON package_pricing_rules(merchant_id, carrier_id);
CREATE INDEX idx_storage_charges_merchant ON storage_charges(merchant_id);
CREATE INDEX idx_storage_charges_period ON storage_charges(period_start, period_end);
CREATE INDEX idx_storage_charge_items_charge ON storage_charge_items(charge_id);
CREATE INDEX idx_storage_charge_items_product ON storage_charge_items(product_id);