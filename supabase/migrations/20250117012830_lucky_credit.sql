-- Drop name column if it exists
ALTER TABLE locations 
DROP COLUMN IF EXISTS name;

-- Add name column as generated column
ALTER TABLE locations
ADD COLUMN name text GENERATED ALWAYS AS (
  aisle || '-' || section || '-' || shelf
) STORED;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- Add check constraint for capacity
ALTER TABLE locations
DROP CONSTRAINT IF EXISTS check_capacity;

ALTER TABLE locations
ADD CONSTRAINT check_capacity 
CHECK (occupied <= capacity);