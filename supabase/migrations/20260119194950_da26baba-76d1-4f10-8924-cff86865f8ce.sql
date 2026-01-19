-- Delete all medicine batches first (foreign key dependency)
DELETE FROM medicine_batches;

-- Delete all local medicines
DELETE FROM medicines;

-- Delete all local manufacturers
DELETE FROM manufacturers;

-- Delete all global medicines (foreign key dependency on global_manufacturers)
DELETE FROM global_medicines;

-- Delete all global manufacturers
DELETE FROM global_manufacturers;