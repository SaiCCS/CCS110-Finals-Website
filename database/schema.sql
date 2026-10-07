CREATE DATABASE IF NOT EXISTS room_to_live
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE room_to_live;

CREATE TABLE IF NOT EXISTS properties (
  property_id VARCHAR(80) PRIMARY KEY,
  property_name VARCHAR(160) NOT NULL,
  address VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  details_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS app_migrations (
  migration_key VARCHAR(120) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS state_scopes (
  scope_key VARCHAR(120) PRIMARY KEY,
  property_id VARCHAR(80) NOT NULL,
  settings_json JSON NOT NULL,
  is_bootstrapped TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_scope_property FOREIGN KEY (property_id) REFERENCES properties(property_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS app_users (
  user_id VARCHAR(80) PRIMARY KEY,
  username VARCHAR(190) NULL UNIQUE,
  email VARCHAR(190) NULL,
  full_name VARCHAR(160) NOT NULL,
  role VARCHAR(40) NOT NULL,
  profile_json JSON NOT NULL,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Login credentials are kept separately from marketplace profiles so state
-- synchronization can refresh profiles without deleting passwords.
CREATE TABLE IF NOT EXISTS auth_accounts (
  account_id VARCHAR(80) PRIMARY KEY,
  login_name VARCHAR(190) NOT NULL UNIQUE,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'tenant',
  is_demo TINYINT(1) NOT NULL DEFAULT 0,
  profile_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tenant_activity (
  account_id VARCHAR(80) PRIMARY KEY,
  activity_json JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS platform_payloads (
  scope_key VARCHAR(120) PRIMARY KEY,
  payload JSON NOT NULL,
  CONSTRAINT fk_platform_scope FOREIGN KEY (scope_key) REFERENCES state_scopes(scope_key) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS units (
  scope_key VARCHAR(120) NOT NULL,
  unit_id VARCHAR(80) NOT NULL,
  unit_kind VARCHAR(24) NOT NULL DEFAULT 'operations',
  property_id VARCHAR(80) NOT NULL,
  unit_number VARCHAR(80) NOT NULL,
  unit_type VARCHAR(100) NOT NULL DEFAULT 'Rental unit',
  floor_label VARCHAR(40) NULL,
  monthly_rent DECIMAL(12,2) NOT NULL DEFAULT 0,
  capacity INT NOT NULL DEFAULT 1,
  status VARCHAR(40) NOT NULL DEFAULT 'Available',
  description TEXT NOT NULL,
  details_json JSON NOT NULL,
  PRIMARY KEY (scope_key, unit_id),
  CONSTRAINT fk_unit_scope FOREIGN KEY (scope_key) REFERENCES state_scopes(scope_key) ON DELETE CASCADE,
  CONSTRAINT fk_unit_property FOREIGN KEY (property_id) REFERENCES properties(property_id),
  INDEX idx_units_property_status (property_id, status),
  UNIQUE KEY uq_unit_scope_property_unit (scope_key, property_id, unit_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tenants (
  scope_key VARCHAR(120) NOT NULL,
  tenant_id VARCHAR(80) NOT NULL,
  property_id VARCHAR(80) NOT NULL,
  unit_id VARCHAR(80) NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(40) NOT NULL DEFAULT '',
  email VARCHAR(190) NOT NULL DEFAULT '',
  address VARCHAR(255) NOT NULL DEFAULT '',
  move_in_date DATE NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Active',
  monthly_rent DECIMAL(12,2) NOT NULL DEFAULT 0,
  details_json JSON NOT NULL,
  PRIMARY KEY (scope_key, tenant_id),
  CONSTRAINT fk_tenant_scope FOREIGN KEY (scope_key) REFERENCES state_scopes(scope_key) ON DELETE CASCADE,
  CONSTRAINT fk_tenant_property FOREIGN KEY (property_id) REFERENCES properties(property_id),
  CONSTRAINT fk_tenant_unit FOREIGN KEY (scope_key, unit_id) REFERENCES units(scope_key, unit_id),
  INDEX idx_tenants_name (last_name, first_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leases (
  lease_id VARCHAR(80) PRIMARY KEY,
  scope_key VARCHAR(120) NOT NULL,
  property_id VARCHAR(80) NOT NULL,
  unit_id VARCHAR(80) NOT NULL,
  renter_id VARCHAR(80) NULL,
  renter_name VARCHAR(160) NOT NULL,
  rent_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  start_date DATE NULL,
  end_date DATE NULL,
  details_json JSON NOT NULL,
  CONSTRAINT fk_lease_scope FOREIGN KEY (scope_key) REFERENCES state_scopes(scope_key) ON DELETE CASCADE,
  CONSTRAINT fk_lease_property FOREIGN KEY (property_id) REFERENCES properties(property_id),
  CONSTRAINT fk_lease_unit FOREIGN KEY (scope_key, property_id, unit_id) REFERENCES units(scope_key, property_id, unit_id),
  CONSTRAINT fk_lease_renter FOREIGN KEY (renter_id) REFERENCES app_users(user_id) ON DELETE SET NULL,
  INDEX idx_leases_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rent_payments (
  scope_key VARCHAR(120) NOT NULL,
  payment_id VARCHAR(80) NOT NULL,
  tenant_id VARCHAR(80) NOT NULL,
  unit_id VARCHAR(80) NOT NULL,
  billing_month VARCHAR(40) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NULL,
  payment_method VARCHAR(60) NOT NULL DEFAULT '',
  reference_code VARCHAR(100) NOT NULL DEFAULT '',
  notes TEXT NOT NULL,
  status VARCHAR(40) NOT NULL,
  details_json JSON NOT NULL,
  PRIMARY KEY (scope_key, payment_id),
  CONSTRAINT fk_payment_scope FOREIGN KEY (scope_key) REFERENCES state_scopes(scope_key) ON DELETE CASCADE,
  CONSTRAINT fk_payment_tenant FOREIGN KEY (scope_key, tenant_id) REFERENCES tenants(scope_key, tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_unit FOREIGN KEY (scope_key, unit_id) REFERENCES units(scope_key, unit_id),
  INDEX idx_payment_period_status (billing_month, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS utility_types (
  utility_type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(80) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS utility_bills (
  scope_key VARCHAR(120) NOT NULL,
  bill_id VARCHAR(80) NOT NULL,
  tenant_id VARCHAR(80) NOT NULL,
  unit_id VARCHAR(80) NOT NULL,
  billing_period VARCHAR(40) NOT NULL,
  due_date DATE NULL,
  status VARCHAR(40) NOT NULL,
  notes TEXT NOT NULL,
  details_json JSON NOT NULL,
  PRIMARY KEY (scope_key, bill_id),
  CONSTRAINT fk_bill_scope FOREIGN KEY (scope_key) REFERENCES state_scopes(scope_key) ON DELETE CASCADE,
  CONSTRAINT fk_bill_tenant FOREIGN KEY (scope_key, tenant_id) REFERENCES tenants(scope_key, tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_bill_unit FOREIGN KEY (scope_key, unit_id) REFERENCES units(scope_key, unit_id),
  INDEX idx_bills_period_status (billing_period, status)
) ENGINE=InnoDB;

-- Junction table: one bill can contain several utility types, and each type
-- can appear on many bills.
CREATE TABLE IF NOT EXISTS utility_bill_items (
  bill_item_id VARCHAR(100) PRIMARY KEY,
  scope_key VARCHAR(120) NOT NULL,
  bill_id VARCHAR(80) NOT NULL,
  utility_type_id INT NOT NULL,
  previous_reading DECIMAL(12,3) NULL,
  current_reading DECIMAL(12,3) NULL,
  amount DECIMAL(12,2) NOT NULL,
  details_json JSON NOT NULL,
  CONSTRAINT fk_bill_item_bill FOREIGN KEY (scope_key, bill_id) REFERENCES utility_bills(scope_key, bill_id) ON DELETE CASCADE,
  CONSTRAINT fk_bill_item_type FOREIGN KEY (utility_type_id) REFERENCES utility_types(utility_type_id),
  UNIQUE KEY uq_bill_type (scope_key, bill_id, utility_type_id)
) ENGINE=InnoDB;

INSERT INTO properties (property_id, property_name, address, details_json) VALUES
('home-narra', 'Narra House', 'Kamuning, Quezon City', JSON_OBJECT('type','Boarding house','city','Quezon City','province','Metro Manila','rent',8500,'bedrooms',1,'bathrooms',1,'occupants',1,'available',4,'ownerId','owner-demo','owner','Maya Santos','verified',true,'rating',4.8,'reviewCount',18,'ownerRating',4.9,'ownerReviewCount',18,'image','photo-1766792853044-bd397f7b76e9','imageAlt','Leafy residential courtyard with open balconies','description','A leafy, welcoming boarding house in Quezon City.','amenities',JSON_ARRAY('Wi-Fi','Laundry area','Shared kitchen'),'rules',JSON_ARRAY('No smoking indoors'))),
('home-sunroom', 'The Sunroom Studios', 'Kapitolyo, Pasig City', JSON_OBJECT('type','Studio','city','Pasig City','province','Metro Manila','rent',14500,'bedrooms',1,'bathrooms',1,'occupants',2,'available',2,'ownerId','owner-demo','owner','Maya Santos','verified',true,'rating',4.9,'reviewCount',12,'ownerRating',4.9,'ownerReviewCount',18,'image','photo-1764760764956-fcb78be107a5','imageAlt','Warm light across a furnished bedroom','description','Bright private studios near cafes and transport.','amenities',JSON_ARRAY('Wi-Fi','Air conditioning','Laundry'),'rules',JSON_ARRAY('No smoking'))),
('home-luntian', 'Luntian Residences', 'Teachers Village, Quezon City', JSON_OBJECT('type','Apartment','city','Quezon City','province','Metro Manila','rent',22500,'bedrooms',2,'bathrooms',1,'occupants',4,'available',1,'ownerId','owner-two','owner','Rafael Cruz','verified',false,'rating',4.6,'reviewCount',8,'ownerRating',4.6,'ownerReviewCount',8,'image','photo-1779239358567-8a8e26f503d1','imageAlt','Sunlit bedroom with a neutral interior','description','A two-bedroom apartment on a quiet, tree-lined street.','amenities',JSON_ARRAY('Balcony','Security','Parking'),'rules',JSON_ARRAY('No smoking indoors'))),
('sample-property-4', 'Mabini Court', 'Mabini, Cabuyao City', JSON_OBJECT('type','Apartment','city','Cabuyao City','province','Laguna','rent',9500,'bedrooms',1,'bathrooms',1,'occupants',2,'available',3,'ownerId','owner-demo','owner','Maya Santos','verified',false,'rating',4.5,'reviewCount',5,'ownerRating',4.8,'ownerReviewCount',18,'image','photo-1764760764956-fcb78be107a5','imageAlt','Compact studio apartment','description','Affordable apartments close to local transport.','amenities',JSON_ARRAY('Water included'),'rules',JSON_ARRAY('No smoking'))),
('sample-property-5', 'Banay-Banay Rooms', 'Banay-Banay, Cabuyao City', JSON_OBJECT('type','Boarding house','city','Cabuyao City','province','Laguna','rent',5500,'bedrooms',1,'bathrooms',1,'occupants',1,'available',5,'ownerId','owner-two','owner','Rafael Cruz','verified',false,'rating',4.4,'reviewCount',3,'ownerRating',4.6,'ownerReviewCount',8,'image','photo-1766792853044-bd397f7b76e9','imageAlt','Shared boarding house','description','Simple furnished rooms for students and workers.','amenities',JSON_ARRAY('Shared kitchen'),'rules',JSON_ARRAY('Quiet hours after 10 PM')))
ON DUPLICATE KEY UPDATE property_name=VALUES(property_name), address=VALUES(address), details_json=VALUES(details_json);

INSERT INTO state_scopes (scope_key, property_id, settings_json, is_bootstrapped) VALUES
('narra-house-prototype-v3', 'home-narra', JSON_OBJECT('adminName','Maya Santos','adminEmail','admin@narrahouse.ph','adminPhone','0917 555 0134','propertyName','Narra House','propertyAddress','Quezon City, Metro Manila','propertyPhone','(02) 8123 4100','profileImage',''), 0)
ON DUPLICATE KEY UPDATE settings_json=VALUES(settings_json);

INSERT INTO app_users (user_id, username, email, full_name, role, profile_json) VALUES
('owner-demo', 'maya', 'maya@example.com', 'Maya Santos', 'landlord', JSON_OBJECT('capabilities',JSON_ARRAY('renter','landlord'),'status','Active','verified',true)),
('owner-two', 'rafael', 'rafael@example.com', 'Rafael Cruz', 'landlord', JSON_OBJECT('capabilities',JSON_ARRAY('renter','landlord'),'status','Pending','verified',false)),
('renter-demo', 'alex', 'alex@example.com', 'Alex Rivera', 'renter', JSON_OBJECT('capabilities',JSON_ARRAY('renter'),'status','Active','verified',false)),
('admin-demo', 'admin', 'admin@roomtolive.test', 'System Administrator', 'admin', JSON_OBJECT('status','Active')),
('staff-demo', 'staff', 'staff@roomtolive.test', 'Property Staff', 'staff', JSON_OBJECT('status','Active'))
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role=VALUES(role), profile_json=VALUES(profile_json);

INSERT INTO units (scope_key, unit_id, property_id, unit_number, unit_type, floor_label, monthly_rent, capacity, status, description, details_json) VALUES
('narra-house-prototype-v3','A-101','home-narra','101','Single Room','1',3000,1,'Occupied','Street-facing room',JSON_OBJECT()),
('narra-house-prototype-v3','A-102','home-narra','102','Single Room','1',3000,1,'Occupied','Quiet side room',JSON_OBJECT()),
('narra-house-prototype-v3','A-201','home-narra','201','Shared Room','2',6000,2,'Available','Upper-floor shared room',JSON_OBJECT()),
('narra-house-prototype-v3','A-202','home-narra','202','Single Room','2',3500,1,'Maintenance','Room being repaired',JSON_OBJECT()),
('narra-house-prototype-v3','A-204','home-narra','204','Single Room','2',3000,1,'Occupied','Corner room',JSON_OBJECT())
ON DUPLICATE KEY UPDATE property_id=VALUES(property_id), unit_number=VALUES(unit_number), status=VALUES(status);

INSERT INTO tenants (scope_key, tenant_id, property_id, unit_id, first_name, last_name, phone, email, address, move_in_date, status, monthly_rent, details_json) VALUES
('narra-house-prototype-v3','TN-0001','home-narra','A-101','Juan','Dela Cruz','09170000001','juan@example.test','Cabuyao, Laguna','2025-09-01','Active',3000,JSON_OBJECT()),
('narra-house-prototype-v3','TN-0002','home-narra','A-102','Maria','Santos','09170000002','maria@example.test','Santa Rosa, Laguna','2025-09-01','Active',3000,JSON_OBJECT()),
('narra-house-prototype-v3','TN-0003','home-narra','A-201','Ana','Reyes','09170000003','ana@example.test','Biñan, Laguna','2025-10-01','Active',3000,JSON_OBJECT()),
('narra-house-prototype-v3','TN-0004','home-narra','A-204','Jose','Garcia','09170000004','jose@example.test','Cabuyao, Laguna','2025-10-01','Active',3000,JSON_OBJECT()),
('narra-house-prototype-v3','TN-0005','home-narra','A-204','Liza','Mendoza','09170000005','liza@example.test','Calamba, Laguna','2025-10-01','Active',3000,JSON_OBJECT())
ON DUPLICATE KEY UPDATE property_id=VALUES(property_id), unit_id=VALUES(unit_id), first_name=VALUES(first_name), last_name=VALUES(last_name);

INSERT INTO utility_types (type_name, description) VALUES
('Electricity','Electricity usage charge'),
('Water','Water usage charge'),
('Other','Other property charge'),
('Internet','Internet service charge'),
('Association dues','Shared property dues')
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT INTO leases (lease_id, scope_key, property_id, unit_id, renter_id, renter_name, rent_amount, status, start_date, details_json) VALUES
('LEASE-SAMPLE-001','narra-house-prototype-v3','home-narra','A-101','renter-demo','Alex Rivera',3000,'Completed','2025-09-01',JSON_OBJECT()),
('LEASE-SAMPLE-002','narra-house-prototype-v3','home-narra','A-102','renter-demo','Alex Rivera',3000,'Completed','2025-09-01',JSON_OBJECT()),
('LEASE-SAMPLE-003','narra-house-prototype-v3','home-narra','A-201','renter-demo','Alex Rivera',3000,'Pending','2025-10-01',JSON_OBJECT()),
('LEASE-SAMPLE-004','narra-house-prototype-v3','home-narra','A-204','renter-demo','Alex Rivera',3000,'Completed','2025-11-01',JSON_OBJECT()),
('LEASE-SAMPLE-005','narra-house-prototype-v3','home-narra','A-204','renter-demo','Alex Rivera',3000,'Completed','2025-12-01',JSON_OBJECT());

INSERT INTO rent_payments (scope_key, payment_id, tenant_id, unit_id, billing_month, amount, payment_date, payment_method, reference_code, notes, status, details_json) VALUES
('narra-house-prototype-v3','RP-SAMPLE-001','TN-0001','A-101','September 2026',3000,'2026-09-01','GCash','GC-001','Sample rent payment','Paid',JSON_OBJECT()),
('narra-house-prototype-v3','RP-SAMPLE-002','TN-0002','A-102','September 2026',3000,NULL,'','', 'Sample pending rent','Pending',JSON_OBJECT()),
('narra-house-prototype-v3','RP-SAMPLE-003','TN-0003','A-201','September 2026',3000,'2026-09-02','Cash','','Sample rent payment','Paid',JSON_OBJECT()),
('narra-house-prototype-v3','RP-SAMPLE-004','TN-0004','A-204','September 2026',3000,NULL,'','','Sample overdue rent','Overdue',JSON_OBJECT()),
('narra-house-prototype-v3','RP-SAMPLE-005','TN-0005','A-204','September 2026',3000,'2026-09-03','Bank Transfer','','Sample rent payment','Paid',JSON_OBJECT());

INSERT INTO utility_bills (scope_key, bill_id, tenant_id, unit_id, billing_period, due_date, status, notes, details_json) VALUES
('narra-house-prototype-v3','UB-SAMPLE-001','TN-0001','A-101','September 2026','2026-09-15','Unpaid','Sample electricity bill',JSON_OBJECT()),
('narra-house-prototype-v3','UB-SAMPLE-002','TN-0002','A-102','September 2026','2026-09-15','Unpaid','Sample water bill',JSON_OBJECT()),
('narra-house-prototype-v3','UB-SAMPLE-003','TN-0003','A-201','September 2026','2026-09-15','Paid','Sample other charge',JSON_OBJECT()),
('narra-house-prototype-v3','UB-SAMPLE-004','TN-0004','A-204','September 2026','2026-09-12','Overdue','Sample electricity bill',JSON_OBJECT()),
('narra-house-prototype-v3','UB-SAMPLE-005','TN-0005','A-204','September 2026','2026-09-14','Unpaid','Sample water bill',JSON_OBJECT());

INSERT INTO utility_bill_items (bill_item_id, scope_key, bill_id, utility_type_id, previous_reading, current_reading, amount, details_json)
SELECT 'UB-SAMPLE-001-L1','narra-house-prototype-v3','UB-SAMPLE-001',utility_type_id,1842,1967,1250,JSON_OBJECT() FROM utility_types WHERE type_name='Electricity';
INSERT INTO utility_bill_items (bill_item_id, scope_key, bill_id, utility_type_id, previous_reading, current_reading, amount, details_json)
SELECT 'UB-SAMPLE-002-L1','narra-house-prototype-v3','UB-SAMPLE-002',utility_type_id,498,524,650,JSON_OBJECT() FROM utility_types WHERE type_name='Water';
INSERT INTO utility_bill_items (bill_item_id, scope_key, bill_id, utility_type_id, amount, details_json)
SELECT 'UB-SAMPLE-003-L1','narra-house-prototype-v3','UB-SAMPLE-003',utility_type_id,500,JSON_OBJECT() FROM utility_types WHERE type_name='Other';
INSERT INTO utility_bill_items (bill_item_id, scope_key, bill_id, utility_type_id, previous_reading, current_reading, amount, details_json)
SELECT 'UB-SAMPLE-004-L1','narra-house-prototype-v3','UB-SAMPLE-004',utility_type_id,1201,1350,4200,JSON_OBJECT() FROM utility_types WHERE type_name='Electricity';
INSERT INTO utility_bill_items (bill_item_id, scope_key, bill_id, utility_type_id, previous_reading, current_reading, amount, details_json)
SELECT 'UB-SAMPLE-005-L1','narra-house-prototype-v3','UB-SAMPLE-005',utility_type_id,242,269,3150,JSON_OBJECT() FROM utility_types WHERE type_name='Water';

-- SQL query demonstrations for the live walk-through.
-- SELECT + JOIN + WHERE + ORDER BY + GROUP BY: rent collected per tenant.
SELECT t.tenant_id, CONCAT(t.first_name, ' ', t.last_name) AS tenant,
       SUM(p.amount) AS paid_total
FROM tenants t
JOIN rent_payments p ON p.scope_key=t.scope_key AND p.tenant_id=t.tenant_id
WHERE p.status='Paid'
GROUP BY t.tenant_id, t.first_name, t.last_name
ORDER BY paid_total DESC;

-- Runnable INSERT, SELECT, UPDATE, SELECT, DELETE demonstration.
-- The transaction removes the demonstration row at the end.
START TRANSACTION;
INSERT INTO rent_payments (scope_key,payment_id,tenant_id,unit_id,billing_month,amount,notes,status,details_json)
VALUES ('narra-house-prototype-v3','RP-DEMO-999','TN-0001','A-101','October 2026',3000,'SQL demo','Pending',JSON_OBJECT());
SELECT payment_id, tenant_id, amount, status FROM rent_payments WHERE payment_id='RP-DEMO-999';
UPDATE rent_payments SET status='Paid', payment_date=CURDATE() WHERE payment_id='RP-DEMO-999';
SELECT payment_id, tenant_id, amount, status FROM rent_payments WHERE payment_id='RP-DEMO-999';
DELETE FROM rent_payments WHERE payment_id='RP-DEMO-999';
COMMIT;
