-- Bulk update existing medicines with manufacturer_id by matching with global medicines
-- Uses a subquery approach to avoid FROM-clause reference issue

UPDATE medicines
SET 
  manufacturer_id = (
    SELECT local_mfr.id
    FROM global_medicines gm
    JOIN global_manufacturers gm_mfr ON gm.manufacturer_id = gm_mfr.id
    JOIN manufacturers local_mfr ON LOWER(TRIM(local_mfr.name)) = LOWER(TRIM(gm_mfr.name))
    WHERE LOWER(TRIM(medicines.name)) = LOWER(TRIM(gm.name))
      AND local_mfr.user_id = medicines.user_id
      AND gm.is_active = true
      AND local_mfr.is_active = true
    LIMIT 1
  ),
  manufacturer = (
    SELECT local_mfr.name
    FROM global_medicines gm
    JOIN global_manufacturers gm_mfr ON gm.manufacturer_id = gm_mfr.id
    JOIN manufacturers local_mfr ON LOWER(TRIM(local_mfr.name)) = LOWER(TRIM(gm_mfr.name))
    WHERE LOWER(TRIM(medicines.name)) = LOWER(TRIM(gm.name))
      AND local_mfr.user_id = medicines.user_id
      AND gm.is_active = true
      AND local_mfr.is_active = true
    LIMIT 1
  )
WHERE manufacturer_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM global_medicines gm
    JOIN global_manufacturers gm_mfr ON gm.manufacturer_id = gm_mfr.id
    JOIN manufacturers local_mfr ON LOWER(TRIM(local_mfr.name)) = LOWER(TRIM(gm_mfr.name))
    WHERE LOWER(TRIM(medicines.name)) = LOWER(TRIM(gm.name))
      AND local_mfr.user_id = medicines.user_id
      AND gm.is_active = true
      AND local_mfr.is_active = true
  );