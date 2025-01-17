/*
  # Locations Table Update
  
  Adds required columns for warehouse location management:
  - aisle: The aisle identifier
  - section: The section within the aisle
  - shelf: The specific shelf location
*/

-- Add missing columns to locations table
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS aisle text NOT NULL,
ADD COLUMN IF NOT EXISTS section text NOT NULL,
ADD COLUMN IF NOT EXISTS shelf text NOT NULL;

-- Add unique constraint for location coordinates
ALTER TABLE locations
ADD CONSTRAINT locations_coordinates_unique 
UNIQUE (aisle, section, shelf);

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_locations_coordinates 
ON locations(aisle, section, shelf);

-- Update existing rows if any (set default values)
UPDATE locations 
SET 
  aisle = 'A',
  section = '1',
  shelf = '1'
WHERE aisle IS NULL;