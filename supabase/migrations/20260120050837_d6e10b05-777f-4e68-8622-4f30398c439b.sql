-- First delete dependent data (medicine_batches depends on medicines)
DELETE FROM medicine_batches;

-- Delete all client medicines
DELETE FROM medicines;

-- Delete all client manufacturers
DELETE FROM manufacturers;

-- Delete all global medicines (depends on global_manufacturers)
DELETE FROM global_medicines;

-- Delete all global manufacturers
DELETE FROM global_manufacturers;