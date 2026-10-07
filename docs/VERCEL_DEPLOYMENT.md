# Deploy Room/Live to Vercel with MySQL

The website can keep its current PHP API and MySQL/MariaDB schema on Vercel by using the community PHP runtime. Vercel hosts the website and PHP functions; the MySQL database must be hosted remotely so Vercel can reach it. XAMPP's `127.0.0.1` database is only available on your computer.

## 1. Create a hosted MySQL database

Choose a MySQL or MariaDB host that permits connections from Vercel functions. Get its hostname, port, database name, username, and password. Do not use `localhost`, `127.0.0.1`, or your XAMPP credentials for the hosted deployment.

Import [`../database/schema.sql`](../database/schema.sql) into that hosted database using the provider's MySQL import tool or a MySQL client. This creates the same database type and tables used locally. Do not connect a public production deployment to a database that contains private or real personal/payment data for this school project.

## 2. Deploy this folder without Git

Vercel's documented way to upload a local project folder is the Vercel CLI. Install Node.js first if it is not already installed, then install and sign in to the CLI once:

```powershell
npm install --global vercel
vercel login
```

Open PowerShell in this project folder and link it to a new or existing Vercel project:

```powershell
cd "C:\Users\bryce\Desktop\CCS110 Finals Website"
vercel link
```

Keep the project root as the deployment root; no framework preset or build command is needed. `vercel.json` configures the PHP API endpoints and preserves the existing root-level page URLs while the page files are stored in `pages/`. After configuring the hosted MySQL connection and environment variables below, deploy with:

```powershell
vercel --prod
```

For a test deployment first, run `vercel` instead of `vercel --prod`. This sends the current project folder to Vercel without requiring a Git repository.

## 3. Set database environment variables

In Vercel, open **Project → Settings → Environment Variables**. Add these variables to **Production** and **Preview** (and Development if you use `vercel dev`):

| Variable | Value |
| --- | --- |
| `DB_HOST` | Hosted MySQL hostname |
| `DB_PORT` | Database port, commonly `3306` |
| `DB_NAME` | Database name containing the imported schema |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_SSL_CA` | Provider's CA certificate text if required for TLS; set as a sensitive variable |
| `ENABLE_DEMO_ACCOUNTS` | `false` |

Mark the database credentials as sensitive where Vercel offers that option. Never put them into `vercel.json`, HTML, JavaScript, or a committed PHP file. After adding or changing variables, redeploy so the new deployment receives them.

If your provider supplies a CA certificate for TLS, set its full PEM text in `DB_SSL_CA`; the PHP API writes it to Vercel's temporary directory and uses it to verify the MySQL connection. Mark it sensitive. A provider that only permits connections from a fixed IP may require a different plan or an egress solution because Vercel function IPs can vary.

## 4. Verify the deployment

After deployment, open `https://YOUR-VERCEL-DOMAIN/api/health.php`. A successful response reports `"success": true`, `"database": true`, and `"schemaReady": true`. If it reports missing tables, import [`../database/schema.sql`](../database/schema.sql) into the same database named by `DB_NAME`. If it reports a connection failure, check Vercel's runtime logs and the DB variables.

Then test account registration, sign-in, refresh, navigation, and sign-out on the deployed domain. On Vercel, authentication sessions are stored in MySQL so separate serverless instances can read the same session. Demo accounts remain enabled for local XAMPP by default and are disabled on Vercel unless explicitly enabled.

## Local XAMPP still works

The local setup remains the same: copy `api/config.example.php` to the ignored `api/config.php`, use your XAMPP credentials, and run the site through Apache. Local credentials are not replaced by Vercel variables.
