-- Drop existing columns and constraints
ALTER TABLE locations 
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS address,
DROP CONSTRAINT IF EXISTS check_capacity;

-- Add name column as generated column
ALTER TABLE locations
ADD COLUMN name text GENERATED ALWAYS AS (
  aisle || '-' || section || '-' || shelf
) STORED;

-- Add check constraint for capacity
ALTER TABLE locations
ADD CONSTRAINT check_capacity 
CHECK (occupied <= capacity);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- Update existing rows to ensure data consistency
UPDATE locations
SET 
  aisle = aisle,
  section = section,
  shelf = shelf,
  capacity = GREATEST(capacity, occupied);