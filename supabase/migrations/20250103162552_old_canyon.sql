-- Désactiver temporairement RLS
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can manage locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can read locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can insert locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can update locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can delete locations" ON locations;
DROP POLICY IF EXISTS "Merchants can read locations" ON locations;

-- Réactiver RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Créer des politiques séparées pour une meilleure granularité
CREATE POLICY "Anyone can read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Logisticians can insert locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE role = 'logistician'
    )
  );

CREATE POLICY "Logisticians can update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE role = 'logistician'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE role = 'logistician'
    )
  );

CREATE POLICY "Logisticians can delete locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE role = 'logistician'
    )
  );

-- Ajouter des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_locations_aisle ON locations (aisle);
CREATE INDEX IF NOT EXISTS idx_locations_section ON locations (section);
CREATE INDEX IF NOT EXISTS idx_locations_shelf ON locations (shelf);