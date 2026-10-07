# Phase 2: relational MySQL database

The PHP API maps the existing page data model to related MySQL tables. The core data now lives in tables for properties, units, tenants, leases, rent payments, utility types, utility bills, and utility bill items. `utility_bill_items` is the junction table between bills and utility types. Marketplace-only details and user-entered optional fields are retained as JSON attributes while keys, relationships, amounts, statuses, and dates are stored in queryable columns.

The database script also includes five sample properties, units, tenants, app users, and utility types, payment and bill examples, foreign keys, renter authentication/activity tables, and commented SQL CRUD plus a reporting query.

## Run locally with XAMPP

1. Start Apache and MySQL in XAMPP.
2. Copy this project folder into `C:\xampp\htdocs\CCS110 Finals Website`.
3. In phpMyAdmin, import [`../database/schema.sql`](../database/schema.sql) into the `room_to_live` database. The script creates the database, related tables, foreign keys, and example data. It does not drop the earlier `app_states` table.
4. Copy `api/config.example.php` to `api/config.php`. Set the username and password to match your MySQL account. The default XAMPP account is often `root` with a blank password; use your actual local settings.
5. Open `http://localhost/CCS110%20Finals%20Website/`. Do not open the HTML files directly with `file://`; PHP must run through Apache.

On the first page load, the current Phase 1 sample data is copied into the new relational tables; later visits load it from MySQL. If the earlier Phase 2 `app_states` table contains data, the API migrates the root property's saved state once and leaves the original row intact. The API keeps a small JSON payload for marketplace workflows that do not belong to the rental/billing tables, while property listings, users, units, leases, tenants, rent payments, and utility charges are represented in relational tables. Renter-only applications and activity are isolated by account in `tenant_activity`.

Open `http://localhost:8080/CCS110%20Finals%20Website/api/health.php` to check that PHP can connect to the configured MySQL database and that the required tables exist. The API creates the authentication tables automatically if they are missing and safely expands the `app_users.username` field for email-based sign-in.

## Database query demo

Run the advanced `SELECT` at the end of [`../database/schema.sql`](../database/schema.sql) to show rent totals grouped by tenant, filtered to paid records and ordered by amount. The adjacent INSERT, UPDATE, and DELETE examples demonstrate CRUD statements; change their sample IDs if you rerun them.

## Requirements and scope

- PHP 8.1+ with PDO MySQL enabled (`pdo_mysql`)
- MySQL 5.7.8+ or MariaDB with JSON-column support
- Apache or another PHP-enabled web server

For Vercel deployment with the same MySQL database type, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md). Vercel cannot connect to the MySQL server running only on your computer; use a hosted MySQL/MariaDB instance and set its connection details as Vercel environment variables.

New renter accounts and sign-ins use the PHP API and are stored in MySQL. Passwords are saved as password hashes in `auth_accounts`, separately from marketplace profiles. The API creates this table automatically if the database was imported before the authentication update. Demo sign-ins are also seeded in that table on first authentication: `admin` / `admin`, `landlord` / `landlord`, and `tenant` / `tenant`. These are local demonstration credentials only; change or remove them before any deployment. Do not publish `api/config.php` or real credentials.
