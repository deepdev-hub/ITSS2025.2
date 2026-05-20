
ALTER TABLE service_types ADD COLUMN IF NOT EXISTS base_price NUMERIC(15,2) DEFAULT 0;


UPDATE service_types SET base_price = 0 WHERE base_price IS NULL;


SELECT id, service_code, service_name, base_price FROM service_types ORDER BY id;


