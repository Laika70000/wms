/*
  # Création des tables pour la gestion des stocks

  1. Nouvelles Tables
    - `products` : Informations sur les produits
    - `stock_movements` : Historique des mouvements de stock
    - `locations` : Emplacements dans l'entrepôt
    - `stock_alerts` : Configuration des alertes de stock

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour les logisticiens et marchands
*/

-- Table des produits
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) NOT NULL,
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  barcode text,
  category text NOT NULL,
  description text,
  weight numeric(10,2),
  width numeric(10,2),
  height numeric(10,2),
  depth numeric(10,2),
  min_stock integer NOT NULL DEFAULT 0,
  max_stock integer,
  storage_conditions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des emplacements
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aisle text NOT NULL,
  section text NOT NULL,
  shelf text NOT NULL,
  capacity numeric(10,2) NOT NULL,
  occupied numeric(10,2) DEFAULT 0,
  UNIQUE(aisle, section, shelf)
);

-- Table des stocks par emplacement
CREATE TABLE product_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) NOT NULL,
  location_id uuid REFERENCES locations(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, location_id)
);

-- Table des mouvements de stock
CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) NOT NULL,
  location_id uuid REFERENCES locations(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('reception', 'order', 'transfer', 'adjustment')),
  quantity integer NOT NULL,
  reference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

-- Activer RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Politiques pour les produits
CREATE POLICY "Merchants can read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = merchant_id);

CREATE POLICY "Logisticians can read all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'logistician'
  ));

-- Politiques pour les emplacements
CREATE POLICY "Logisticians can manage locations"
  ON locations
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'logistician'
  ));

-- Politiques pour les mouvements de stock
CREATE POLICY "Logisticians can manage stock movements"
  ON stock_movements
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'logistician'
  ));

-- Fonction pour calculer le stock total d'un produit
CREATE OR REPLACE FUNCTION get_product_stock(product_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(quantity)
     FROM product_locations
     WHERE product_locations.product_id = $1),
    0
  );
END;
$$;

-- Fonction pour vérifier si un produit est en stock faible
CREATE OR REPLACE FUNCTION is_low_stock(product_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock integer;
  min_stock integer;
BEGIN
  SELECT get_product_stock($1) INTO current_stock;
  SELECT products.min_stock INTO min_stock
  FROM products
  WHERE products.id = $1;
  
  RETURN current_stock <= min_stock;
END;
$$;