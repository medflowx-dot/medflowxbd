-- Step 1: Permanently delete all medicines without manufacturer_id
DELETE FROM global_medicines 
WHERE manufacturer_id IS NULL;

-- Step 2: Now add NOT NULL constraint
ALTER TABLE global_medicines 
ALTER COLUMN manufacturer_id SET NOT NULL;