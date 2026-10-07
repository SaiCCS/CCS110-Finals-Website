# Room to Live

A school project for rental discovery and property management, built with HTML, CSS, vanilla JavaScript, PHP, and MySQL.

## Run locally

1. Start Apache and MySQL in XAMPP.
2. Import [`database/schema.sql`](database/schema.sql) in phpMyAdmin.
3. Copy `api/config.example.php` to `api/config.php` and enter your local MySQL credentials.
4. Open `http://localhost/CCS110%20Finals%20Website/`.

See [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md) for the full local setup and [`docs/VERCEL_DEPLOYMENT.md`](docs/VERCEL_DEPLOYMENT.md) for cloud deployment.

## Project layout

- `index.html` — public home page
- `pages/` — the other HTML pages; Apache and Vercel rewrites preserve their existing root URLs
- `css/` and `js/` — website styles and browser code
- `api/` — PHP API endpoints and shared database/session code
- `database/` — MySQL schema and ER diagram
- `docs/` — setup, product, deployment, and QA documentation
- `output/` — generated project deliverables; excluded from website deployments

The HTML routes remain available as `/login.html`, `/portal.html`, and so on, so navigation and existing bookmarks continue to work.
