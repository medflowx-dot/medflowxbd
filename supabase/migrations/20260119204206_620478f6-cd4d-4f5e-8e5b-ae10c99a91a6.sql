-- Delete duplicate global_medicines keeping only the oldest entry (by created_at) for each unique name
DELETE FROM global_medicines
WHERE is_active = true 
AND id NOT IN (
  SELECT DISTINCT ON (name) id 
  FROM global_medicines 
  WHERE is_active = true 
  ORDER BY name, created_at ASC
);