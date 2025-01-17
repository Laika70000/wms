-- Désactiver temporairement RLS pour la migration
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Logisticians can read locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can insert locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can update locations" ON locations;
DROP POLICY IF EXISTS "Logisticians can delete locations" ON locations;
DROP POLICY IF EXISTS "Merchants can read locations" ON locations;

-- Réactiver RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Créer une politique unique pour toutes les opérations
CREATE POLICY "Users can manage locations"
  ON locations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.role = 'logistician' OR auth.users.role = 'merchant')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'logistician'
    )
  );

-- Ajouter un index pour améliorer les performances des requêtes RLS
CREATE INDEX IF NOT EXISTS idx_locations_aisle_section_shelf 
ON locations (aisle, section, shelf);