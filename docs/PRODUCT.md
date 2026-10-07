# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML5, CSS3, vanilla JavaScript, PHP, MySQL, and XAMPP, as specified in the project brief and Phase 2 integration.

## Users

The local platform demonstrates rental discovery and applications for renters, property workflows for landlords and tenants, and sample verification and safety reports for administrators.

## Product Purpose

The platform connects public rental discovery and renter applications to the landlord workflow for properties, units, tenants, rent, utilities, maintenance, messages, reviews, and reports. PHP APIs store operational records in MySQL and authenticate accounts with PHP sessions.

## Positioning

This is a student project demonstrating a local rental marketplace and management workflow for small Philippine apartment and boarding-house operators. It is not a production marketplace.

## Operating Context

Renters browse on mobile and compare location, cost, availability, and amenities. Landlords review applications, occupancy, balances, bills, and maintenance. Admins review simulated reports and verification queues. Philippine peso amounts and fictional sample records are stored in the local MySQL database.

## Capabilities and Constraints

- Demonstrate public property search, saved listings, application tracking, landlord onboarding, listing management, messaging, maintenance, reviews, moderation, and the existing create/read/update/delete, payment-record, bill, statement, and reporting flows.
- Keep sample records fictional. Browser storage is a local fallback; Apache/PHP and MySQL provide the database path.
- PHP session checks protect local database API access. Payment, identity review, document submission, and message delivery remain simulated; this project is not a production marketplace.
- Never store demo passwords or claim an external payment, verification, identity check, message delivery, or upload has occurred. Label seeded content and simulated states clearly.
- Keep the code organized and understandable for a student oral defense.
- Preserve connected landlord pages for login, dashboard, tenants, tenant details, units, rent payments, utility bills, reports, settings, and billing statements; add connected marketplace, renter, landlord onboarding, messaging, maintenance, review, profile, and admin surfaces.
- Use a neutral fictional sample property identity; no real property name, logo, or property records were supplied.

## Product Principles

- Make common property and billing tasks easy to find.
- Keep tenant, unit, charge, payment, and balance information connected and understandable.
- Give clear validation and feedback for user actions.
- Keep public listing, application, tenant, unit, and payment states connected in the shared local data model.
- Distinguish simulated demo workflows from real services and do not overstate security, verification, or payment capability.
- Demonstrate useful workflows with realistic but fictional sample data.
- Keep the prototype simple to explain and extend with a future backend.
