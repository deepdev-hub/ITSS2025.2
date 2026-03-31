-- Minimal demo seed data.
-- Passwords:
-- admin@vbas.local    / Admin@123
-- customer@vbas.local / Customer@123
-- company@vbas.local  / Company@123
-- staff@vbas.local    / Staff@123

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

INSERT INTO public.addresses (country, province, district, ward, street, detail, latitude, longitude)
VALUES ('Vietnam', 'Ho Chi Minh City', 'District 1', 'Ben Nghe', 'Le Loi', 'Main office branch', 10.7731000, 106.7043000);

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

INSERT INTO public.rescue_company_branches (company_id, branch_name, phone, address_id, latitude, longitude, is_main_branch)
SELECT c.id, 'RapidTow Central Branch', '0900000011', addr.id, 10.7731000, 106.7043000, true
FROM public.rescue_companies c
CROSS JOIN LATERAL (
    SELECT id
    FROM public.addresses
    WHERE street = 'Le Loi' AND province = 'Ho Chi Minh City'
    ORDER BY id DESC
    LIMIT 1
) addr
WHERE c.company_name = 'RapidTow Rescue'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_company_branches b
      WHERE b.company_id = c.id AND b.branch_name = 'RapidTow Central Branch'
  );

INSERT INTO public.rescue_staff (user_id, company_id, branch_id, job_title, status)
SELECT staff_account.id, company.id, branch.id, 'Field Technician', 'ACTIVE'
FROM public.account staff_account
JOIN public.rescue_companies company ON company.company_name = 'RapidTow Rescue'
JOIN public.rescue_company_branches branch ON branch.company_id = company.id AND branch.branch_name = 'RapidTow Central Branch'
WHERE staff_account.email = 'staff@vbas.local'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_staff rs
      WHERE rs.user_id = staff_account.id
  );

INSERT INTO public.rescue_vehicles (branch_id, vehicle_code, vehicle_type, plate_number, status)
SELECT branch.id, 'RT-TRUCK-01', 'Tow Truck', '50C-123.45', 'AVAILABLE'
FROM public.rescue_company_branches branch
WHERE branch.branch_name = 'RapidTow Central Branch'
  AND NOT EXISTS (
      SELECT 1
      FROM public.rescue_vehicles rv
      WHERE rv.vehicle_code = 'RT-TRUCK-01'
  );

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
