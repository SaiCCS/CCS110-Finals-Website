# Room to Live — website and database audit

**Date:** 2026-10-05  
**Scope:** All project HTML/CSS/JavaScript/PHP files, PHP/MySQL API behavior, landlord and operations routes, authentication state, validation, local assets, and sampled responsive layouts.

## Overall status: PARTIAL

The project loads, PHP and MySQL are connected, account sessions and access-denial paths respond correctly, and the tested screens remain usable across refresh and browser history. I fixed the verified frontend and backend defects listed below. I could not provision a separate scratch database in this environment, so I did not replay a successful database write against the existing records; the API replaces several saved collections as one transaction, and the current XAMPP database state was left intact. A fresh browser console/network capture was unavailable: the browser automation runtime could not start because its Chrome installation is missing.

## Findings

| # | Severity | Bug | Location | Cause | Fix / status |
|---|---|---|---|---|---|
| 1 | High | Public navigation could show logged-out actions after sign-in or Back/Forward. | `js/platform.js`; public headers | Header state was only represented by static HTML. | Fixed earlier: refresh on page-show and storage events. Login/history flows passed. |
| 2 | High | Guests could trigger renter actions as a seeded demo renter. | `js/platform.js` | Public handlers created fake success in local state even though the server had no renter session. | Fixed earlier: require an authenticated account and remove the synthetic guest session. |
| 3 | High | A landlord could read or write another property's state scope. | `api/state.php` | The API checked the account role but never matched the requested property to its owner. | Fixed: validate scope ownership from the property's saved `ownerId`, filter landlord root responses, and merge landlord changes without replacing another owner's marketplace data. Verified own scope `200`, foreign scope `403`, anonymous scope `401`. |
| 4 | High | Normal saves failed in MySQL when units were referenced by leases. | `api/state.php` | A full-state save deleted unit rows before reinserting them; lease foreign keys rejected the delete and rolled back the save. | Fixed in the save path: units are upserted in place. A valid full-state write was not run against the existing project records, so successful commit remains unverified. |
| 5 | High | Logout could leave the server session alive if MySQL was unavailable. | `api/auth.php` | The logout action tried to connect to MySQL before destroying the PHP session. | Fixed: revoke the session before database setup. A separate test session logged out, then received `401` when it tried to read a protected scope. The database-outage case was not simulated. |
| 6 | Medium | The landlord message form did not find the seeded landlord's properties. | `js/platform.js` | The demo login ID (`demo-landlord`) differed from the marketplace profile (`owner-demo`). | Fixed: normalize the demo account to its marketplace identity. The properties now appear in the composer. With no conversations or applicants, sending is disabled with an explanation. |
| 7 | Medium | Profile Save updated only browser state and displayed success before database persistence. | `js/platform.js`, `js/auth.js`, `api/auth.php` | The profile form wrote to the marketplace cache; it did not update authentication credentials/profile rows. | Fixed: add a validated profile API action and surface save errors/loading state. Invalid profile input returned `422`; a valid profile update was not submitted to avoid changing the user's existing demo account. |
| 8 | Medium | Admin approval of a landlord application did not survive the next login. | `js/platform.js`, `api/auth.php` | Approval changed marketplace capabilities but left the account's login role as renter. | Fixed in code: approval sets the marketplace role and login restores the approved landlord role. Not exercised with a real pending application. |
| 9 | Medium | Browse filters disappeared after opening a listing and going Back. | `js/platform.js` | Filter state lived only in the form controls. | Fixed earlier: serialize filters and sorting in the URL. Basic/advanced filtering and Back/Forward passed. |
| 10 | Medium | Logout returned to the login form instead of the public homepage. | `js/auth.js` | Logout used a fixed login-page redirect. | Fixed earlier: clear local state and return to the homepage. |

**Findings investigated:** 10 — **Critical:** 0, **High:** 5, **Medium:** 5, **Low:** 0.  
**Known remaining issues:** None observed in the tested flows. The successful database-write path and the listed role/profile success flows still need a disposable test account/database for full integration proof.

## Tests performed

- Ran `node --check` across all project JavaScript files and `php -l` across every PHP API file; all passed.
- Checked all local HTML `src`/`href` references; all resolved. Confirmed modified JavaScript and PHP files match the XAMPP served copies.
- Confirmed live health endpoint reports PHP, MySQL, and required schema ready.
- API checks: anonymous property-scope read `401`; anonymous renter-state write `401`; built-in landlord login `200`; landlord's Narra scope `200`; foreign landlord scope read/write `403`; invalid profile request `422`; incomplete save `400`; logout `200`; protected read after logout `401`.
- Navigated the signed-in landlord portal and operations dashboard. Confirmed the saved Narra data still displays 5 tenants, 5 units, existing rent payments, and utility bills.
- Tested portal links to Units, Properties, Messages, and Profile. The landlord message composer lists the account's three properties and shows a disabled, explained send state when there is no renter contact.
- Tested Back, Forward, and refresh from the operations dashboard; account identity and saved data remained visible.
- Submitted empty profile, tenant, unit, rent-payment, and utility-bill forms; browser required-field validation blocked each submission. No valid records were created or changed.
- Prior audit passes covered guest and renter listing actions, registration mismatch validation, protected routes, logout redirect, and basic/advanced browse-filter history behavior.
- Prior responsive sampling covered desktop, 390px mobile, 320px small mobile, and 844×390 landscape. No major overflow or overlap was observed in those samples.
- Did not test a successful payment; the payment area remains an intent-only school-project placeholder as requested.
- Could not capture a fresh browser console/network log: the available Playwright browser helper reports that its Chrome distribution is missing. No browser package was installed.

## Important verification

| Check | Result |
|---|---|
| Login stays active after page changes, refresh, Back, and Forward? | Yes in the landlord browser session tested. |
| Logout removes the server session? | Yes; a separate test session received `401` after logout. |
| Are operation scopes protected? | Yes for tested anonymous and foreign-scope requests. |
| Does the database health endpoint pass? | Yes; schema ready. |
| Do existing operations data still display? | Yes; sample tenant, unit, payment, and bill data remained visible. |
| Did a successful full-state MySQL write pass after the unit-upsert fix? | Not verified; I did not rewrite the user's saved collections for a test. |
| Did a valid profile save or real landlord approval pass end-to-end? | Not tested against an existing account/application to avoid modifying saved user data. |
| Are there known console errors or failed network requests? | No fresh console/network capture was available. PHP error log contained prior foreign-key save failures, which led to the upsert fix; post-fix successful write is still unverified. |

## Files changed

- `api/auth.php` — profile persistence, approved-landlord role restore, and database-independent logout.
- `api/state.php` — owner-scope authorization, filtered landlord responses, safe owner-only root merges, and in-place unit upserts.
- `js/auth.js` — profile update client method.
- `js/platform.js` — demo landlord identity mapping, safer message compose states, profile save/error handling, and approved role state.
- HTML pages — cache-version updates for the changed JavaScript.
- `BUG_AUDIT_REPORT.md` — this audit report.

The current source changes are synced to `C:\xampp\htdocs\CCS110 Finals Website`.
