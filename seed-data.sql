-- Minimal demo seed data.
-- Passwords:
-- admin@vbas.local    / Admin@123
-- customer@vbas.local / Customer@123
-- company@vbas.local  / Company@123
-- staff@vbas.local    / Staff@123
-- staff2-5@vbas.local / Staff@123

INSERT INTO public.roles (role_name)
VALUES
    ('ADMIN'),
    ('CUSTOMER'),
    ('RESCUE_COMPANY'),
    ('RESCUE_STAFF')
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO public.account (email, password_hash, full_name, phone, status, role_id, gender)
SELECT 'admin@vbas.local', '$2a$10$qanvJAbG.SetU9EJf.iCx.DmHuKNd3K./UF49zB2cnTH1j1w/Rqnq', 'System Admin', '0900000001', 'ACTIVE', r.id, 'MALE'
FROM public.roles r
WHERE r.role_name = 'ADMIN'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.account (email, password_hash, full_name, phone, status, role_id, gender)
SELECT 'customer@vbas.local', '$2a$10$G.bQwF3fvlGgOLlhFzM31eguLkhbvON3O3CQ0B.RTovQrpj2zrC2C', 'Demo Customer', '0900000002', 'ACTIVE', r.id, 'FEMALE'
FROM public.roles r
WHERE r.role_name = 'CUSTOMER'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.account (email, password_hash, full_name, phone, status, role_id, gender)
SELECT 'company@vbas.local', '$2a$10$rjHPQwx0fREqDoBTeNTStuK54bl.jGhfHO8QV/fotDrMlK5utkLOm', 'RapidTow Owner', '0900000003', 'ACTIVE', r.id, 'MALE'
FROM public.roles r
WHERE r.role_name = 'RESCUE_COMPANY'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.account (email, password_hash, full_name, phone, status, role_id, gender)
SELECT 'staff@vbas.local', '$2a$10$7Q2uIg4PZN4te9memDTjD.x3egu0ZpuTBPX0zyYnNQrp71Rnj6Lmi', 'RapidTow Staff', '0900000004', 'ACTIVE', r.id, 'MALE'
FROM public.roles r
WHERE r.role_name = 'RESCUE_STAFF'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.account (email, password_hash, full_name, phone, status, role_id, gender)
SELECT 'staff2@vbas.local', '$2a$10$7Q2uIg4PZN4te9memDTjD.x3egu0ZpuTBPX0zyYnNQrp71Rnj6Lmi', 'RapidTow Staff 2', '0900000005', 'ACTIVE', r.id, 'MALE'
FROM public.roles r
WHERE r.role_name = 'RESCUE_STAFF'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.account (email, password_hash, full_name, phone, status, role_id, gender)
SELECT 'staff3@vbas.local', '$2a$10$7Q2uIg4PZN4te9memDTjD.x3egu0ZpuTBPX0zyYnNQrp71Rnj6Lmi', 'RapidTow Staff 3', '0900000006', 'ACTIVE', r.id, 'MALE'
FROM public.roles r
WHERE r.role_name = 'RESCUE_STAFF'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.account (email, password_hash, full_name, phone, status, role_id, gender)
SELECT 'staff4@vbas.local', '$2a$10$7Q2uIg4PZN4te9memDTjD.x3egu0ZpuTBPX0zyYnNQrp71Rnj6Lmi', 'RapidTow Staff 4', '0900000007', 'ACTIVE', r.id, 'MALE'
FROM public.roles r
WHERE r.role_name = 'RESCUE_STAFF'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.account (email, password_hash, full_name, phone, status, role_id, gender)
SELECT 'staff5@vbas.local', '$2a$10$7Q2uIg4PZN4te9memDTjD.x3egu0ZpuTBPX0zyYnNQrp71Rnj6Lmi', 'RapidTow Staff 5', '0900000008', 'ACTIVE', r.id, 'MALE'
FROM public.roles r
WHERE r.role_name = 'RESCUE_STAFF'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.addresses (country, province, district, ward, street, detail, latitude, longitude)
SELECT 'Vietnam', 'Ha Noi', 'Hai Ba Trung', 'Bach Khoa', 'Dai Co Viet', 'Gan cong vien Thong Nhat', 21.0041800, 105.8432300
WHERE NOT EXISTS (
    SELECT 1 FROM public.addresses WHERE detail = 'Gan cong vien Thong Nhat'
);

INSERT INTO public.addresses (country, province, district, ward, street, detail, latitude, longitude)
SELECT 'Vietnam', 'Ha Noi', 'Hai Ba Trung', 'Bach Khoa', 'Tran Dai Nghia', 'Staff point 1', 21.0074100, 105.8464100
WHERE NOT EXISTS (
    SELECT 1 FROM public.addresses WHERE detail = 'Staff point 1'
);

INSERT INTO public.addresses (country, province, district, ward, street, detail, latitude, longitude)
SELECT 'Vietnam', 'Ha Noi', 'Hai Ba Trung', 'Dong Tam', 'Giai Phong', 'Staff point 2', 21.0008300, 105.8422100
WHERE NOT EXISTS (
    SELECT 1 FROM public.addresses WHERE detail = 'Staff point 2'
);

INSERT INTO public.addresses (country, province, district, ward, street, detail, latitude, longitude)
SELECT 'Vietnam', 'Ha Noi', 'Hai Ba Trung', 'Quynh Loi', 'Pho Hue', 'Staff point 3', 21.0115200, 105.8565400
WHERE NOT EXISTS (
    SELECT 1 FROM public.addresses WHERE detail = 'Staff point 3'
);

INSERT INTO public.addresses (country, province, district, ward, street, detail, latitude, longitude)
SELECT 'Vietnam', 'Ha Noi', 'Hai Ba Trung', 'Phuong Mai', 'Truong Chinh', 'Staff point 4', 20.9986400, 105.8359200
WHERE NOT EXISTS (
    SELECT 1 FROM public.addresses WHERE detail = 'Staff point 4'
);

INSERT INTO public.addresses (country, province, district, ward, street, detail, latitude, longitude)
SELECT 'Vietnam', 'Ha Noi', 'Hai Ba Trung', 'Thanh Nhan', 'Kim Nguu', 'Staff point 5', 21.0132400, 105.8651900
WHERE NOT EXISTS (
    SELECT 1 FROM public.addresses WHERE detail = 'Staff point 5'
);

UPDATE public.account
SET default_address_id = (SELECT id FROM public.addresses WHERE detail = 'Gan cong vien Thong Nhat' LIMIT 1)
WHERE email = 'customer@vbas.local';

UPDATE public.account
SET default_address_id = (SELECT id FROM public.addresses WHERE detail = 'Staff point 1' LIMIT 1)
WHERE email = 'staff@vbas.local';

UPDATE public.account
SET default_address_id = (SELECT id FROM public.addresses WHERE detail = 'Staff point 2' LIMIT 1)
WHERE email = 'staff2@vbas.local';

UPDATE public.account
SET default_address_id = (SELECT id FROM public.addresses WHERE detail = 'Staff point 3' LIMIT 1)
WHERE email = 'staff3@vbas.local';

UPDATE public.account
SET default_address_id = (SELECT id FROM public.addresses WHERE detail = 'Staff point 4' LIMIT 1)
WHERE email = 'staff4@vbas.local';

UPDATE public.account
SET default_address_id = (SELECT id FROM public.addresses WHERE detail = 'Staff point 5' LIMIT 1)
WHERE email = 'staff5@vbas.local';

INSERT INTO public.customer_vehicles (customer_id, brand, model, plate_number, manufacture_year, color, fuel_type, notes)
SELECT a.id, 'Toyota', 'Vios', '51A-888.88', 2021, 'White', 'Gasoline', 'Seed vehicle for demo customer'
FROM public.account a
WHERE a.email = 'customer@vbas.local'
ON CONFLICT (plate_number) DO NOTHING;

INSERT INTO public.rescue_companies (company_name, tax_code, license_number, email, phone, description, status, owner_account_id)
SELECT 'RapidTow Rescue', 'TAX-001', 'LIC-001', 'rapidtow@vbas.local', '0900000010', 'Demo rescue company for assignment and quote flow', 'APPROVED', a.id
FROM public.account a
WHERE a.email = 'company@vbas.local'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_companies c
      WHERE c.company_name = 'RapidTow Rescue'
  );

INSERT INTO public.rescue_staff (user_id, company_id, job_title, status)
SELECT staff_account.id, company.id, 'Field Technician', 'ACTIVE'
FROM public.account staff_account
JOIN public.rescue_companies company ON company.company_name = 'RapidTow Rescue'
WHERE staff_account.email = 'staff@vbas.local'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_staff rs
      WHERE rs.user_id = staff_account.id
  );

INSERT INTO public.rescue_staff (user_id, company_id, job_title, status)
SELECT staff_account.id, company.id, 'Field Technician', 'ACTIVE'
FROM public.account staff_account
JOIN public.rescue_companies company ON company.company_name = 'RapidTow Rescue'
WHERE staff_account.email = 'staff2@vbas.local'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_staff rs
      WHERE rs.user_id = staff_account.id
  );

INSERT INTO public.rescue_staff (user_id, company_id, job_title, status)
SELECT staff_account.id, company.id, 'Field Technician', 'ACTIVE'
FROM public.account staff_account
JOIN public.rescue_companies company ON company.company_name = 'RapidTow Rescue'
WHERE staff_account.email = 'staff3@vbas.local'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_staff rs
      WHERE rs.user_id = staff_account.id
  );

INSERT INTO public.rescue_staff (user_id, company_id, job_title, status)
SELECT staff_account.id, company.id, 'Field Technician', 'ACTIVE'
FROM public.account staff_account
JOIN public.rescue_companies company ON company.company_name = 'RapidTow Rescue'
WHERE staff_account.email = 'staff4@vbas.local'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_staff rs
      WHERE rs.user_id = staff_account.id
  );

INSERT INTO public.rescue_staff (user_id, company_id, job_title, status)
SELECT staff_account.id, company.id, 'Field Technician', 'ACTIVE'
FROM public.account staff_account
JOIN public.rescue_companies company ON company.company_name = 'RapidTow Rescue'
WHERE staff_account.email = 'staff5@vbas.local'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_staff rs
      WHERE rs.user_id = staff_account.id
  );

INSERT INTO public.rescue_vehicles (company_id, vehicle_code, vehicle_type, plate_number, status)
SELECT company.id, 'RT-TRUCK-01', 'Tow Truck', '50C-123.45', 'AVAILABLE'
FROM public.rescue_companies company
WHERE company.company_name = 'RapidTow Rescue'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_vehicles rv
      WHERE rv.vehicle_code = 'RT-TRUCK-01'
  );

INSERT INTO public.rescue_vehicles (company_id, vehicle_code, vehicle_type, plate_number, status)
SELECT company.id, 'RT-TRUCK-02', 'Tow Truck', '50C-123.46', 'AVAILABLE'
FROM public.rescue_companies company
WHERE company.company_name = 'RapidTow Rescue'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_vehicles rv
      WHERE rv.vehicle_code = 'RT-TRUCK-02'
  );

INSERT INTO public.rescue_vehicles (company_id, vehicle_code, vehicle_type, plate_number, status)
SELECT company.id, 'RT-TRUCK-03', 'Tow Truck', '50C-123.47', 'AVAILABLE'
FROM public.rescue_companies company
WHERE company.company_name = 'RapidTow Rescue'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_vehicles rv
      WHERE rv.vehicle_code = 'RT-TRUCK-03'
  );

INSERT INTO public.rescue_vehicles (company_id, vehicle_code, vehicle_type, plate_number, status)
SELECT company.id, 'RT-TRUCK-04', 'Tow Truck', '50C-123.48', 'AVAILABLE'
FROM public.rescue_companies company
WHERE company.company_name = 'RapidTow Rescue'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_vehicles rv
      WHERE rv.vehicle_code = 'RT-TRUCK-04'
  );

INSERT INTO public.rescue_vehicles (company_id, vehicle_code, vehicle_type, plate_number, status)
SELECT company.id, 'RT-TRUCK-05', 'Tow Truck', '50C-123.49', 'AVAILABLE'
FROM public.rescue_companies company
WHERE company.company_name = 'RapidTow Rescue'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_vehicles rv
      WHERE rv.vehicle_code = 'RT-TRUCK-05'
  );

UPDATE public.rescue_staff
SET rescue_vehicle_id = (SELECT rv.id FROM public.rescue_vehicles rv WHERE rv.vehicle_code = 'RT-TRUCK-01' LIMIT 1),
    status = 'ACTIVE',
    job_title = 'Field Technician'
WHERE user_id = (SELECT id FROM public.account WHERE email = 'staff@vbas.local' LIMIT 1);

UPDATE public.rescue_staff
SET rescue_vehicle_id = (SELECT rv.id FROM public.rescue_vehicles rv WHERE rv.vehicle_code = 'RT-TRUCK-02' LIMIT 1),
    status = 'ACTIVE',
    job_title = 'Field Technician'
WHERE user_id = (SELECT id FROM public.account WHERE email = 'staff2@vbas.local' LIMIT 1);

UPDATE public.rescue_staff
SET rescue_vehicle_id = (SELECT rv.id FROM public.rescue_vehicles rv WHERE rv.vehicle_code = 'RT-TRUCK-03' LIMIT 1),
    status = 'ACTIVE',
    job_title = 'Field Technician'
WHERE user_id = (SELECT id FROM public.account WHERE email = 'staff3@vbas.local' LIMIT 1);

UPDATE public.rescue_staff
SET rescue_vehicle_id = (SELECT rv.id FROM public.rescue_vehicles rv WHERE rv.vehicle_code = 'RT-TRUCK-04' LIMIT 1),
    status = 'ACTIVE',
    job_title = 'Field Technician'
WHERE user_id = (SELECT id FROM public.account WHERE email = 'staff4@vbas.local' LIMIT 1);

UPDATE public.rescue_staff
SET rescue_vehicle_id = (SELECT rv.id FROM public.rescue_vehicles rv WHERE rv.vehicle_code = 'RT-TRUCK-05' LIMIT 1),
    status = 'ACTIVE',
    job_title = 'Field Technician'
WHERE user_id = (SELECT id FROM public.account WHERE email = 'staff5@vbas.local' LIMIT 1);

INSERT INTO public.incident_types (incident_code, incident_name, description)
VALUES
    ('FLAT_TIRE', 'Flat Tire', 'Vehicle has a punctured or damaged tire'),
    ('ENGINE_FAIL', 'Engine Failure', 'Vehicle cannot continue due to engine issue'),
    ('BATTERY', 'Battery Problem', 'Battery drained or electrical startup problem')
ON CONFLICT (incident_code) DO NOTHING;

INSERT INTO public.service_types (service_code, service_name, description)
VALUES
    ('TOWING', 'Towing', 'Tow the vehicle to a garage or safe location'),
    ('ON_SITE_REPAIR', 'On-site Repair', 'Provide quick rescue or fix at the incident location'),
    ('BATTERY_SUPPORT', 'Battery Support', 'Jump start or battery emergency handling')
ON CONFLICT (service_code) DO NOTHING;
