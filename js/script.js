"use strict";

const STORE_KEY = "narra-house-prototype-v3";
const ACTIVE_PROPERTY_ID = new URLSearchParams(location.search).get("property");
const CURRENT_PERIOD = "September 2026";
const PAGE_NAMES = {
  dashboard: "Dashboard",
  tenants: "Tenants",
  "tenant-details": "Tenant details",
  units: "Units",
  payments: "Rent Payments",
  "utility-bills": "Utility Bills",
  "billing-statement": "Tenant Statement",
  reports: "Reports",
  settings: "Settings"
};

const iconPaths = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="13" width="7" height="8" rx="1"/>',
  tenants: '<circle cx="9" cy="8" r="3.3"/><path d="M3 20c.5-3.1 2.5-4.7 6-4.7s5.5 1.6 6 4.7M16 5.2a3.2 3.2 0 0 1 0 6.1M17.4 15.5c2.1.6 3.2 2.1 3.6 4.5"/>',
  units: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z"/><path d="M8 11h.01M16 11h.01"/>',
  payments: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
  bills: '<path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5M8 12h8M8 16h6"/>',
  reports: '<path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/><path d="M17 6h3v3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2 1-1.5 2.6-1.5-.5a7.8 7.8 0 0 1-1.5.9l-.3 1.6h-3l-.3-1.6a7.8 7.8 0 0 1-1.5-.9l-1.5.5-1.5-2.6 1.2-1a7.5 7.5 0 0 1 0-1.8l-1.2-1 1.5-2.6 1.5.5a7.8 7.8 0 0 1 1.5-.9l.3-1.6h3l.3 1.6a7.8 7.8 0 0 1 1.5.9l1.5-.5 1.5 2.6-1.2 1a7.5 7.5 0 0 1 0 1.7z"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5m7 7-7-7 7-7"/>',
  eye: '<path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
  eyeOff: '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c6.2 0 9.5 7 9.5 7a14.5 14.5 0 0 1-3 3.8M6.2 6.2A16 16 0 0 0 2.5 12s3.3 7 9.5 7c.9 0 1.7-.1 2.5-.4"/>',
  edit: '<path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
  printer: '<path d="M6 9V3h12v6M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6zM18 12h.01"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  warning: '<path d="M10.3 4.4 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0z"/><path d="M12 9v4m0 4h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  home: '<path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c.4-3.3 2.4-5 6-5s5.6 1.7 6 5M16 5.3a3.2 3.2 0 0 1 0 5.9m1 4.1c2.4.5 3.6 2.1 4 4.7"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.6-.7-1.6-1-2.8-1-1.5 0-2.7.8-2.7 2s1.2 1.8 2.7 2.1 2.7.9 2.7 2.2-1.2 2.2-2.8 2.2c-1.2 0-2.3-.4-3-1.2M12 6v12"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3"/>',
  drop: '<path d="M12 3s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12z"/><path d="M9 16a3 3 0 0 0 3 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  filter: '<path d="M4 6h16M7 12h10m-7 6h4"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5"/>',
  file: '<path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};

function icon(name, extraClass = "") {
  return `<svg class="${extraClass}" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.info}</svg>`;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function money(value) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function initials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function statusClass(status) {
  const key = String(status || "").toLowerCase();
  return `status status-${key.replace(/[^a-z]+/g, "-")}`;
}

function dateShort(value) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function buildSeedData() {
  const firstNames = ["Juan", "Maria", "Jose", "Ana", "Miguel", "Angelica", "Carlo", "Sofia", "Rafael", "Angela", "Gabriel", "Camille", "Paolo", "Isabella", "Marco", "Liza"];
  const lastNames = ["Dela Cruz", "Santos", "Reyes", "Garcia", "Mendoza", "Bautista", "Villanueva", "Ramos"];
  const units = [];
  const occupiedCountByUnit = new Map();
  for (let floor = 1; floor <= 4; floor += 1) {
    for (let room = 1; room <= 10; room += 1) {
      const id = `A-${floor}${String(room).padStart(2, "0")}`;
      const index = units.length;
      const occupied = index < 32;
      const occupants = !occupied ? 0 : id === "A-204" ? 1 : index < 3 ? 5 : 4;
      const monthlyRent = id === "A-204" ? 12000 : occupants === 5 ? 15000 : 12000;
      occupiedCountByUnit.set(id, occupants);
      units.push({ id, number: id, type: id === "A-204" ? "Private studio" : "Shared room", floor, monthlyRent, capacity: id === "A-204" ? 1 : 5, description: "Unit record", status: occupied ? "Occupied" : "Available" });
    }
  }

  const tenants = [];
  for (let index = 0; index < 128; index += 1) {
    const isJuan = index === 0;
    let unit;
    if (isJuan) {
      unit = units.find((item) => item.id === "A-204");
    } else {
      let remaining = index - 1;
      unit = units.find((item) => {
        const count = occupiedCountByUnit.get(item.id) || 0;
        if (item.id === "A-204" || !count) return false;
        if (remaining < count) return true;
        remaining -= count;
        return false;
      });
    }
    const first = firstNames[index % firstNames.length];
    const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    const name = `${first} ${last}`;
    const occupantCount = occupiedCountByUnit.get(unit.id) || 1;
    tenants.push({
      id: `TN-${String(index + 1).padStart(4, "0")}`,
      firstName: first,
      lastName: last,
      phone: `0917${String(1000000 + index).slice(-7)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/\s+/g, "")}${index ? index + 1 : ""}@example.com`,
      address: index === 0 ? "Quezon City, Metro Manila" : "Metro Manila",
      unitId: unit.id,
      moveInDate: index === 0 ? "2025-09-01" : `202${index % 6}-${String((index % 12) + 1).padStart(2, "0")}-01`,
      status: "Active",
      monthlyRent: Math.round(unit.monthlyRent / occupantCount)
    });
  }

  const paymentRows = [
    [0, 12000, "Pending", "", "", "September 2026"],
    [1, 3000, "Paid", "2026-09-01", "GCash", "September 2026"],
    [2, 3000, "Paid", "2026-09-02", "Cash", "September 2026"],
    [3, 3000, "Overdue", "", "", "September 2026"],
    [4, 3000, "Paid", "2026-09-03", "Bank Transfer", "September 2026"],
    [5, 3000, "Paid", "2026-09-03", "GCash", "September 2026"],
    [6, 3000, "Pending", "", "", "September 2026"],
    [7, 3000, "Overdue", "", "", "September 2026"],
    [8, 3000, "Paid", "2026-09-05", "Cash", "September 2026"],
    [9, 3000, "Pending", "", "", "September 2026"],
    [10, 3000, "Paid", "2026-09-06", "Bank Transfer", "September 2026"],
    [11, 3000, "Paid", "2026-09-07", "GCash", "September 2026"],
    [12, 3000, "Pending", "", "", "September 2026"],
    [13, 3500, "Pending", "", "", "September 2026"]
  ];
  const payments = paymentRows.map(([tenantIndex, amount, status, paymentDate, paymentMethod, billingMonth], index) => ({
    id: `RP-2609-${String(index + 1).padStart(3, "0")}`,
    tenantId: tenants[tenantIndex].id,
    unitId: tenants[tenantIndex].unitId,
    billingMonth,
    amount,
    paymentDate,
    paymentMethod,
    reference: index === 1 ? "GC-0926-1184" : "",
    notes: "Billing record",
    status
  }));
  const utilityBills = [
    { id: "UB-2609-001", tenantId: tenants[0].id, unitId: "A-204", type: "Electricity", billingPeriod: "September 2026", previousReading: 1842, currentReading: 1967, amount: 1250, dueDate: "2026-09-15", status: "Unpaid", notes: "Shared meter allocation" },
    { id: "UB-2609-002", tenantId: tenants[0].id, unitId: "A-204", type: "Water", billingPeriod: "September 2026", previousReading: 498, currentReading: 524, amount: 650, dueDate: "2026-09-15", status: "Unpaid", notes: "" },
    { id: "UB-2609-003", tenantId: tenants[0].id, unitId: "A-204", type: "Other", billingPeriod: "September 2026", previousReading: "", currentReading: "", amount: 500, dueDate: "2026-09-15", status: "Unpaid", notes: "Common area charge" },
    { id: "UB-2609-004", tenantId: tenants[1].id, unitId: tenants[1].unitId, type: "Electricity", billingPeriod: "September 2026", previousReading: 1201, currentReading: 1350, amount: 4200, dueDate: "2026-09-12", status: "Overdue", notes: "" },
    { id: "UB-2609-005", tenantId: tenants[2].id, unitId: tenants[2].unitId, type: "Water", billingPeriod: "September 2026", previousReading: 242, currentReading: 269, amount: 3150, dueDate: "2026-09-12", status: "Unpaid", notes: "" },
    { id: "UB-2609-006", tenantId: tenants[3].id, unitId: tenants[3].unitId, type: "Electricity", billingPeriod: "September 2026", previousReading: 1100, currentReading: 1182, amount: 1200, dueDate: "2026-09-14", status: "Unpaid", notes: "" },
    { id: "UB-2609-007", tenantId: tenants[4].id, unitId: tenants[4].unitId, type: "Water", billingPeriod: "September 2026", previousReading: 310, currentReading: 344, amount: 850, dueDate: "2026-09-14", status: "Overdue", notes: "" },
    { id: "UB-2609-008", tenantId: tenants[5].id, unitId: tenants[5].unitId, type: "Other", billingPeriod: "September 2026", previousReading: "", currentReading: "", amount: 550, dueDate: "2026-09-18", status: "Unpaid", notes: "" }
  ];
  return {
    tenants,
    units,
    payments,
    utilityBills,
    settings: { adminName: "Maya Santos", adminEmail: "admin@narrahouse.ph", adminPhone: "0917 555 0134", propertyName: "Narra House", propertyAddress: "Quezon City, Metro Manila", propertyPhone: "(02) 8123 4100", profileImage: "" }
  };
}

function readBaseStore() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return saved ? JSON.parse(saved) : buildSeedData();
  } catch (error) {
    return buildSeedData();
  }
}

function getPropertyContext() {
  if (!ACTIVE_PROPERTY_ID || ACTIVE_PROPERTY_ID === "home-narra") return null;
  try {
    const listing = readBaseStore().marketplace?.listings?.find((item) => item.id === ACTIVE_PROPERTY_ID);
    if (!listing) return null;
    const market = readBaseStore().marketplace || {};
    const owner = market.users?.find((item) => item.id === listing.ownerId);
    return { listing, market, owner };
  } catch (error) {
    return null;
  }
}

const activeProperty = getPropertyContext();
const propertyStoreKey = activeProperty ? `room-to-live-operations:${ACTIVE_PROPERTY_ID}` : STORE_KEY;

function buildPropertyStore({ listing, market, owner }) {
  const sourceUnits = (market.units || []).filter((unit) => unit.listingId === listing.id);
  const unitRows = sourceUnits.length ? sourceUnits : Array.from({ length: Number(listing.available) || 0 }, (_, index) => ({ id: `${listing.id}-U${index + 1}`, number: `${index + 1}01`, monthlyRent: listing.rent, capacity: listing.occupants || 1, status: "Available" }));
  return {
    tenants: [],
    units: unitRows.map((unit, index) => ({ id: unit.id, number: unit.number || `${index + 1}01`, type: listing.type || "Rental unit", floor: Number(unit.floor) || "", monthlyRent: Number(unit.monthlyRent) || Number(listing.rent) || 0, capacity: Number(unit.capacity) || Number(listing.occupants) || 1, description: "", status: unit.status || "Available" })),
    payments: [],
    utilityBills: [],
    settings: { adminName: owner?.name || listing.owner || "Property owner", adminEmail: owner?.email || "", adminPhone: "", propertyName: listing.name, propertyAddress: listing.address, propertyPhone: "", profileImage: "" }
  };
}

function loadStore() {
  if (activeProperty) {
    try {
      const saved = localStorage.getItem(propertyStoreKey);
      if (saved) {
        const data = JSON.parse(saved);
        data.settings = { ...buildPropertyStore(activeProperty).settings, ...data.settings, propertyName: activeProperty.listing.name, propertyAddress: activeProperty.listing.address };
        return data;
      }
    } catch (error) { /* Start with the current listing if its saved operations data is invalid. */ }
    return buildPropertyStore(activeProperty);
  }
  return readBaseStore();
}

let store = loadStore();

function saveStore() {
  try {
    localStorage.setItem(propertyStoreKey, JSON.stringify(store));
  } catch (error) {
    toast("Your changes could not be saved. Check available storage and try again.", "error");
  }
  if (typeof api !== "undefined" && typeof auth !== "undefined" && auth.isLoggedIn()) scheduleDatabaseSave();
}

let databaseSaveTimer;
let databaseSaveQueue = Promise.resolve();
let databaseWarningShown = false;

function scheduleDatabaseSave() {
  window.clearTimeout(databaseSaveTimer);
  databaseSaveTimer = window.setTimeout(() => {
    enqueueDatabaseSave().catch(showDatabaseSaveWarning);
  }, 250);
}

function enqueueDatabaseSave() {
  const snapshot = JSON.parse(JSON.stringify(store));
  const pending = databaseSaveQueue.catch(() => {}).then(() => api.saveState(propertyStoreKey, snapshot));
  databaseSaveQueue = pending.then(() => { databaseWarningShown = false; });
  return pending;
}

function flushDatabaseSave() {
  window.clearTimeout(databaseSaveTimer);
  return enqueueDatabaseSave();
}

function showDatabaseSaveWarning(error) {
  console.warn("MySQL save failed; this browser copy is still available.", error);
  if (!databaseWarningShown && typeof toast === "function") {
    toast("Could not save to MySQL. Check your database setup; this browser still has a local copy.", "error");
    databaseWarningShown = true;
  }
}

async function hydrateStoreFromDatabase() {
  if (typeof api === "undefined") return;
  try {
    const saved = await api.getState(propertyStoreKey);
    if (saved && typeof saved === "object") {
      store = { ...loadStore(), ...saved };
      localStorage.setItem(propertyStoreKey, JSON.stringify(store));
    } else {
      await api.saveState(propertyStoreKey, store);
    }
  } catch (error) {
    console.warn("MySQL is not connected yet; using this browser's saved copy.", error);
  }
}

const appDataReady = hydrateStoreFromDatabase();

function getTenant(id) { return store.tenants.find((tenant) => tenant.id === id); }
function getUnit(id) { return store.units.find((unit) => unit.id === id); }
function tenantName(tenant) { return tenant ? `${tenant.firstName} ${tenant.lastName}` : "Unknown tenant"; }
function tenantsInUnit(unitId) { return store.tenants.filter((tenant) => tenant.unitId === unitId && tenant.status === "Active"); }
function totalByStatus(rows, statuses) { return rows.filter((row) => statuses.includes(row.status)).reduce((sum, row) => sum + (Number(row.amount) || 0), 0); }

const navItems = [
  ["dashboard", "Dashboard", "dashboard.html", "dashboard"],
  ["tenants", "Tenants", "tenants.html", "tenants"],
  ["units", "Units", "units.html", "units"],
  ["payments", "Rent Payments", "payments.html", "payments"],
  ["bills", "Utility Bills", "utility-bills.html", "utility-bills"],
  ["reports", "Reports", "reports.html", "reports"],
  ["settings", "Settings", "settings.html", "settings"]
];

function navLink([iconName, label, href, key], current) {
  const active = key === current || (current === "tenant-details" && key === "tenants") || (current === "billing-statement" && key === "tenants");
  return `<li><a class="nav-link" href="${href}" aria-label="${escapeHTML(label)}" title="${escapeHTML(label)}"${active ? ' aria-current="page"' : ""}>${icon(iconName)}<span class="nav-text">${label}</span></a></li>`;
}

function renderShell(page) {
  const title = PAGE_NAMES[page] || "Dashboard";
  const setting = store.settings;
  const followUpPayments = store.payments.filter((payment) => ["Pending", "Overdue"].includes(payment.status)).length;
  const utilityBalance = totalByStatus(store.utilityBills, ["Unpaid", "Overdue"]);
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" id="sidebar" aria-label="Main navigation">
        <a class="brand" href="index.html" aria-label="Room to Live home" title="Room to Live">
          <span class="brand-mark brand-letter" aria-hidden="true">R</span>
          <span><strong>Room to Live</strong><small>Property operations</small></span>
        </a>
        <button class="property-switcher" type="button" data-action="property-menu" aria-label="Current property: ${escapeHTML(setting.propertyName)}">
          <span><strong>${escapeHTML(setting.propertyName)}</strong><small>Switch property</small></span>${icon("chevron")}
        </button>
        <p class="nav-label">WORKSPACE</p>
        <nav aria-label="Workspace"><ul class="nav-list">${navItems.map((item) => navLink(item, page)).join("")}</ul></nav>
        <div class="sidebar-bottom">
          <p class="nav-label">ACCOUNT</p>
          <a class="nav-link" href="index.html" data-action="logout" aria-label="Log out" title="Log out">${icon("logout")}<span class="nav-text">Log out</span></a>
          <div class="sidebar-note"><strong>Property records</strong>Manage tenants, units, rent, and utility bills.</div>
        </div>
      </aside>
      <div class="workspace">
        <header class="topbar">
          <div class="topbar-left">
            <button class="icon-button mobile-menu" type="button" data-action="toggle-menu" aria-label="Open navigation" aria-expanded="false">${icon("menu")}</button>
            <h2 class="topbar-title">${escapeHTML(title)}</h2><span class="topbar-context">${escapeHTML(setting.propertyName)}</span>
          </div>
          <div class="topbar-tools">
            <label class="global-search"><span class="sr-only">Search tenants, units, and bills</span>${icon("search")}<input type="search" id="global-search" placeholder="Search records" autocomplete="off"></label>
            <div class="notification-wrap"><button class="icon-button" type="button" data-action="notifications" aria-label="Notifications" title="Notifications">${icon("bell")}${followUpPayments ? '<span class="notification-dot" aria-hidden="true"></span>' : ""}</button><div class="popover" id="notifications-popover" hidden><div class="popover-heading">Property reminders</div><div class="popover-item">${icon(followUpPayments ? "warning" : "checkCircle")} <span>${followUpPayments ? `${followUpPayments} rent payments need follow-up.` : "No rent payments need follow-up."}</span></div><div class="popover-item">${icon("info")} <span>Utility balances total ${money(utilityBalance)}.</span></div></div></div>
            <div class="profile-wrap"><button class="profile-button" type="button" data-action="profile-menu" aria-expanded="false"><span class="avatar">${setting.profileImage ? `<img src="${setting.profileImage}" alt="">` : initials(setting.adminName)}</span><span class="profile-copy"><strong>${escapeHTML(setting.adminName)}</strong><small>Property owner</small></span>${icon("chevron", "profile-chevron")}</button><div class="popover" id="profile-popover" hidden><div class="popover-heading">${escapeHTML(setting.adminName)}</div><a class="popover-link" href="settings.html">${icon("settings")} Account settings</a><a class="popover-link" href="index.html" data-action="logout">${icon("logout")} Log out</a></div></div>
          </div>
        </header>
        <main class="page-content" id="page-content"></main>
      </div>
    </div>`;
}

function pageHeading(title, description, actions = "") {
  return `<div class="page-heading"><div class="page-heading-copy"><h1>${title}</h1>${description ? `<p>${description}</p>` : ""}</div>${actions ? `<div class="heading-actions">${actions}</div>` : ""}</div>`;
}

function actionButton(action, label, iconName = "plus", extra = "") {
  return `<button type="button" class="button button-primary ${extra}" data-action="${action}">${icon(iconName)}<span>${label}</span></button>`;
}

function tableShell(id, headers, rows, compact = false) {
  return `<div class="surface table-surface ${compact ? "compact" : ""}"><div class="table-scroll"><table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody id="${id}">${rows}</tbody></table></div></div>`;
}

function personCell(tenant) {
  const name = tenantName(tenant);
  return `<span class="person-cell"><span class="person-initials">${initials(name)}</span><span><span class="table-name">${escapeHTML(name)}</span><span class="table-sub">${escapeHTML(tenant?.id || "-")}</span></span></span>`;
}

function badge(status) { return `<span class="${statusClass(status)}">${escapeHTML(status)}</span>`; }

function renderDashboard() {
  const target = document.getElementById("page-content");
  const occupied = store.units.filter((unit) => unit.status === "Occupied").length;
  const available = store.units.filter((unit) => unit.status === "Available").length;
  const maintenance = store.units.filter((unit) => unit.status === "Maintenance").length;
  const pendingRent = totalByStatus(store.payments, ["Pending", "Overdue"]);
  const unpaidUtilities = totalByStatus(store.utilityBills, ["Unpaid", "Overdue"]);
  const occupancy = store.units.length ? Math.round(occupied / store.units.length * 100) : 0;
  const floors = new Set(store.units.map((unit) => unit.floor).filter(Boolean)).size;
  const metrics = [
    ["people", "Total tenants", store.tenants.length, "Active tenant records"],
    ["building", "Total units", store.units.length, floors ? `Across ${floors} ${floors === 1 ? "floor" : "floors"}` : "Units in this property"],
    ["home", "Occupied units", occupied, `${occupancy}% occupancy`],
    ["checkCircle", "Available units", available, "Ready for move-in"],
    ["coin", "Pending rent", money(pendingRent), "September 2026"],
    ["file", "Unpaid utility bills", money(unpaidUtilities), "September 2026"]
  ];
  const metricMarkup = metrics.map(([iconName, label, value, foot]) => `<div class="metric"><span class="metric-label">${icon(iconName)}${label}</span><strong class="metric-value">${value}</strong><span class="metric-foot">${foot}</span></div>`).join("");
  target.innerHTML = `
    <section class="dashboard-intro"><div><h1>Property overview</h1><p>Snapshot for ${escapeHTML(store.settings.propertyName)} this billing period.</p></div><div class="month-select"><span class="eyebrow">BILLING PERIOD</span><strong>September 2026</strong></div></section>
    <section class="surface metric-board" aria-label="Property summary">${metricMarkup}</section>
    <section class="content-section dashboard-grid">
      <div class="surface occupancy-surface">
        <div class="section-heading"><div><h2>Unit overview</h2><p>Current property occupancy</p></div><a class="section-link" href="units.html">All units ${icon("arrow")}</a></div>
        <div class="occupancy-summary"><strong>${occupied} <span class="muted">/ ${store.units.length}</span></strong><span>units occupied</span></div>
        <div class="occupancy-bar" role="img" aria-label="${occupied} occupied, ${available} available, ${maintenance} in maintenance"><span class="occupied-segment" style="width:${store.units.length ? occupied / store.units.length * 100 : 0}%"></span><span class="available-segment" style="width:${store.units.length ? available / store.units.length * 100 : 0}%"></span><span class="maintenance-segment" style="width:${store.units.length ? maintenance / store.units.length * 100 : 0}%"></span></div>
        <div class="occupancy-legend"><div class="legend-item"><i class="legend-dot"></i><span>Occupied<strong>${occupied}</strong></span></div><div class="legend-item"><i class="legend-dot available"></i><span>Available<strong>${available}</strong></span></div><div class="legend-item"><i class="legend-dot maintenance"></i><span>Maintenance<strong>${maintenance}</strong></span></div></div>
        <div class="unit-mini-list"><div class="unit-mini-row"><span>Rent due this month</span><span>${money(pendingRent)}</span></div><div class="unit-mini-row"><span>Utility balances</span><span>${money(unpaidUtilities)}</span></div></div>
      </div>
      <div><div class="section-heading"><div><h2>Recent rent payments</h2><p>Latest account activity</p></div><a class="section-link" href="payments.html">View payments ${icon("arrow")}</a></div>
        ${tableShell("dashboard-payments", ["Payment ID", "Tenant", "Unit", "Amount", "Date", "Status"], "<tr><td colspan='6'>Loading records...</td></tr>", true)}
      </div>
    </section>
    <section class="content-section"><div class="section-heading"><div><h2>Recent utility bills</h2><p>Charges and due dates for this period</p></div><a class="section-link" href="utility-bills.html">All bills ${icon("arrow")}</a></div>
      ${tableShell("dashboard-bills", ["Bill ID", "Tenant", "Unit", "Type", "Amount", "Due date", "Status"], "<tr><td colspan='7'>Loading records...</td></tr>", true)}
    </section>
    <section class="content-section"><div class="section-heading"><div><h2>Quick actions</h2><p>Start a common property task</p></div></div><div class="quick-actions">
      <button class="quick-action" type="button" data-action="add-tenant">${icon("plus")} Add tenant</button><button class="quick-action" type="button" data-action="add-unit">${icon("plus")} Add unit</button><button class="quick-action" type="button" data-action="add-payment">${icon("plus")} Record rent</button><button class="quick-action" type="button" data-action="add-bill">${icon("plus")} Add utility bill</button>
    </div></section>`;
  fillDashboardTables();
}

function fillDashboardTables() {
  const paymentBody = document.getElementById("dashboard-payments");
  if (paymentBody) {
    const rows = store.payments.slice(0, 5).map((payment) => {
      const tenant = getTenant(payment.tenantId);
      return `<tr><td><a href="tenant-details.html?id=${encodeURIComponent(payment.tenantId)}">${escapeHTML(payment.id)}</a></td><td>${escapeHTML(tenantName(tenant))}</td><td>${escapeHTML(payment.unitId)}</td><td>${money(payment.amount)}</td><td>${dateShort(payment.paymentDate)}</td><td>${badge(payment.status)}</td></tr>`;
    }).join("");
    paymentBody.innerHTML = rows || emptyRow(6, "No rent activity yet", "Record a payment to see it here.");
  }
  const billsBody = document.getElementById("dashboard-bills");
  if (billsBody) {
    const rows = store.utilityBills.slice(0, 5).map((bill) => `<tr><td><a href="billing-statement.html?id=${encodeURIComponent(bill.tenantId)}">${escapeHTML(bill.id)}</a></td><td>${escapeHTML(tenantName(getTenant(bill.tenantId)))}</td><td>${escapeHTML(bill.unitId)}</td><td>${escapeHTML(bill.type)}</td><td>${money(bill.amount)}</td><td>${dateShort(bill.dueDate)}</td><td>${badge(bill.status)}</td></tr>`).join("");
    billsBody.innerHTML = rows || emptyRow(7, "No utility bills yet", "Add a bill to see it here.");
  }
}

function emptyRow(columns, title, detail) {
  return `<tr><td colspan="${columns}"><div class="empty-state"><strong>${title}</strong><p>${detail}</p></div></td></tr>`;
}

function renderTenants() {
  const target = document.getElementById("page-content");
  const actions = actionButton("add-tenant", "Add tenant");
  target.innerHTML = `${pageHeading("Tenants", "Manage apartment and boarding house tenant records.", actions)}
    <div class="toolbar">
      <label class="control-wrap">${icon("search")}<span class="sr-only">Search tenant</span><input class="control control-search" id="table-search" type="search" placeholder="Search name, ID, or email"></label>
      <label><span class="sr-only">Filter tenant status</span><select class="control" id="filter-status"><option value="">All statuses</option><option>Active</option><option>Inactive</option></select></label>
      <label><span class="sr-only">Filter by unit</span><select class="control" id="filter-unit"><option value="">All units</option>${store.units.map((unit) => `<option value="${escapeHTML(unit.id)}">${escapeHTML(unit.number)}</option>`).join("")}</select></label>
      <span class="toolbar-spacer"></span><span class="table-count" id="table-count"></span>
    </div>
    ${tableShell("record-rows", ["Tenant ID", "Tenant name", "Contact number", "Email", "Unit", "Move-in date", "Status", "Actions"], "<tr><td colspan='8'>Loading records...</td></tr>")}
    <div class="pagination" id="pagination"></div>`;
  applyTableFilters();
}

function renderUnits() {
  const target = document.getElementById("page-content");
  target.innerHTML = `${pageHeading("Units", "Keep unit details, occupancy, and availability current.", actionButton("add-unit", "Add unit"))}
    <div class="toolbar">
      <label class="control-wrap">${icon("search")}<span class="sr-only">Search units</span><input class="control control-search" id="table-search" type="search" placeholder="Search unit or tenant"></label>
      <label><span class="sr-only">Filter unit status</span><select class="control" id="filter-status"><option value="">All statuses</option><option>Occupied</option><option>Available</option><option>Maintenance</option></select></label>
      <label><span class="sr-only">Filter unit type</span><select class="control" id="filter-type"><option value="">All unit types</option><option>Private studio</option><option>Shared room</option><option>Apartment</option><option>Boarding room</option></select></label>
      <span class="toolbar-spacer"></span><span class="table-count" id="table-count"></span>
    </div>
    ${tableShell("record-rows", ["Unit number", "Unit type", "Floor", "Monthly rent", "Tenant", "Capacity", "Status", "Actions"], "<tr><td colspan='8'>Loading records...</td></tr>")}`;
  applyTableFilters();
}

function renderPayments() {
  const totalCollected = totalByStatus(store.payments, ["Paid"]);
  const pending = totalByStatus(store.payments, ["Pending"]);
  const overdue = totalByStatus(store.payments, ["Overdue"]);
  const actions = actionButton("add-payment", "Record payment");
  document.getElementById("page-content").innerHTML = `${pageHeading("Rent Payments", "Review monthly rent records and record a tenant payment.", actions)}
    <div class="surface metric-board report-numbers payment-summary">
      <div class="metric"><span class="metric-label">Total collected</span><strong class="metric-value">${money(totalCollected)}</strong><span class="metric-foot">All shown periods</span></div>
      <div class="metric"><span class="metric-label">Pending payments</span><strong class="metric-value">${money(pending)}</strong><span class="metric-foot">Awaiting completion</span></div>
      <div class="metric"><span class="metric-label">Overdue payments</span><strong class="metric-value">${money(overdue)}</strong><span class="metric-foot">Needs follow-up</span></div>
      <div class="metric"><span class="metric-label">This month's collection</span><strong class="metric-value">${money(totalCollected)}</strong><span class="metric-foot">September 2026</span></div>
    </div>
    <div class="toolbar content-section">
      <label class="control-wrap">${icon("search")}<span class="sr-only">Search tenant or payment</span><input class="control control-search" id="table-search" type="search" placeholder="Search tenant or payment ID"></label>
      <label><span class="sr-only">Filter payment status</span><select class="control" id="filter-status"><option value="">All statuses</option><option>Paid</option><option>Pending</option><option>Overdue</option></select></label>
      <label><span class="sr-only">Filter billing month</span><select class="control" id="filter-month"><option value="">All periods</option>${[...new Set(store.payments.map((p) => p.billingMonth))].map((month) => `<option>${escapeHTML(month)}</option>`).join("")}</select></label>
      <label><span class="sr-only">Filter payment unit</span><select class="control" id="filter-unit"><option value="">All units</option>${store.units.map((unit) => `<option value="${escapeHTML(unit.id)}">${escapeHTML(unit.number)}</option>`).join("")}</select></label>
      <span class="toolbar-spacer"></span><span class="table-count" id="table-count"></span>
    </div>
    ${tableShell("record-rows", ["Payment ID", "Tenant", "Unit", "Billing month", "Amount", "Payment date", "Payment method", "Status", "Actions"], "<tr><td colspan='9'>Loading records...</td></tr>")}`;
  applyTableFilters();
}

function renderUtilityBills() {
  const total = store.utilityBills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const unpaid = totalByStatus(store.utilityBills, ["Unpaid"]);
  const overdue = totalByStatus(store.utilityBills, ["Overdue"]);
  document.getElementById("page-content").innerHTML = `${pageHeading("Utility Bills", "Manage tenant electricity, water, and other charges.", actionButton("add-bill", "Add utility bill"))}
    <div class="surface metric-board payment-summary">
      <div class="metric"><span class="metric-label">Total bills</span><strong class="metric-value">${store.utilityBills.length}</strong><span class="metric-foot">Current billing period</span></div>
      <div class="metric"><span class="metric-label">Unpaid bills</span><strong class="metric-value">${store.utilityBills.filter((bill) => bill.status === "Unpaid").length}</strong><span class="metric-foot">${money(unpaid)} outstanding</span></div>
      <div class="metric"><span class="metric-label">Overdue bills</span><strong class="metric-value">${store.utilityBills.filter((bill) => bill.status === "Overdue").length}</strong><span class="metric-foot">${money(overdue)} past due</span></div>
      <div class="metric"><span class="metric-label">Total outstanding</span><strong class="metric-value">${money(unpaid + overdue)}</strong><span class="metric-foot">Across all utility bills</span></div>
    </div>
    <div class="toolbar content-section">
      <label class="control-wrap">${icon("search")}<span class="sr-only">Search bills</span><input class="control control-search" id="table-search" type="search" placeholder="Search bill, tenant, or unit"></label>
      <label><span class="sr-only">Filter utility type</span><select class="control" id="filter-type"><option value="">All utility types</option><option>Electricity</option><option>Water</option><option>Other</option></select></label>
      <label><span class="sr-only">Filter bill status</span><select class="control" id="filter-status"><option value="">All statuses</option><option>Paid</option><option>Unpaid</option><option>Overdue</option></select></label>
      <label><span class="sr-only">Filter billing period</span><select class="control" id="filter-period"><option value="">All periods</option>${[...new Set(store.utilityBills.map((bill) => bill.billingPeriod))].map((period) => `<option>${escapeHTML(period)}</option>`).join("")}</select></label>
      <span class="toolbar-spacer"></span><span class="table-count" id="table-count"></span>
    </div>
    ${tableShell("record-rows", ["Bill ID", "Tenant", "Unit", "Utility type", "Billing period", "Amount", "Due date", "Status", "Actions"], "<tr><td colspan='9'>Loading records...</td></tr>")}`;
  applyTableFilters();
}

function renderTenantDetails() {
  const id = new URLSearchParams(location.search).get("id") || "TN-0001";
  const tenant = getTenant(id);
  const target = document.getElementById("page-content");
  if (!tenant) {
    target.innerHTML = `${pageHeading("Tenant details", "This tenant record could not be found.")}<div class="surface empty-state"><strong>No tenant record</strong><p>Return to the tenant list and choose a current record.</p><a class="button" href="tenants.html">Back to tenants</a></div>`;
    return;
  }
  const unit = getUnit(tenant.unitId);
  const tenantPayments = store.payments.filter((payment) => payment.tenantId === tenant.id);
  const paid = tenantPayments.filter((payment) => payment.status === "Paid").reduce((sum, payment) => sum + Number(payment.amount), 0);
  const outstandingRent = tenantPayments.filter((payment) => ["Pending", "Overdue"].includes(payment.status)).reduce((sum, payment) => sum + Number(payment.amount), 0);
  const utilityBalance = store.utilityBills.filter((bill) => bill.tenantId === tenant.id && bill.status !== "Paid").reduce((sum, bill) => sum + Number(bill.amount), 0);
  const actions = `<button class="button" type="button" data-action="edit-tenant" data-id="${tenant.id}">${icon("edit")}<span>Edit tenant</span></button><button class="button" type="button" data-action="record-tenant-payment" data-id="${tenant.id}">${icon("plus")}<span>Record payment</span></button><a class="button button-primary" href="billing-statement.html?id=${encodeURIComponent(tenant.id)}">${icon("file")}<span>View statement</span></a>`;
  const history = [...tenantPayments.map((item) => ({ date: item.paymentDate || "2026-09-15", kind: "Rent", period: item.billingMonth, amount: item.amount, method: item.paymentMethod || "-", status: item.status, id: item.id })), ...store.utilityBills.filter((item) => item.tenantId === tenant.id).map((item) => ({ date: item.dueDate, kind: item.type, period: item.billingPeriod, amount: item.amount, method: "-", status: item.status, id: item.id }))].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const historyRows = history.map((item) => `<tr><td>${dateShort(item.date)}</td><td>${escapeHTML(item.kind)}</td><td>${escapeHTML(item.period)}</td><td>${money(item.amount)}</td><td>${escapeHTML(item.method)}</td><td>${badge(item.status)}</td></tr>`).join("") || emptyRow(6, "No payment history yet", "Recorded rent and utility activity will appear here.");
  target.innerHTML = `<a class="back-link" href="tenants.html">${icon("back")} Back to tenants</a>
    <div class="record-head"><div class="profile-heading"><span class="profile-large">${initials(tenantName(tenant))}</span><span><h1>${escapeHTML(tenantName(tenant))}</h1><p>${escapeHTML(tenant.id)} · Unit ${escapeHTML(tenant.unitId)} · ${badge(tenant.status)}</p></span></div><div class="heading-actions">${actions}</div></div>
    <div class="details-grid">
      <section class="surface details-panel"><h2>Tenant profile</h2><dl class="detail-list"><div><dt>Tenant ID</dt><dd>${escapeHTML(tenant.id)}</dd></div><div><dt>Status</dt><dd>${badge(tenant.status)}</dd></div><div><dt>Contact number</dt><dd>${escapeHTML(tenant.phone)}</dd></div><div><dt>Email</dt><dd>${escapeHTML(tenant.email)}</dd></div><div><dt>Address</dt><dd>${escapeHTML(tenant.address)}</dd></div><div><dt>Move-in date</dt><dd>${dateShort(tenant.moveInDate)}</dd></div></dl></section>
      <section class="surface details-panel"><h2>Unit information</h2><dl class="detail-list"><div><dt>Unit number</dt><dd>${escapeHTML(unit?.number || "-")}</dd></div><div><dt>Unit type</dt><dd>${escapeHTML(unit?.type || "-")}</dd></div><div><dt>Monthly rent</dt><dd>${money(tenant.monthlyRent)}</dd></div><div><dt>Floor</dt><dd>${escapeHTML(unit?.floor || "-")}</dd></div><div><dt>Move-in date</dt><dd>${dateShort(tenant.moveInDate)}</dd></div><div><dt>Unit status</dt><dd>${badge(unit?.status || "Available")}</dd></div></dl></section>
      <section class="surface details-panel"><h2>Billing summary</h2><dl class="summary-list"><div><dt>Monthly rent</dt><dd>${money(tenant.monthlyRent)}</dd></div><div><dt>Total paid</dt><dd>${money(tenant.id === "TN-0001" && !paid ? 10000 : paid)}</dd></div><div><dt>Outstanding rent</dt><dd>${money(tenant.id === "TN-0001" && !outstandingRent ? 2000 : outstandingRent)}</dd></div><div><dt>Utility balance</dt><dd>${money(tenant.id === "TN-0001" && !utilityBalance ? 2400 : utilityBalance)}</dd></div></dl></section>
      <section class="surface details-panel"><h2>Account actions</h2><div class="button-row"><a class="button" href="billing-statement.html?id=${encodeURIComponent(tenant.id)}">${icon("file")} Open statement</a><button class="button" type="button" data-action="delete-tenant" data-id="${tenant.id}">${icon("trash")} Delete record</button></div></section>
    </div>
    <section class="content-section"><div class="section-heading"><div><h2>Payment history</h2><p>Rent and utility activity for this tenant</p></div></div>${tableShell("tenant-history", ["Date", "Payment type", "Billing period", "Amount", "Payment method", "Status"], historyRows)}</section>`;
}

function renderStatement() {
  const id = new URLSearchParams(location.search).get("id") || "TN-0001";
  const tenant = getTenant(id);
  const target = document.getElementById("page-content");
  if (!tenant) {
    target.innerHTML = `${pageHeading("Tenant Statement", "This tenant record could not be found.")}<div class="surface empty-state"><strong>No account to display</strong><p>Choose a tenant from the tenant list.</p><a class="button" href="tenants.html">Back to tenants</a></div>`;
    return;
  }
  const isJuan = tenant.id === "TN-0001";
  const rent = Number(tenant.monthlyRent) || 12000;
  const electricity = isJuan ? 1250 : store.utilityBills.find((bill) => bill.tenantId === tenant.id && bill.type === "Electricity")?.amount || 0;
  const water = isJuan ? 650 : store.utilityBills.find((bill) => bill.tenantId === tenant.id && bill.type === "Water")?.amount || 0;
  const other = isJuan ? 500 : store.utilityBills.find((bill) => bill.tenantId === tenant.id && bill.type === "Other")?.amount || 0;
  const total = rent + Number(electricity) + Number(water) + Number(other);
  const amountPaid = isJuan ? 10000 : store.payments.filter((payment) => payment.tenantId === tenant.id && payment.status === "Paid").reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balance = Math.max(0, total - amountPaid);
  const rentBalance = rent;
  const electricityBalance = rentBalance + Number(electricity);
  const waterBalance = electricityBalance + Number(water);
  const transactions = [
    ["2026-09-01", "Monthly rent", "Rent", rent, 0, rentBalance, "Pending"],
    ["2026-09-03", "Electricity charge", "Utility", Number(electricity), 0, electricityBalance, "Unpaid"],
    ["2026-09-04", "Water charge", "Utility", Number(water), 0, waterBalance, "Unpaid"],
    ["2026-09-05", "Common area charge", "Other", Number(other), 0, total, "Unpaid"],
    ["2026-09-10", "Payment received", "Payment", 0, amountPaid, balance, "Paid"]
  ];
  const rows = transactions.map(([date, description, type, amount, payment, remaining, status]) => `<tr><td>${dateShort(date)}</td><td>${escapeHTML(description)}</td><td>${escapeHTML(type)}</td><td>${amount ? money(amount) : "-"}</td><td>${payment ? money(payment) : "-"}</td><td>${money(remaining)}</td><td>${badge(status)}</td></tr>`).join("");
  target.innerHTML = `${pageHeading("Tenant Statement", "Billing period and transaction record.", `<div class="button-row statement-actions"><button class="button" type="button" data-action="print-statement">${icon("printer")}<span>Print</span></button><button class="button" type="button" data-action="download-statement">${icon("download")}<span>Download</span></button><button class="button button-primary" type="button" data-action="record-tenant-payment" data-id="${tenant.id}">${icon("plus")}<span>Record payment</span></button></div>`)}
    <article class="surface details-panel" id="statement-document">
      <div class="statement-head"><div class="statement-brand"><span class="brand-mark brand-letter" aria-hidden="true">R</span><span><h2>${escapeHTML(store.settings.propertyName)}</h2><p>${escapeHTML(store.settings.propertyAddress)}</p></span></div><div class="statement-period"><strong>September 2026</strong><span>TENANT BILLING STATEMENT</span></div></div>
      <div class="statement-parties"><div><p class="eyebrow">BILL TO</p><p><strong>${escapeHTML(tenantName(tenant))}</strong><br>Unit ${escapeHTML(tenant.unitId)}<br>${escapeHTML(tenant.email)}</p></div><div><p class="eyebrow">ACCOUNT DETAILS</p><p>Tenant ID: ${escapeHTML(tenant.id)}<br>Statement date: October 1, 2026<br>Due date: September 15, 2026</p></div></div>
      <div class="statement-summary"><div><span>Monthly rent</span><strong>${money(rent)}</strong></div><div><span>Electricity</span><strong>${money(electricity)}</strong></div><div><span>Water</span><strong>${money(water)}</strong></div><div><span>Other charges</span><strong>${money(other)}</strong></div><div><span>Total</span><strong>${money(total)}</strong></div><div><span>Amount paid</span><strong>${money(amountPaid)}</strong></div><div><span>Remaining balance</span><strong class="balance-value">${money(balance)}</strong></div></div>
      <section class="content-section"><div class="section-heading"><div><h2>Transactions</h2><p>Billing period: September 2026</p></div></div>${tableShell("statement-rows", ["Date", "Description", "Type", "Amount", "Payment", "Balance", "Status"], rows)}</section>
      <div class="statement-footer"><span>Tenant billing statement</span><span>All amounts in Philippine pesos (PHP)</span></div>
    </article>`;
}

let reportFilterState = { from: "2026-09-01", to: "2026-09-30", tenant: "", unit: "", status: "" };

function getFilteredReportRows() {
  const matches = (row) => {
    const date = row.dueDate || row.paymentDate || "2026-09-30";
    const normalizedStatus = row.status === "Unpaid" ? "Pending" : row.status;
    return (!reportFilterState.from || date >= reportFilterState.from)
      && (!reportFilterState.to || date <= reportFilterState.to)
      && (!reportFilterState.tenant || row.tenantId === reportFilterState.tenant)
      && (!reportFilterState.unit || row.unitId === reportFilterState.unit)
      && (!reportFilterState.status || normalizedStatus === reportFilterState.status);
  };
  return {
    payments: store.payments.filter(matches),
    bills: store.utilityBills.filter(matches)
  };
}

function renderReports(filters = reportFilterState) {
  reportFilterState = { ...reportFilterState, ...filters };
  const filtered = getFilteredReportRows();
  const totalCollected = totalByStatus(filtered.payments, ["Paid"]);
  const pending = totalByStatus(filtered.payments, ["Pending"]);
  const overdue = totalByStatus(filtered.payments, ["Overdue"]);
  const billsTotal = filtered.bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const paidBills = totalByStatus(filtered.bills, ["Paid"]);
  const unpaidBills = totalByStatus(filtered.bills, ["Unpaid"]);
  const overdueBills = totalByStatus(filtered.bills, ["Overdue"]);
  const max = Math.max(totalCollected, pending, overdue, 1);
  const unitCounts = ["Occupied", "Available", "Maintenance"].map((status) => [status, store.units.filter((unit) => unit.status === status).length]);
  document.getElementById("page-content").innerHTML = `${pageHeading("Reports", "Review rent collection, occupancy, and utility billing." )}
    <div class="surface"><div class="report-filters">
      <label class="field">Date from<input type="date" id="report-from" value="${escapeHTML(reportFilterState.from)}"></label><label class="field">Date to<input type="date" id="report-to" value="${escapeHTML(reportFilterState.to)}"></label>
      <label class="field">Tenant<select id="report-tenant"><option value="">All tenants</option>${store.tenants.map((tenant) => `<option value="${tenant.id}" ${reportFilterState.tenant === tenant.id ? "selected" : ""}>${escapeHTML(tenantName(tenant))}</option>`).join("")}</select></label>
      <label class="field">Unit<select id="report-unit"><option value="">All units</option>${store.units.map((unit) => `<option value="${unit.id}" ${reportFilterState.unit === unit.id ? "selected" : ""}>${escapeHTML(unit.number)}</option>`).join("")}</select></label>
      <label class="field">Status<select id="report-status"><option value="">All statuses</option><option ${reportFilterState.status === "Paid" ? "selected" : ""}>Paid</option><option ${reportFilterState.status === "Pending" ? "selected" : ""}>Pending</option><option ${reportFilterState.status === "Overdue" ? "selected" : ""}>Overdue</option></select></label>
      <button class="button button-primary" type="button" data-action="generate-report">${icon("filter")} Generate<span class="button-spinner" aria-hidden="true"></span></button>
    </div></div>
    <div class="heading-actions content-section"><button class="button" type="button" data-action="print-report">${icon("printer")} Print</button><button class="button" type="button" data-action="export-report">${icon("download")} Export CSV</button></div>
    <div class="report-grid content-section" id="report-results">
      <section class="surface report-section"><h2>Rent collection</h2><p>Recorded amounts for September 2026</p><div class="report-numbers"><div class="report-number"><span>Total collected</span><strong>${money(totalCollected)}</strong></div><div class="report-number"><span>Pending</span><strong>${money(pending)}</strong></div><div class="report-number"><span>Overdue</span><strong>${money(overdue)}</strong></div></div>
        <div class="bar-chart"><div class="bar-row"><span>Collected</span><div class="bar-track"><div class="bar-fill" style="width:${totalCollected / max * 100}%"></div></div><span class="bar-total">${money(totalCollected)}</span></div><div class="bar-row"><span>Pending</span><div class="bar-track"><div class="bar-fill pending" style="width:${pending / max * 100}%"></div></div><span class="bar-total">${money(pending)}</span></div><div class="bar-row"><span>Overdue</span><div class="bar-track"><div class="bar-fill overdue" style="width:${overdue / max * 100}%"></div></div><span class="bar-total">${money(overdue)}</span></div></div>
      </section>
      <section class="surface report-section"><h2>Unit occupancy</h2><p>Current unit status for ${escapeHTML(store.settings.propertyName)}</p><div class="report-numbers"><div class="report-number"><span>Total units</span><strong>${store.units.length}</strong></div><div class="report-number"><span>Occupied</span><strong>${unitCounts[0][1]}</strong></div><div class="report-number"><span>Available</span><strong>${unitCounts[1][1]}</strong></div></div><div class="occupancy-report">${unitCounts.map(([label, count]) => `<div class="occupancy-report-row"><span>${label}</span><div class="bar-track"><div class="bar-fill ${label === "Maintenance" ? "overdue" : label === "Available" ? "pending" : ""}" style="width:${store.units.length ? count / store.units.length * 100 : 0}%"></div></div><span>${count}</span></div>`).join("")}</div></section>
      <section class="surface report-section"><h2>Utility billing</h2><p>Recorded charges for September 2026</p><div class="report-numbers"><div class="report-number"><span>Total charges</span><strong>${money(billsTotal)}</strong></div><div class="report-number"><span>Paid</span><strong>${money(paidBills)}</strong></div><div class="report-number"><span>Outstanding</span><strong>${money(unpaidBills + overdueBills)}</strong></div></div><div class="bar-chart"><div class="bar-row"><span>Unpaid</span><div class="bar-track"><div class="bar-fill pending" style="width:${billsTotal ? unpaidBills / billsTotal * 100 : 0}%"></div></div><span class="bar-total">${money(unpaidBills)}</span></div><div class="bar-row"><span>Overdue</span><div class="bar-track"><div class="bar-fill overdue" style="width:${billsTotal ? overdueBills / billsTotal * 100 : 0}%"></div></div><span class="bar-total">${money(overdueBills)}</span></div></div></section>
      <section class="surface report-section"><h2>Collection notes</h2><p>Summary of current follow-up work</p><div class="unit-mini-list"><div class="unit-mini-row"><span>Rent records needing follow-up</span><strong>${filtered.payments.filter((payment) => ["Pending", "Overdue"].includes(payment.status)).length}</strong></div><div class="unit-mini-row"><span>Unpaid utility records</span><strong>${filtered.bills.filter((bill) => bill.status !== "Paid").length}</strong></div><div class="unit-mini-row"><span>Billing period</span><strong>${CURRENT_PERIOD}</strong></div></div></section>
    </div>`;
}

function renderSettings() {
  const setting = store.settings;
  const profile = setting.profileImage ? `<img src="${setting.profileImage}" alt="Admin profile" class="profile-large">` : `<span class="profile-large">${initials(setting.adminName)}</span>`;
  document.getElementById("page-content").innerHTML = `${pageHeading("Settings", "Update administrator and property information.")}
    <div class="settings-layout">
      <nav class="surface settings-nav" aria-label="Settings sections"><a href="#profile" aria-current="true">Profile</a><a href="#property">Property information</a><a href="#security">Security</a></nav>
      <form id="settings-form" class="settings-stack" novalidate>
        <section class="surface settings-panel" id="profile"><h2>Profile</h2><p>Property owner profile.</p><div class="profile-upload">${profile}<label class="field">Profile image<input name="profileImage" type="file" accept="image/*"><span class="field-hint">Select a profile image.</span></label></div><div class="settings-fields"><label class="field">Owner name<input name="adminName" value="${escapeHTML(setting.adminName)}" required></label><label class="field">Email<input name="adminEmail" type="email" value="${escapeHTML(setting.adminEmail)}" required></label><label class="field">Contact number<input name="adminPhone" type="tel" value="${escapeHTML(setting.adminPhone)}" required></label></div></section>
        <section class="surface settings-panel" id="property"><h2>Property information</h2><p>Contact details shown on tenant billing statements.</p><div class="settings-fields"><label class="field">Apartment or boarding house name<input name="propertyName" value="${escapeHTML(setting.propertyName)}" required></label><label class="field">Contact number<input name="propertyPhone" type="tel" value="${escapeHTML(setting.propertyPhone)}" required></label><label class="field full">Address<input name="propertyAddress" value="${escapeHTML(setting.propertyAddress)}" required></label></div></section>
        <section class="surface settings-panel" id="security"><h2>Security</h2><p>To change your password, contact your account administrator.</p><div class="settings-fields"><label class="field">New password<input name="newPassword" type="password" autocomplete="new-password" minlength="8" placeholder="Leave blank to keep unchanged"></label><label class="field">Confirm password<input name="confirmPassword" type="password" autocomplete="new-password" placeholder="Re-enter new password"></label></div></section>
        <div class="button-row"><button type="reset" class="button">Cancel changes</button><button type="submit" class="button button-primary">Save changes</button></div>
      </form>
    </div>`;
}

function rowActions(type, id, viewHref = "") {
  const view = viewHref ? `<a class="table-action" href="${viewHref}" title="View" aria-label="View record">${icon("eye")}</a>` : "";
  return `<span class="table-actions">${view}<button class="table-action" type="button" title="Edit" aria-label="Edit record" data-action="edit-${type}" data-id="${escapeHTML(id)}">${icon("edit")}</button><button class="table-action danger" type="button" title="Delete" aria-label="Delete record" data-action="delete-${type}" data-id="${escapeHTML(id)}">${icon("trash")}</button></span>`;
}

let tenantPage = 1;
const pageSize = 10;

function applyTableFilters() {
  const page = document.body.dataset.page;
  const body = document.getElementById("record-rows");
  if (!body) return;
  const query = (document.getElementById("table-search")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("filter-status")?.value || "";
  let rows = [];
  if (page === "tenants") {
    rows = store.tenants.filter((tenant) => {
      const name = tenantName(tenant).toLowerCase();
      const matchesText = [name, tenant.id.toLowerCase(), tenant.email.toLowerCase(), tenant.phone, tenant.unitId.toLowerCase()].some((value) => value.includes(query));
      return matchesText && (!statusFilter || tenant.status === statusFilter) && (!document.getElementById("filter-unit")?.value || tenant.unitId === document.getElementById("filter-unit").value);
    });
    const pages = Math.max(1, Math.ceil(rows.length / pageSize));
    tenantPage = Math.min(tenantPage, pages);
    const visible = rows.slice((tenantPage - 1) * pageSize, tenantPage * pageSize);
    body.innerHTML = visible.length ? visible.map((tenant) => `<tr><td>${escapeHTML(tenant.id)}</td><td>${personCell(tenant)}</td><td>${escapeHTML(tenant.phone)}</td><td>${escapeHTML(tenant.email)}</td><td>${escapeHTML(tenant.unitId)}</td><td>${dateShort(tenant.moveInDate)}</td><td>${badge(tenant.status)}</td><td>${rowActions("tenant", tenant.id, `tenant-details.html?id=${encodeURIComponent(tenant.id)}`)}</td></tr>`).join("") : emptyRow(8, "No tenants match these filters", "Try a different search or clear a filter.");
    const count = document.getElementById("table-count");
    if (count) count.textContent = `${rows.length.toLocaleString()} tenant records`;
    renderPagination(rows.length, pages);
    return;
  }
  if (page === "units") {
    rows = store.units.filter((unit) => {
      const people = tenantsInUnit(unit.id).map(tenantName).join(" ").toLowerCase();
      const text = `${unit.id} ${unit.type} ${people}`.toLowerCase();
      return text.includes(query) && (!statusFilter || unit.status === statusFilter) && (!document.getElementById("filter-type")?.value || unit.type === document.getElementById("filter-type").value);
    });
    body.innerHTML = rows.length ? rows.map((unit) => {
      const people = tenantsInUnit(unit.id);
      return `<tr><td><span class="table-name">${escapeHTML(unit.number)}</span><span class="table-sub">${escapeHTML(unit.description || store.settings.propertyName)}</span></td><td>${escapeHTML(unit.type)}</td><td>${escapeHTML(unit.floor || "—")}</td><td>${money(unit.monthlyRent)}</td><td>${people.length ? escapeHTML(tenantName(people[0])) + (people.length > 1 ? `<span class="table-sub">+${people.length - 1} more</span>` : "") : "-"}</td><td>${people.length} / ${escapeHTML(unit.capacity)}</td><td>${badge(unit.status)}</td><td>${rowActions("unit", unit.id, "")}</td></tr>`;
    }).join("") : emptyRow(8, "No units match these filters", "Try a different search or add a unit.");
  }
  if (page === "payments") {
    rows = store.payments.filter((payment) => {
      const tenant = getTenant(payment.tenantId);
      const text = `${payment.id} ${tenantName(tenant)} ${payment.unitId}`.toLowerCase();
      return text.includes(query) && (!statusFilter || payment.status === statusFilter) && (!document.getElementById("filter-month")?.value || payment.billingMonth === document.getElementById("filter-month").value) && (!document.getElementById("filter-unit")?.value || payment.unitId === document.getElementById("filter-unit").value);
    });
    body.innerHTML = rows.length ? rows.map((payment) => `<tr><td>${escapeHTML(payment.id)}</td><td>${personCell(getTenant(payment.tenantId))}</td><td>${escapeHTML(payment.unitId)}</td><td>${escapeHTML(payment.billingMonth)}</td><td>${money(payment.amount)}</td><td>${dateShort(payment.paymentDate)}</td><td>${escapeHTML(payment.paymentMethod || "-")}</td><td>${badge(payment.status)}</td><td>${rowActions("payment", payment.id, `billing-statement.html?id=${encodeURIComponent(payment.tenantId)}`)}</td></tr>`).join("") : emptyRow(9, "No payments match these filters", "Try a different search or record a payment.");
  }
  if (page === "utility-bills") {
    rows = store.utilityBills.filter((bill) => {
      const text = `${bill.id} ${tenantName(getTenant(bill.tenantId))} ${bill.unitId}`.toLowerCase();
      return text.includes(query) && (!statusFilter || bill.status === statusFilter) && (!document.getElementById("filter-type")?.value || bill.type === document.getElementById("filter-type").value) && (!document.getElementById("filter-period")?.value || bill.billingPeriod === document.getElementById("filter-period").value);
    });
    body.innerHTML = rows.length ? rows.map((bill) => `<tr><td>${escapeHTML(bill.id)}</td><td>${personCell(getTenant(bill.tenantId))}</td><td>${escapeHTML(bill.unitId)}</td><td>${escapeHTML(bill.type)}</td><td>${escapeHTML(bill.billingPeriod)}</td><td>${money(bill.amount)}</td><td>${dateShort(bill.dueDate)}</td><td>${badge(bill.status)}</td><td>${rowActions("bill", bill.id, `billing-statement.html?id=${encodeURIComponent(bill.tenantId)}`)}</td></tr>`).join("") : emptyRow(9, "No utility bills match these filters", "Try another search or add a bill.");
  }
  const count = document.getElementById("table-count");
  if (count) count.textContent = `${rows.length.toLocaleString()} ${page === "units" ? "units" : page === "payments" ? "payment records" : "utility bills"}`;
}

function renderPagination(count, pages) {
  const target = document.getElementById("pagination");
  if (!target) return;
  const start = count ? (tenantPage - 1) * pageSize + 1 : 0;
  const end = Math.min(tenantPage * pageSize, count);
  target.innerHTML = `<span>Showing ${start}-${end} of ${count.toLocaleString()} tenants</span><span class="pagination-controls"><button type="button" data-page="${tenantPage - 1}" ${tenantPage <= 1 ? "disabled" : ""} aria-label="Previous page">${icon("back")}</button><button type="button" aria-current="page">${tenantPage}</button><button type="button" data-page="${tenantPage + 1}" ${tenantPage >= pages ? "disabled" : ""} aria-label="Next page">${icon("arrow")}</button></span>`;
}

function fieldMarkup(field, value, mode) {
  const required = field.required ? "required" : "";
  const hint = field.hint ? `<span class="field-hint">${field.hint}</span>` : "";
  const full = field.full ? " full" : "";
  let control;
  if (field.type === "textarea") {
    control = `<textarea name="${field.name}" placeholder="${field.placeholder || ""}" ${required}>${escapeHTML(value ?? "")}</textarea>`;
  } else if (field.type === "select") {
    control = `<select name="${field.name}" ${required}><option value="">${field.placeholder || "Select an option"}</option>${field.options.map((option) => {
      const optionValue = typeof option === "string" ? option : option.value;
      const label = typeof option === "string" ? option : option.label;
      return `<option value="${escapeHTML(optionValue)}" ${String(value ?? "") === String(optionValue) ? "selected" : ""}>${escapeHTML(label)}</option>`;
    }).join("")}</select>`;
  } else {
    const pattern = field.pattern ? `pattern="${field.pattern}"` : "";
    const extra = field.min !== undefined ? `min="${field.min}"` : "";
    const step = field.step ? `step="${field.step}"` : "";
    control = `<input name="${field.name}" type="${field.type || "text"}" value="${escapeHTML(value ?? "")}" placeholder="${field.placeholder || ""}" ${required} ${pattern} ${extra} ${step}>`;
  }
  return `<label class="field${full}">${field.label}${control}${hint}<span class="field-error" data-error-for="${field.name}"></span></label>`;
}

function tenantOptions(selected = "") {
  return store.tenants.filter((tenant) => tenant.status === "Active").map((tenant) => ({ value: tenant.id, label: `${tenantName(tenant)} · ${tenant.unitId}` }));
}

function unitOptions(selected = "") {
  return store.units.filter((unit) => unit.status !== "Maintenance" || unit.id === selected).map((unit) => ({ value: unit.id, label: `${unit.number} · ${unit.status}` }));
}

function formSchema(type, record = {}) {
  if (type === "tenant") return { title: record.id ? "Edit tenant" : "Add tenant", intro: "Tenant contact and unit assignment.", fields: [
    { name: "firstName", label: "First name", required: true }, { name: "lastName", label: "Last name", required: true },
    { name: "phone", label: "Contact number", type: "tel", placeholder: "09XX XXX XXXX", pattern: "(09[0-9]{9}|\\+639[0-9]{9})", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "name@example.com", required: true },
    { name: "address", label: "Address", full: true, required: true },
    { name: "unitId", label: "Assigned unit", type: "select", options: unitOptions(record.unitId), required: true },
    { name: "moveInDate", label: "Move-in date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"], required: true }
  ] };
  if (type === "unit") return { title: record.id ? "Edit unit" : "Add unit", intro: "Unit details and current availability.", fields: [
    { name: "number", label: "Unit number", required: true },
    { name: "type", label: "Unit type", type: "select", options: ["Private studio", "Shared room", "Apartment", "Boarding room"], required: true },
    { name: "floor", label: "Floor", type: "number", min: 1, required: true }, { name: "monthlyRent", label: "Monthly rent (PHP)", type: "number", min: 0, step: 100, required: true },
    { name: "capacity", label: "Capacity", type: "number", min: 1, required: true }, { name: "status", label: "Status", type: "select", options: ["Occupied", "Available", "Maintenance"], required: true },
    { name: "description", label: "Description", type: "textarea", full: true }
  ] };
  if (type === "payment") return { title: record.id ? "Edit rent record" : "Record rent payment", intro: "Add payment details for this tenant.", fields: [
    { name: "tenantId", label: "Tenant", type: "select", options: tenantOptions(), required: true },
    { name: "unitId", label: "Unit", type: "select", options: unitOptions(), required: true },
    { name: "billingMonth", label: "Billing month", type: "month", required: true }, { name: "amount", label: "Amount (PHP)", type: "number", min: 1, step: 1, required: true },
    { name: "paymentDate", label: "Payment date", type: "date", required: true },
    { name: "paymentMethod", label: "Payment method", type: "select", options: ["Cash", "GCash", "Bank Transfer"], required: true },
    { name: "reference", label: "Reference number", placeholder: "Optional" },
    { name: "notes", label: "Notes", type: "textarea", full: true }
  ] };
  return { title: record.id ? "Edit utility bill" : "Add utility bill", intro: "Enter the tenant's utility charge and billing period.", fields: [
    { name: "tenantId", label: "Tenant", type: "select", options: tenantOptions(), required: true },
    { name: "unitId", label: "Unit", type: "select", options: unitOptions(), required: true },
    { name: "type", label: "Utility type", type: "select", options: ["Electricity", "Water", "Other"], required: true },
    { name: "billingPeriod", label: "Billing period", type: "month", required: true },
    { name: "previousReading", label: "Previous reading", type: "number", min: 0 }, { name: "currentReading", label: "Current reading", type: "number", min: 0 },
    { name: "amount", label: "Amount (PHP)", type: "number", min: 0, step: 1, required: true },
    { name: "dueDate", label: "Due date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", options: ["Paid", "Unpaid", "Overdue"], required: true },
    { name: "notes", label: "Notes", type: "textarea", full: true }
  ] };
}

let openRecord = null;

function openForm(type, record = {}) {
  const schema = formSchema(type, record);
  const values = { ...record };
  if (type === "payment" && values.billingMonth) values.billingMonth = monthInputValue(values.billingMonth);
  if (type === "bill" && values.billingPeriod) values.billingPeriod = monthInputValue(values.billingPeriod);
  openRecord = { type, id: record.id || null };
  const slot = document.getElementById("dialog-slot");
  slot.innerHTML = `<form class="dialog-form" id="record-form" novalidate>
    <div class="dialog-head"><div><h2 id="dialog-title">${schema.title}</h2><p>${schema.intro}</p></div><button type="button" class="icon-button" data-action="close-dialog" aria-label="Close dialog">${icon("close")}</button></div>
    <div class="dialog-body"><div class="form-grid">${schema.fields.map((field) => fieldMarkup(field, values[field.name], type)).join("")}</div><p class="form-error" id="modal-error" role="alert" hidden></p></div>
    <div class="dialog-footer"><button class="button" type="button" data-action="close-dialog">Cancel</button><button class="button button-primary" type="submit"><span>${record.id ? "Save changes" : type === "payment" ? "Save payment" : type === "bill" ? "Save utility bill" : type === "unit" ? "Save unit" : "Save tenant"}</span><span class="button-spinner" aria-hidden="true"></span></button></div>
  </form>`;
  const form = document.getElementById("record-form");
  form.elements.tenantId?.addEventListener("change", () => {
    const tenant = getTenant(form.elements.tenantId.value);
    if (tenant && form.elements.unitId) form.elements.unitId.value = tenant.unitId;
    if (tenant && type === "payment" && !record.id && form.elements.amount) form.elements.amount.value = tenant.monthlyRent;
  });
  form.elements.unitId?.addEventListener("change", () => {
    const unit = getUnit(form.elements.unitId.value);
    if (unit && type === "payment" && !record.id && Number(form.elements.amount.value) === 0) form.elements.amount.value = Math.round(unit.monthlyRent / Math.max(1, tenantsInUnit(unit.id).length));
  });
  form.addEventListener("submit", handleRecordSubmit);
  document.getElementById("record-dialog").showModal();
}

function closeDialogs() {
  document.getElementById("record-dialog")?.close();
  document.getElementById("confirm-dialog")?.close();
}

function validateForm(form) {
  let valid = true;
  for (const field of form.querySelectorAll("input,select,textarea")) {
    if (field.type === "file" || field.disabled) continue;
    const fieldValid = field.checkValidity();
    field.setAttribute("aria-invalid", fieldValid ? "false" : "true");
    const error = form.querySelector(`[data-error-for="${field.name}"]`);
    if (error) error.textContent = fieldValid ? "" : field.validationMessage;
    valid = valid && fieldValid;
  }
  return valid;
}

function handleRecordSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (openRecord.type === "unit" && form.elements.number) {
    const number = form.elements.number.value.trim().toLowerCase();
    const duplicate = store.units.some((unit) => unit.id !== openRecord.id && unit.number.toLowerCase() === number);
    form.elements.number.setCustomValidity(duplicate ? "A unit with this number already exists." : "");
  }
  if (!validateForm(form)) {
    form.querySelector('[aria-invalid="true"]')?.focus();
    toast("Please check the highlighted fields and try again.", "error");
    return;
  }
  const submit = form.querySelector('[type="submit"]');
  submit.classList.add("is-loading");
  submit.disabled = true;
  window.setTimeout(() => {
    const data = Object.fromEntries(new FormData(form).entries());
    const { type, id } = openRecord;
    const listName = type === "tenant" ? "tenants" : type === "unit" ? "units" : type === "payment" ? "payments" : "utilityBills";
    const list = store[listName];
    let record = id ? list.find((item) => item.id === id) : null;
    if (!record) {
      const prefix = type === "tenant" ? "TN" : type === "unit" ? "U" : type === "payment" ? "RP" : "UB";
      record = { id: `${prefix}-${Date.now().toString().slice(-7)}` };
      list.unshift(record);
    }
    Object.entries(data).forEach(([key, value]) => {
      if (["monthlyRent", "amount", "floor", "capacity", "previousReading", "currentReading"].includes(key)) record[key] = value === "" ? "" : Number(value);
      else record[key] = value;
    });
    if (type === "tenant") record.monthlyRent = record.monthlyRent || (getUnit(record.unitId)?.monthlyRent || 0);
    if (type === "tenant" && !id) {
      const unit = getUnit(record.unitId);
      const occupants = tenantsInUnit(record.unitId).length;
      if (unit) record.monthlyRent = Math.round(unit.monthlyRent / Math.max(1, occupants));
    }
    if (type === "payment") {
      record.billingMonth = data.billingMonth ? monthLabel(data.billingMonth) : CURRENT_PERIOD;
      record.status = "Paid";
    }
    if (type === "bill") {
      record.billingPeriod = data.billingPeriod ? monthLabel(data.billingPeriod) : CURRENT_PERIOD;
      record.status = data.status || "Unpaid";
    }
    if (type === "unit") record.number = record.number.toUpperCase();
    if (type === "tenant" && record.status === "Inactive") record.status = "Inactive";
    if (type === "unit") {
      const occupants = tenantsInUnit(record.id).length;
      if (record.status === "Available" && occupants > 0) {
        toast("This unit still has active tenants. Update their assignments before making it available.", "warning");
        record.status = "Occupied";
      }
    }
    reconcileUnitStatuses();
    saveStore();
    closeDialogs();
    refreshCurrentPage();
    toast(`${type === "payment" ? "Payment" : type === "bill" ? "Utility bill" : type === "unit" ? "Unit" : "Tenant"} successfully ${id ? "updated" : "added"}.`, "success");
  }, 220);
}

function monthLabel(value) {
  if (!value) return CURRENT_PERIOD;
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function monthInputValue(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}`;
  const date = new Date(`${value} 1`);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function reconcileUnitStatuses() {
  store.units.forEach((unit) => {
    const activeCount = tenantsInUnit(unit.id).length;
    if (activeCount > 0 && unit.status === "Available") unit.status = "Occupied";
    else if (activeCount === 0 && unit.status === "Occupied") unit.status = "Available";
  });
}

let deleteTarget = null;

function askDelete(type, id) {
  deleteTarget = { type, id };
  const name = type === "tenant" ? tenantName(getTenant(id)) : type === "unit" ? `unit ${id}` : type === "payment" ? `payment ${id}` : `bill ${id}`;
  document.getElementById("confirm-slot").innerHTML = `<div class="confirm-body"><div class="confirm-icon">${icon("warning")}</div><h2 id="confirm-title">Delete ${type === "tenant" ? "tenant" : type === "unit" ? "unit" : type === "payment" ? "payment record" : "utility bill"}?</h2><p>Are you sure you want to delete <strong>${escapeHTML(name)}</strong>? This action cannot be undone.</p></div><div class="dialog-footer"><button type="button" class="button" data-action="close-dialog">Cancel</button><button type="button" class="button button-danger" data-action="confirm-delete">Delete</button></div>`;
  document.getElementById("confirm-dialog").showModal();
}

function confirmDelete() {
  if (!deleteTarget) return;
  const { type, id } = deleteTarget;
  if (type === "tenant") {
    store.tenants = store.tenants.filter((item) => item.id !== id);
    store.payments = store.payments.filter((item) => item.tenantId !== id);
    store.utilityBills = store.utilityBills.filter((item) => item.tenantId !== id);
  } else if (type === "unit") {
    if (tenantsInUnit(id).length) {
      toast("This unit has active tenants. Reassign them before deleting the unit.", "warning");
      closeDialogs();
      return;
    }
    store.units = store.units.filter((item) => item.id !== id);
  } else if (type === "payment") store.payments = store.payments.filter((item) => item.id !== id);
  else store.utilityBills = store.utilityBills.filter((item) => item.id !== id);
  saveStore();
  closeDialogs();
  refreshCurrentPage();
  toast("Record deleted.", "success");
}

function refreshCurrentPage() {
  const page = document.body.dataset.page;
  if (page === "dashboard") renderDashboard();
  else if (page === "tenants" || page === "units" || page === "payments" || page === "utility-bills") {
    const searchValue = document.getElementById("table-search")?.value || "";
    renderPage(page);
    const search = document.getElementById("table-search");
    if (search) search.value = searchValue;
    applyTableFilters();
  } else if (page === "tenant-details") renderTenantDetails();
  else if (page === "billing-statement") renderStatement();
  else if (page === "reports") renderReports();
  else renderSettings();
  updateShellInfo();
}

function updateShellInfo() {
  const property = document.querySelector(".property-switcher strong");
  if (property) property.textContent = store.settings.propertyName;
  const context = document.querySelector(".topbar-context");
  if (context) context.textContent = store.settings.propertyName;
  const profile = document.querySelector(".profile-copy strong");
  if (profile) profile.textContent = store.settings.adminName;
  const avatar = document.querySelector(".profile-button .avatar");
  if (avatar) avatar.innerHTML = store.settings.profileImage ? `<img src="${store.settings.profileImage}" alt="">` : initials(store.settings.adminName);
}

function toast(message, type = "info") {
  const region = document.querySelector(".toast-region");
  if (!region) return;
  const iconName = type === "success" ? "checkCircle" : type === "error" ? "warning" : type === "warning" ? "warning" : "info";
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.innerHTML = `${icon(iconName)}<span>${escapeHTML(message)}</span><button type="button" aria-label="Dismiss notification">${icon("close")}</button>`;
  item.querySelector("button").addEventListener("click", () => dismissToast(item));
  region.append(item);
  window.setTimeout(() => dismissToast(item), 4500);
}

function dismissToast(item) {
  if (!item.isConnected || item.classList.contains("is-leaving")) return;
  item.classList.add("is-leaving");
  window.setTimeout(() => item.remove(), 180);
}

function renderPage(page) {
  if (page === "dashboard") renderDashboard();
  else if (page === "tenants") renderTenants();
  else if (page === "tenant-details") renderTenantDetails();
  else if (page === "units") renderUnits();
  else if (page === "payments") renderPayments();
  else if (page === "utility-bills") renderUtilityBills();
  else if (page === "billing-statement") renderStatement();
  else if (page === "reports") renderReports();
  else if (page === "settings") renderSettings();
}

function editRecord(type, id) {
  const key = type === "tenant" ? "tenants" : type === "unit" ? "units" : type === "payment" ? "payments" : "utilityBills";
  const record = store[key].find((item) => item.id === id);
  if (record) openForm(type, { ...record });
}

function handleAction(action, element) {
  const id = element.dataset.id;
  if (action === "add-tenant") openForm("tenant");
  else if (action === "add-unit") openForm("unit");
  else if (action === "add-payment") openForm("payment", { tenantId: "", unitId: "", billingMonth: "2026-09", paymentDate: "2026-09-30", amount: "" });
  else if (action === "add-bill") openForm("bill", { tenantId: "", unitId: "", billingPeriod: "2026-09", dueDate: "2026-10-15", status: "Unpaid" });
  else if (action === "edit-tenant") editRecord("tenant", id);
  else if (action === "edit-unit") editRecord("unit", id);
  else if (action === "edit-payment") editRecord("payment", id);
  else if (action === "edit-bill") editRecord("bill", id);
  else if (action.startsWith("delete-")) askDelete(action.replace("delete-", ""), id);
  else if (action === "record-tenant-payment") {
    const tenant = getTenant(id);
    openForm("payment", { tenantId: id, unitId: tenant?.unitId || "", billingMonth: "2026-09", paymentDate: "2026-09-30", amount: tenant?.monthlyRent || "" });
  } else if (action === "confirm-delete") confirmDelete();
  else if (action === "close-dialog") closeDialogs();
  else if (action === "toggle-menu") setNavigationOpen(!document.body.classList.contains("menu-open"));
  else if (action === "notifications") togglePopover("notifications-popover", element);
  else if (action === "profile-menu") togglePopover("profile-popover", element);
  else if (action === "forgot-password") toast("Password reset is unavailable. Contact your account administrator.", "info");
  else if (action === "toggle-password") togglePassword();
  else if (action === "print-statement" || action === "print-report") window.print();
  else if (action === "download-statement") downloadStatement();
  else if (action === "export-report") exportReport();
  else if (action === "generate-report") {
    const button = element;
    button.classList.add("is-loading"); button.disabled = true;
    reportFilterState = {
      from: document.getElementById("report-from").value,
      to: document.getElementById("report-to").value,
      tenant: document.getElementById("report-tenant").value,
      unit: document.getElementById("report-unit").value,
      status: document.getElementById("report-status").value
    };
    window.setTimeout(() => { renderReports(reportFilterState); toast("Report updated.", "success"); }, 350);
  } else if (action === "property-menu") location.href = "portal.html?role=landlord&view=properties";
}

function togglePopover(id, button) {
  const popover = document.getElementById(id);
  if (!popover) return;
  const opening = popover.hidden;
  document.querySelectorAll(".popover").forEach((item) => { item.hidden = true; });
  popover.hidden = !opening;
  button.setAttribute("aria-expanded", String(opening));
}

function setNavigationOpen(open) {
  document.body.classList.toggle("menu-open", open);
  if (open) {
    document.querySelectorAll(".popover").forEach((popover) => { popover.hidden = true; });
    document.querySelectorAll("[data-action='notifications'], [data-action='profile-menu']").forEach((item) => item.setAttribute("aria-expanded", "false"));
  }
  const button = document.querySelector('[data-action="toggle-menu"]');
  if (button) {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }
}

function togglePassword() {
  const input = document.getElementById("login-password");
  const button = document.querySelector('[data-action="toggle-password"]');
  if (!input || !button) return;
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  button.title = show ? "Hide password" : "Show password";
  button.innerHTML = icon(show ? "eyeOff" : "eye");
}

function downloadBlob(filename, content, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

function exportReport() {
  const filtered = getFilteredReportRows();
  const rows = [["Record type", "ID", "Tenant", "Unit", "Period", "Amount", "Status"]];
  filtered.payments.forEach((payment) => rows.push(["Rent", payment.id, tenantName(getTenant(payment.tenantId)), payment.unitId, payment.billingMonth, payment.amount, payment.status]));
  filtered.bills.forEach((bill) => rows.push([bill.type, bill.id, tenantName(getTenant(bill.tenantId)), bill.unitId, bill.billingPeriod, bill.amount, bill.status]));
  downloadBlob("narra-house-report.csv", rows.map((row) => row.map(csvCell).join(",")).join("\r\n"));
  toast("Report exported as CSV.", "success");
}

function downloadStatement() {
  const article = document.getElementById("statement-document");
  if (!article) return;
  const content = `NARRA HOUSE - TENANT STATEMENT\n${article.innerText.replace(/\n{3,}/g, "\n\n")}\n`;
  downloadBlob("tenant-statement.txt", content, "text/plain;charset=utf-8");
  toast("Statement downloaded as a text file.", "success");
}

function bindGlobalEvents() {
  document.addEventListener("click", (event) => {
    const routeLink = event.target.closest("a[href]");
    if (ACTIVE_PROPERTY_ID && routeLink) {
      const destination = new URL(routeLink.href, location.href);
      if (destination.origin === location.origin && Object.keys(PAGE_NAMES).some((route) => destination.pathname.endsWith(`${route}.html`))) {
        destination.searchParams.set("property", ACTIVE_PROPERTY_ID);
        routeLink.href = `${destination.pathname}${destination.search}${destination.hash}`;
      }
    }
    const actionElement = event.target.closest("[data-action]");
    if (document.body.classList.contains("menu-open") && actionElement?.dataset.action !== "toggle-menu" && (event.target === document.body || event.target.closest(".workspace, #sidebar a, #sidebar button"))) setNavigationOpen(false);
    if (actionElement) {
      if (actionElement.dataset.action === "logout") {
        event.preventDefault();
        if (typeof auth !== "undefined") auth.logout();
        else location.href = "login.html";
        return;
      }
      event.preventDefault();
      handleAction(actionElement.dataset.action, actionElement);
      return;
    }
    if (!event.target.closest(".popover, .profile-wrap, .notification-wrap")) {
      document.querySelectorAll(".popover").forEach((popover) => { popover.hidden = true; });
      document.querySelectorAll('[data-action="profile-menu"]').forEach((button) => button.setAttribute("aria-expanded", "false"));
    }
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) {
      tenantPage = Number(pageButton.dataset.page) || 1;
      applyTableFilters();
    }
  });
  document.addEventListener("input", (event) => {
    if (event.target.id === "table-search" || event.target.id.startsWith("filter-")) {
      tenantPage = 1;
      applyTableFilters();
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target.id === "filter-status" || event.target.id.startsWith("filter-")) applyTableFilters();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavigationOpen(false);
    if (event.target.id === "global-search" && event.key === "Enter") {
      event.preventDefault();
      const query = event.target.value.trim();
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (ACTIVE_PROPERTY_ID) params.set("property", ACTIVE_PROPERTY_ID);
      location.href = `tenants.html${params.size ? `?${params}` : ""}`;
    }
  });
}

function bindLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;
  const params = new URLSearchParams(location.search);
  const userInput = document.getElementById("login-user");
  if (params.get("loggedOut") === "1") toast("You have been logged out.", "info");
  if (localStorage.getItem("narra-house-remember") && userInput) userInput.value = localStorage.getItem("narra-house-remember");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const user = userInput.value.trim();
    const password = document.getElementById("login-password").value;
    const error = document.getElementById("login-error");
    if (!user || !password) {
      error.textContent = "Enter a username/email and password to continue.";
      error.hidden = false;
      toast("Please complete all required fields.", "error");
      (!user ? userInput : document.getElementById("login-password")).focus();
      return;
    }
    error.hidden = true;
    const submit = form.querySelector('[type="submit"]');
    submit.classList.add("is-loading"); submit.disabled = true;
    
    // Use auth.js
    if (typeof auth !== 'undefined') {
      const result = await auth.login(user, password);
      if (result.success) {
        if (document.getElementById("remember-me").checked) localStorage.setItem("narra-house-remember", user);
        else localStorage.removeItem("narra-house-remember");
        
        auth.redirectToDashboard();
      } else {
        submit.classList.remove("is-loading"); submit.disabled = false;
        error.textContent = result.error || "Invalid credentials.";
        error.hidden = false;
        toast("Login failed. Please check your credentials.", "error");
      }
    } else {
      // Fallback if auth.js is missing
      console.error("auth.js not loaded");
      submit.classList.remove("is-loading"); submit.disabled = false;
    }
  });
}

function bindSettings() {
  const form = document.getElementById("settings-form");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateForm(form)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      toast("Please check the highlighted fields.", "error");
      return;
    }
    const newPassword = form.elements.newPassword.value;
    const confirmPassword = form.elements.confirmPassword.value;
    if (newPassword && (newPassword.length < 8 || newPassword !== confirmPassword)) {
      toast("Passwords must match and contain at least 8 characters.", "error");
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const image = form.elements.profileImage.files[0];
    const save = form.querySelector('[type="submit"]');
    save.classList.add("is-loading"); save.disabled = true;
    if (image) {
      data.profileImage = await new Promise((resolve) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => resolve(""); reader.readAsDataURL(image);
      });
    } else data.profileImage = store.settings.profileImage;
    Object.assign(store.settings, data);
    delete store.settings.newPassword;
    delete store.settings.confirmPassword;
    saveStore();
    save.classList.remove("is-loading"); save.disabled = false;
    renderSettings();
    bindSettings();
    updateShellInfo();
    toast("Settings saved.", "success");
  });
  form.addEventListener("reset", () => window.setTimeout(() => renderSettings(), 0));
}

function init() {
  bindGlobalEvents();
  const page = document.body.dataset.page;
  const platformPage = document.body.dataset.platform;
  if (platformPage) return;
  if (page === "login") {
    bindLogin();
    return;
  }
  
  // Protect all operations pages
  if (typeof auth !== 'undefined' && auth.requireAuth) {
    if (!auth.requireAuth()) return;
    if (!['admin', 'landlord'].includes(auth.getRole())) {
      auth.redirectToDashboard();
      return;
    }
  }
  
  renderShell(page);
  renderPage(page);
  bindSettings();
  const search = document.getElementById("global-search");
  const query = new URLSearchParams(location.search).get("q");
  if (query && document.getElementById("table-search")) {
    document.getElementById("table-search").value = query;
    applyTableFilters();
  }
  if (search) search.addEventListener("input", () => {
    const tableSearch = document.getElementById("table-search");
    if (tableSearch) { tableSearch.value = search.value; applyTableFilters(); }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await appDataReady;
  init();
});
