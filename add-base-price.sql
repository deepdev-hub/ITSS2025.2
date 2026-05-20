-- Bước 1: Thêm cột base_price nếu chưa có
ALTER TABLE service_types ADD COLUMN IF NOT EXISTS base_price NUMERIC(15,2) DEFAULT 0;

-- Bước 2: Đặt giá trị mặc định cho các dòng đang NULL
UPDATE service_types SET base_price = 0 WHERE base_price IS NULL;

-- Bước 3: Xem danh sách service_types hiện tại để cập nhật đúng id
SELECT id, service_code, service_name, base_price FROM service_types ORDER BY id;

-- Bước 4: Cập nhật giá từng loại dịch vụ (sửa id và giá theo thực tế)
-- UPDATE service_types SET base_price = 200000 WHERE id = 1;
-- UPDATE service_types SET base_price = 350000 WHERE id = 2;
-- UPDATE service_types SET base_price = 500000 WHERE id = 3;
