-- Add missing capacity column to locations table
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS capacity numeric(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS occupied numeric(10,2) NOT NULL DEFAULT 0;

-- Create or replace function to update occupied space
CREATE OR REPLACE FUNCTION update_location_occupied_space()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE locations
  SET occupied = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM product_locations
    WHERE location_id = NEW.location_id
  )
  WHERE id = NEW.location_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for updating occupied space
DROP TRIGGER IF EXISTS update_location_occupied_space_trigger ON product_locations;
CREATE TRIGGER update_location_occupied_space_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_location_occupied_space();

-- Add constraint to ensure occupied space doesn't exceed capacity
ALTER TABLE locations
ADD CONSTRAINT check_capacity 
CHECK (occupied <= capacity);