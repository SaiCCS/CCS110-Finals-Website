"use strict";

const listingSeed = [
  { id: "home-narra", name: "Narra House", type: "Boarding house", rent: 8500, address: "Kamuning, Quezon City", city: "Quezon City", barangay: "Kamuning", province: "Metro Manila", region: "NCR", bedrooms: 1, bathrooms: 1, occupants: 1, furnished: true, pets: false, verified: true, rating: 4.8, reviewCount: 18, ownerRating: 4.9, ownerReviewCount: 18, image: "photo-1766792853044-bd397f7b76e9", imageAlt: "Leafy residential courtyard with open balconies", ownerId: "owner-demo", owner: "Maya Santos", available: 4, addedAt: "2026-09-15", description: "A leafy, welcoming boarding house tucked into the heart of Quezon City. Shared spaces are thoughtfully cared for, and transit is close by.", amenities: ["Wi-Fi", "Laundry area", "Shared kitchen", "CCTV", "Common garden"], rules: ["No smoking indoors", "Quiet hours after 10 PM", "Visitors must be registered"] },
  { id: "home-sunroom", name: "The Sunroom Studios", type: "Studio", rent: 14500, address: "Kapitolyo, Pasig City", city: "Pasig City", barangay: "Kapitolyo", province: "Metro Manila", region: "NCR", bedrooms: 1, bathrooms: 1, occupants: 2, furnished: true, pets: true, verified: true, rating: 4.9, reviewCount: 12, ownerRating: 4.9, ownerReviewCount: 18, image: "photo-1764760764956-fcb78be107a5", imageAlt: "Warm light across a calm, furnished bedroom", ownerId: "owner-demo", owner: "Maya Santos", available: 2, addedAt: "2026-09-24", description: "Bright private studios with clean lines, thoughtful storage, and a small shared garden. A calm home base near cafés and transport.", amenities: ["Wi-Fi", "Air conditioning", "Laundry", "Security", "Kitchenette"], rules: ["No smoking", "Pets by arrangement", "Quiet hours after 10 PM"] },
  { id: "home-luntian", name: "Luntian Residences", type: "Apartment", rent: 22500, address: "Teachers Village, Quezon City", city: "Quezon City", barangay: "Teachers Village", province: "Metro Manila", region: "NCR", bedrooms: 2, bathrooms: 1, occupants: 4, furnished: false, pets: true, verified: false, rating: 4.6, reviewCount: 8, ownerRating: 4.6, ownerReviewCount: 8, image: "photo-1779239358567-8a8e26f503d1", imageAlt: "Sunlit bedroom with a soft, neutral interior", ownerId: "owner-two", owner: "Rafael Cruz", available: 1, addedAt: "2026-09-28", description: "A generous two-bedroom apartment on a quieter, tree-lined street with easy access to university and neighborhood life.", amenities: ["Balcony", "Water included", "Security", "Pet friendly", "Parking"], rules: ["No smoking indoors", "One-month deposit"] }
];

function platformStore() {
  const isNew = !store.marketplace;
  let didSeedRenter = false;
  store.marketplace ||= {};
  const market = store.marketplace;
  const needsListings = !Array.isArray(market.listings) || market.listings.length === 0;
  if (needsListings) market.listings = listingSeed.map((item) => ({ ...item }));
  if (!Array.isArray(market.users) || market.users.length === 0) market.users = [{ id: "owner-demo", name: "Maya Santos", email: "maya@example.com", role: "landlord", capabilities: ["renter", "landlord"], status: "Active", verified: true }, { id: "owner-two", name: "Rafael Cruz", email: "rafael@example.com", role: "landlord", capabilities: ["renter", "landlord"], status: "Pending", verified: false }, { id: "renter-demo", name: "Alex Rivera", email: "alex@example.com", role: "renter", capabilities: ["renter"], status: "Active", verified: false }, { id: "admin-demo", name: "System Administrator", email: "admin@roomtolive.ph", role: "admin", capabilities: ["admin"], status: "Active", verified: true }, { id: "staff-demo", name: "Property Staff", email: "staff@roomtolive.ph", role: "staff", capabilities: ["landlord"], status: "Active", verified: false }];
  if (!market.users.some((item) => item.id === "renter-demo")) {
    market.users.push({ id: "renter-demo", name: "Alex Rivera", email: "alex@example.com", role: "renter", capabilities: ["renter"], status: "Active", verified: false });
    didSeedRenter = true;
  }
  market.applications ||= [];
  market.saved ||= [];
  market.messages ||= [];
  market.maintenance ||= [];
  market.paymentIntents ||= [];
  market.reviews ||= [];
  market.reports ||= [];
  market.documents ||= [];
  market.landlordApplications ||= [];
  if (!Array.isArray(market.units) || market.units.length === 0) market.units = market.listings.flatMap((listing) => Array.from({ length: Number(listing.available) || 0 }, (_, index) => ({ id: `${listing.id}-U${index + 1}`, listingId: listing.id, number: `${index + 1}01`, monthlyRent: listing.rent, capacity: listing.occupants || 1, status: "Available" })));
  market.leases ||= [];
  const authenticatedUser = typeof auth !== "undefined" ? auth.getSession() : null;
  if (authenticatedUser) {
    market.session = {
      id: marketplaceAccountId(authenticatedUser),
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role === "tenant" ? "renter" : authenticatedUser.role,
    };
  } else {
    delete market.session;
  }
  if (isNew || needsListings || didSeedRenter) saveStore();
  return market;
}

function marketplaceAccountId(account) {
  // The built-in landlord login represents the seeded owner-demo profile.
  return account?.id === "demo-landlord" ? "owner-demo" : account?.id;
}

function listingPhoto(listing, width = 1000) {
  const image = String(listing?.image || "").trim();
  if (/^https?:\/\//i.test(image)) return image;
  if (/^photo-[\w-]+$/i.test(image)) return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=82`;
  return `https://images.unsplash.com/${listingSeed[1].image}?auto=format&fit=crop&w=${Math.min(width, 1100)}&q=82`;
}
function isSampleListing(item) {
  return listingSeed.some((seed) => seed.id === item?.id) || String(item?.id || "").startsWith("sample-property-");
}
function listingById(id) { return platformStore().listings.find((item) => item.id === id); }
function listingURL(id) { return `property-details.html?id=${encodeURIComponent(id)}`; }
function platformToast(message, kind = "info") { if (typeof toast === "function") toast(message, kind); }
function listingCard(item, compact = false) {
  const market = platformStore();
  const owner = market.users.find((user) => user.id === item.ownerId);
  const scores = listingScores(item);
  const sample = isSampleListing(item);
  return `<article class="listing-card ${compact ? "listing-card-compact" : ""}"><a class="listing-image-link" href="${listingURL(item.id)}" aria-label="View ${escapeHTML(item.name)}"><img class="listing-image" src="${listingPhoto(item, compact ? 800 : 1100)}" alt="${escapeHTML(item.imageAlt)}" loading="lazy"><span class="listing-image-count">${item.available} ${item.available === 1 ? "home" : "homes"} available</span></a><div class="listing-card-body"><div class="listing-card-kicker"><span>${escapeHTML(item.type)}</span>${sample ? '<span class="sample-mark">Class project sample</span>' : ""}${item.verified ? `<span class="verified-mark"><span aria-hidden="true">✓</span> ${sample ? "Demo verified property" : "Verified property"}</span>` : ""}${owner?.verified ? `<span class="verified-mark"><span aria-hidden="true">✓</span> ${sample ? "Demo verified landlord" : "Verified landlord"}</span>` : ""}</div><div class="listing-title-row"><h3><a href="${listingURL(item.id)}">${escapeHTML(item.name)}</a></h3><span class="rating"><span aria-hidden="true">★</span> ${scores.property.toFixed(1)}</span></div><p class="listing-location">${escapeHTML(item.address)}</p><div class="listing-card-foot"><p><strong>${money(item.rent)}</strong><span> / month · Owner ★ ${scores.owner.toFixed(1)}</span></p><a class="round-arrow" href="${listingURL(item.id)}" aria-label="See ${escapeHTML(item.name)} details">↗</a></div></div></article>`;
}

function ownerListingCard(item) {
  return `<div class="portal-owner-listing">${listingCard(item, true)}<a class="portal-owner-dashboard" href="dashboard.html?property=${encodeURIComponent(item.id)}"><span>Open ${escapeHTML(item.name)} dashboard</span><span aria-hidden="true">↗</span></a></div>`;
}

function listingScores(item) {
  const visible = platformStore().reviews.filter((review) => review.listingId === item.id && review.status !== "Hidden");
  if (!visible.length) return { property: Number(item.rating) || 0, owner: Number(item.ownerRating) || 0, count: Number(item.reviewCount) || 0 };
  const mean = (key, fallback) => visible.reduce((total, review) => total + (Number(review[key]) || 0), 0) / visible.length || fallback;
  return { property: mean("propertyRating", item.rating), owner: mean("ownerRating", item.ownerRating), count: visible.length };
}

function accountDashboardHref(session = auth?.getSession?.()) {
  const role = session?.role === "tenant" ? "renter" : session?.role;
  if (!role || !["renter", "landlord", "admin"].includes(role)) return "login.html";
  const view = role === "admin" ? "overview" : "overview";
  return `portal.html?role=${encodeURIComponent(role)}&view=${view}`;
}

function refreshAuthenticationNavigation() {
  if (typeof auth === "undefined") return;
  const session = auth.getSession();
  if (!session) return;

  const dashboardHref = accountDashboardHref(session);
  const actions = document.querySelector(".market-nav-actions");
  if (actions) {
    actions.innerHTML = `<a class="market-login" href="${dashboardHref}">My account</a><button class="market-button market-button-dark" type="button" data-auth-logout>Log out</button>`;
  }

  document.querySelectorAll('.market-footer a[href="login.html"]').forEach((link) => {
    link.href = dashboardHref;
    link.textContent = "My account";
  });
  document.querySelectorAll('.market-footer a[href="register.html"]').forEach((link) => link.remove());
}

function syncAuthenticationPage() {
  refreshAuthenticationNavigation();
  if (typeof auth === "undefined" || !auth.isLoggedIn()) {
    if (document.body.dataset.platform === "portal") location.replace("login.html");
    return;
  }

  if (document.body.dataset.page === "login" || document.body.dataset.platform === "register") {
    auth.redirectToDashboard();
  }
}

document.addEventListener("click", (event) => {
  const menuButton = event.target.closest(".market-menu-toggle");
  if (menuButton) {
    const header = menuButton.closest(".market-nav");
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    menuButton.querySelector("span").textContent = expanded ? "Menu" : "Close menu";
    header.classList.toggle("is-menu-open", !expanded);
    return;
  }
  if (event.target.closest(".market-nav nav a")) {
    const header = event.target.closest(".market-nav");
    if (header?.classList.contains("is-menu-open")) closeMarketMenu(header);
    return;
  }
  const openMenu = document.querySelector(".market-nav.is-menu-open");
  if (openMenu && !event.target.closest(".market-nav")) closeMarketMenu(openMenu);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const openMenu = document.querySelector(".market-nav.is-menu-open");
  if (openMenu) closeMarketMenu(openMenu, true);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 650) {
    const openMenu = document.querySelector(".market-nav.is-menu-open");
    if (openMenu) closeMarketMenu(openMenu);
  }
});
function closeMarketMenu(header, returnFocus = false) {
  header.classList.remove("is-menu-open");
  const button = header.querySelector(".market-menu-toggle");
  button?.setAttribute("aria-expanded", "false");
  const label = button?.querySelector("span");
  if (label) label.textContent = "Menu";
  if (returnFocus) button?.focus();
}

document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.matches(".listing-image, .gallery-main, .gallery-side")) return;
  if (image.dataset.fallbackAttempted) return;
  image.dataset.fallbackAttempted = "true";
  image.src = `https://images.unsplash.com/${listingSeed[1].image}?auto=format&fit=crop&w=1000&q=82`;
  image.alt = "Illustrative rental photo; the listing photo could not be loaded.";
}, true);

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-auth-logout]") && typeof auth !== "undefined") {
    event.preventDefault();
    auth.logout();
  }
});
window.addEventListener("pageshow", syncAuthenticationPage);
window.addEventListener("storage", (event) => {
  if (event.key !== "rtl-session") return;
  syncAuthenticationPage();
});

function initPlatform(page) {
  if (document.body.dataset.platformReady === "true") return;
  document.body.dataset.platformReady = "true";
  platformStore();
  if (page !== "portal") document.querySelectorAll('a[href="portal.html?role=landlord"]').forEach((link) => { link.href = "portal.html?role=renter&view=landlord-application"; });
  bindPortalEvents();
  if (page === "home") renderHome();
  if (page === "browse") initBrowse();
  if (page === "details") renderPropertyDetails();
  if (page === "register") initRegister();
  if (page === "portal") renderPortal();
}

function renderHome() {
  const target = document.getElementById("featured-listings");
  if (target) target.innerHTML = platformStore().listings.slice(0, 3).map((item, index) => `<div class="featured-item featured-item-${index + 1}">${listingCard(item, true)}</div>`).join("");
  document.getElementById("home-search")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const params = new URLSearchParams();
    if (form.elements.q.value.trim()) params.set("q", form.elements.q.value.trim());
    if (form.elements.type.value) params.set("type", form.elements.type.value);
    if (form.elements.budget.value) params.set("budget", form.elements.budget.value);
    location.href = `properties.html${params.size ? `?${params}` : ""}`;
  });
}

function initBrowse() {
  const form = document.getElementById("filter-form");
  document.getElementById("filter-type").insertAdjacentHTML("beforeend", `<option>Dormitory</option><option>House</option><option>Condo</option><option>Room for rent</option><option>Bedspace</option><option>Other</option>`);
  document.getElementById("sort-listings").insertAdjacentHTML("beforeend", `<option value="newest">Recently added</option>`);
  document.getElementById("advanced-filters").insertAdjacentHTML("afterbegin", `<label class="search-field"><span>MINIMUM MONTHLY RENT</span><input type="number" id="filter-min-budget" min="0" placeholder="₱0"></label><label class="search-field"><span>MINIMUM BATHROOMS</span><select id="filter-baths"><option value="0">Any</option><option value="1">1+</option><option value="2">2+</option></select></label><label class="search-field"><span>OCCUPANTS</span><select id="filter-occupants"><option value="0">Any</option><option value="1">1+</option><option value="2">2+</option><option value="4">4+</option></select></label><label class="search-field"><span>MINIMUM RATING</span><select id="filter-rating"><option value="0">Any</option><option value="4">4.0+</option><option value="4.5">4.5+</option><option value="4.8">4.8+</option></select></label>${["Wi-Fi", "Parking", "Water included", "Pet friendly"].map((amenity) => `<label class="check-filter"><input type="checkbox" data-amenity="${amenity}"> ${amenity}</label>`).join("")}<label class="check-filter"><input id="filter-landlord-verified" type="checkbox"> Verified landlord</label>`);
  const params = new URLSearchParams(location.search);
  document.getElementById("filter-query").value = params.get("q") || "";
  document.getElementById("filter-type").value = params.get("type") || "";
  document.getElementById("filter-budget").value = params.get("budget") || "";
  document.getElementById("filter-min-budget").value = params.get("minBudget") || "";
  document.getElementById("filter-beds").value = params.get("beds") || "0";
  document.getElementById("filter-baths").value = params.get("baths") || "0";
  document.getElementById("filter-occupants").value = params.get("occupants") || "0";
  document.getElementById("filter-rating").value = params.get("rating") || "0";
  document.getElementById("filter-verified").checked = params.get("verified") === "1";
  document.getElementById("filter-landlord-verified").checked = params.get("verifiedLandlord") === "1";
  document.getElementById("filter-furnished").checked = params.get("furnished") === "1";
  document.querySelectorAll("[data-amenity]").forEach((input) => { input.checked = params.getAll("amenity").includes(input.dataset.amenity); });
  document.getElementById("sort-listings").value = params.get("sort") || "recommended";
  const hasAdvancedFilters = ["minBudget", "beds", "baths", "occupants", "rating", "verified", "verifiedLandlord", "furnished", "amenity"].some((key) => params.has(key));
  if (hasAdvancedFilters) {
    document.getElementById("advanced-filters").hidden = false;
    document.getElementById("advanced-toggle").setAttribute("aria-expanded", "true");
  }
  const inputs = [...form.querySelectorAll("input, select")];
  inputs.forEach((input) => input.addEventListener("input", renderBrowseResults));
  document.getElementById("sort-listings").addEventListener("change", renderBrowseResults);
  form.addEventListener("submit", (event) => { event.preventDefault(); renderBrowseResults(); });
  document.getElementById("advanced-toggle").addEventListener("click", (event) => {
    const panel = document.getElementById("advanced-filters");
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
  });
  document.getElementById("clear-filters").addEventListener("click", clearBrowseFilters);
  document.getElementById("empty-reset").addEventListener("click", clearBrowseFilters);
  renderBrowseResults();
}

function clearBrowseFilters() {
  document.getElementById("filter-form").reset();
  document.getElementById("sort-listings").value = "recommended";
  renderBrowseResults();
}

function renderBrowseResults() {
  const query = document.getElementById("filter-query").value.trim().toLowerCase();
  const type = document.getElementById("filter-type").value;
  const budget = Number(document.getElementById("filter-budget").value) || Infinity;
  const minBudget = Number(document.getElementById("filter-min-budget").value) || 0;
  const beds = Number(document.getElementById("filter-beds").value) || 0;
  const baths = Number(document.getElementById("filter-baths").value) || 0;
  const occupants = Number(document.getElementById("filter-occupants").value) || 0;
  const rating = Number(document.getElementById("filter-rating").value) || 0;
  const verified = document.getElementById("filter-verified").checked;
  const verifiedLandlord = document.getElementById("filter-landlord-verified").checked;
  const furnished = document.getElementById("filter-furnished").checked;
  const amenities = [...document.querySelectorAll("[data-amenity]:checked")].map((input) => input.dataset.amenity.toLowerCase());
  const sort = document.getElementById("sort-listings").value;
  const params = new URLSearchParams();
  const saveParam = (key, value, defaultValue = "") => { if (value && value !== defaultValue) params.set(key, value); };
  saveParam("q", document.getElementById("filter-query").value.trim());
  saveParam("type", type);
  saveParam("budget", document.getElementById("filter-budget").value);
  saveParam("minBudget", document.getElementById("filter-min-budget").value);
  saveParam("beds", document.getElementById("filter-beds").value, "0");
  saveParam("baths", document.getElementById("filter-baths").value, "0");
  saveParam("occupants", document.getElementById("filter-occupants").value, "0");
  saveParam("rating", document.getElementById("filter-rating").value, "0");
  saveParam("verified", document.getElementById("filter-verified").checked ? "1" : "");
  saveParam("verifiedLandlord", document.getElementById("filter-landlord-verified").checked ? "1" : "");
  saveParam("furnished", document.getElementById("filter-furnished").checked ? "1" : "");
  document.querySelectorAll("[data-amenity]:checked").forEach((input) => params.append("amenity", input.dataset.amenity));
  saveParam("sort", sort, "recommended");
  history.replaceState(history.state, "", `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`);
  let matches = platformStore().listings.filter((item) => {
    const owner = platformStore().users.find((x) => x.id === item.ownerId);
    const haystack = `${item.name} ${item.address} ${item.barangay || ""} ${item.city || ""} ${item.province || ""} ${item.region || ""} ${item.type}`.toLowerCase();
    return (!query || haystack.includes(query)) && (!type || item.type === type) && item.rent <= budget && item.rent >= minBudget && item.bedrooms >= beds && item.bathrooms >= baths && (Number(item.occupants) || 0) >= occupants && (!verified || item.verified) && (!verifiedLandlord || owner?.verified) && (!furnished || item.furnished) && (Number(item.rating) || 0) >= rating && amenities.every((amenity) => item.amenities.some((entry) => entry.toLowerCase().includes(amenity)));
  });
  if (sort === "price-low") matches.sort((a, b) => a.rent - b.rent);
  else if (sort === "price-high") matches.sort((a, b) => b.rent - a.rent);
  else if (sort === "rating") matches.sort((a, b) => b.rating - a.rating);
  else if (sort === "newest") matches.sort((a, b) => String(b.addedAt || "").localeCompare(String(a.addedAt || "")));
  document.getElementById("result-count").textContent = `${matches.length} ${matches.length === 1 ? "place" : "places"} to explore`;
  document.getElementById("listing-results").innerHTML = matches.map((item) => listingCard(item)).join("");
  document.getElementById("empty-results").hidden = matches.length > 0;
}

function renderPropertyDetails() {
  const market = platformStore();
  const id = new URLSearchParams(location.search).get("id") || market.listings[0]?.id;
  const item = listingById(id);
  const root = document.getElementById("property-detail");
  if (!item) { root.innerHTML = `<a class="back-link" href="properties.html">← Back to places</a><div class="empty-results"><h1>We couldn’t find that place.</h1><a href="properties.html">Browse all listings</a></div>`; return; }
  document.title = `${item.name} | Room to Live`;
  const saved = market.saved.includes(item.id);
  const ownerProfile = market.users.find((user) => user.id === item.ownerId);
  const scores = listingScores(item);
  root.innerHTML = `
    <a class="back-link" href="properties.html">← All places</a>
    <div class="detail-heading"><div><p class="market-eyebrow">${escapeHTML(item.type)}${isSampleListing(item) ? " · SAMPLE LISTING" : ""}${item.verified ? (isSampleListing(item) ? " · DEMO STATUS: VERIFIED" : " · VERIFIED PROPERTY") : ""}</p><h1>${escapeHTML(item.name)}</h1><p>${escapeHTML(item.address)} <span class="detail-rating">★ ${Number(item.rating).toFixed(1)} <small>(${item.reviewCount} reviews)</small></span></p></div><button class="save-listing ${saved ? "is-saved" : ""}" type="button" data-platform-action="save" data-id="${item.id}" aria-pressed="${saved}"><span aria-hidden="true">${saved ? "♥" : "♡"}</span><span>${saved ? "Saved" : "Save place"}</span></button></div>
    ${isSampleListing(item) ? '<p class="sample-disclosure" role="note">Sample listing for this class project. Verification and review details are simulated; no property or identity checks were performed.</p>' : ""}
    <div class="detail-gallery"><img class="gallery-main" src="${listingPhoto(item, 1100)}" alt="${escapeHTML(item.imageAlt)}"><img class="gallery-side gallery-side-one" src="https://images.unsplash.com/photo-1765185237761-9f42d0764304?auto=format&fit=crop&w=1000&q=82" alt="Sunlit interior hallway" loading="lazy"><img class="gallery-side gallery-side-two" src="https://images.unsplash.com/photo-1779239358567-8a8e26f503d1?auto=format&fit=crop&w=1000&q=82" alt="Bright bedroom" loading="lazy"></div>
    <div class="detail-columns"><article class="detail-copy">
      <div class="detail-facts"><div><span>MONTHLY RENT</span><strong>${money(item.rent)}</strong></div><div><span>BEDROOMS</span><strong>${item.bedrooms}</strong></div><div><span>BATHROOMS</span><strong>${item.bathrooms}</strong></div><div><span>AVAILABLE</span><strong>${item.available} ${item.available === 1 ? "room" : "rooms"}</strong></div></div>
      <section class="detail-section"><p class="market-eyebrow">ABOUT THIS PLACE</p><p>${escapeHTML(item.description)}</p></section>
      <section class="detail-section"><p class="market-eyebrow">WHAT’S INCLUDED</p><div class="amenity-list">${item.amenities.map((x) => `<span>${escapeHTML(x)}</span>`).join("")}</div></section>
      <section class="detail-section"><p class="market-eyebrow">HOUSE RULES</p><ul class="rule-list">${item.rules.map((x) => `<li>${escapeHTML(x)}</li>`).join("")}</ul></section>
       <section class="detail-section reputation"><div><p class="market-eyebrow">PROPERTY RATING</p><strong>★ ${scores.property.toFixed(1)}</strong><span>${scores.count} ${scores.count === 1 ? "review" : "reviews"}${isSampleListing(item) ? " · sample" : ""}</span></div><div><p class="market-eyebrow">LANDLORD REPUTATION</p><strong>★ ${scores.owner.toFixed(1)} · ${ownerProfile?.verified ? (isSampleListing(item) ? "Demo status: verified" : "Verified landlord") : (isSampleListing(item) ? "Demo status: not verified" : "Not verified")}</strong><span>${escapeHTML(item.owner)} · ${isSampleListing(item) ? "Sample profile; no identity check" : "Owner profile"}</span></div></section>
    </article><aside class="apply-panel"><p class="market-eyebrow">MAKE IT YOUR NEXT ADDRESS</p><h2>Interested?</h2><p>Contact ${escapeHTML(item.owner)} about this property.</p><button class="market-button market-button-dark apply-button" type="button" data-platform-action="apply" data-id="${item.id}">Apply for this place <span>↗</span></button><form id="rental-application-form" class="rental-application-form" data-listing-id="${escapeHTML(item.id)}" hidden><label>Preferred move-in date<input name="moveInDate" type="date" required></label><label>Number of occupants<select name="occupants" required><option value="1">1 person</option><option value="2">2 people</option><option value="3">3 people</option><option value="4">4 people</option><option value="5">5 or more</option></select></label><label>Phone number<input name="phone" type="tel" required placeholder="09xx xxx xxxx"></label><label>Note to the property owner<textarea name="message" maxlength="500" placeholder="A short introduction (optional)"></textarea></label><button class="market-button market-button-dark apply-button" type="submit">Send application <span>↗</span></button><small>The owner will review your application details.</small></form><button class="market-button market-button-light apply-button" type="button" data-platform-action="message" data-id="${item.id}">Message owner <span>↗</span></button><button class="text-button report-listing" type="button" data-platform-action="report" data-id="${item.id}">Report this listing</button><small>Confirm current availability with the owner before visiting.</small></aside></div>
    <p class="photo-note"></p>`;
}

function initRegister() {
  const form = document.getElementById("register-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const error = document.getElementById("register-error");
    if (data.password !== data.confirmPassword) { error.textContent = "Those passwords do not match."; error.hidden = false; return; }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.classList.add("is-loading");
    error.hidden = true;
    try {
      const result = await api.registerAccount({
        name: data.name.trim(), email: data.email.trim(), password: data.password,
        phone: data.phone.trim(), address: "", city: "", province: ""
      });
      const account = result.user;
      const user = { id: account.id, username: account.username, name: account.name, email: account.email, phone: data.phone.trim(), address: "", city: "", province: "", role: "renter", capabilities: ["renter"], status: "Active" };
      const market = platformStore();
      market.users = market.users.filter((item) => item.id !== user.id && item.email?.toLowerCase() !== user.email.toLowerCase());
      market.users.push(user);
      market.session = { id: user.id, name: user.name, email: user.email, role: user.role };
      auth._createSession({ ...account, role: "tenant" });
      saveStore();
      try {
        await flushDatabaseSave();
      } catch (saveError) {
        console.warn("The account was created, but the rest of the marketplace state could not be synchronized.", saveError);
      }
      location.href = "portal.html?role=renter&view=overview";
    } catch (requestError) {
      error.textContent = requestError.message || "Could not create your account. Check that Apache and MySQL are running.";
      error.hidden = false;
      submit.disabled = false;
      submit.classList.remove("is-loading");
    }
  });
}

const portalViews = {
  renter: [["overview", "Overview"], ["applications", "Applications"], ["saved", "Saved places"], ["messages", "Messages"], ["maintenance", "Maintenance"], ["payments", "Payments"], ["reviews", "Reviews"], ["notifications", "Notifications"], ["landlord-application", "Become a landlord"], ["profile", "Profile"]],
  landlord: [["overview", "Overview"], ["properties", "Properties"], ["units", "Units"], ["applications", "Applications"], ["tenants", "Tenants"], ["messages", "Messages"], ["maintenance", "Maintenance"], ["payments", "Payment intents"], ["notifications", "Notifications"], ["profile", "Profile"]],
  admin: [["overview", "Overview"], ["properties", "Properties"], ["users", "User accounts"], ["landlord-applications", "Landlord applications"], ["reports", "Reports"], ["reviews", "Reviews"], ["notifications", "Notifications"]]
};

function renderPortal() {
  // Check auth first if available
  if (typeof auth !== 'undefined' && auth.requireAuth) {
    if (!auth.requireAuth()) return;
  }
  
  const params = new URLSearchParams(location.search);
  
  // Use the signed-in account role; URL parameters select the current view only.
  let sessionRole = null;
  if (typeof auth !== 'undefined' && auth.isLoggedIn()) {
    sessionRole = auth.getRole();
    // Normalize renter to match platform.js terminology
    if (sessionRole === 'tenant') sessionRole = 'renter'; 
  }
  
  const roleParam = params.get("role");
  // Fall back to the route only when the authentication module is unavailable.
  const allowedRoles = ["renter", "landlord", "admin"];
  const role = sessionRole || (allowedRoles.includes(roleParam) ? roleParam : "renter");

  const view = params.get("view") || "overview";
  const market = platformStore();
  
  // Use auth user data if available
  let sessionUser = market.users.find((item) => item.id === market.session?.id);
  if (typeof auth !== 'undefined' && auth.isLoggedIn()) {
    const s = auth.getSession();
    const marketplaceId = marketplaceAccountId(s);
    const profile = market.users.find((item) => item.id === marketplaceId);
    sessionUser = { ...profile, id: marketplaceId, name: s.name, email: s.email, role: s.role };
  }
  
  const approvedOwner = sessionUser?.capabilities?.includes("landlord") ? sessionUser : null;
  const user = role === "renter" ? (sessionUser || market.session) : role === "landlord" ? (sessionUser || approvedOwner || market.users.find((x) => x.id === "owner-demo")) : { ...sessionUser, name: sessionUser?.name || "Platform administrator", role: "admin" };
  const nav = portalViews[role];
  const app = document.getElementById("portal-app");
  const operationsLink = role === "landlord" ? `<a class="portal-old-workspace" href="portal.html?role=landlord&view=properties">Property dashboards ↗</a>` : "";
  app.innerHTML = `<header class="portal-top"><a class="market-wordmark" href="index.html"><span class="market-mark">R</span><span>room<span class="wordmark-light">/</span>live</span></a><div class="portal-top-right"><a href="properties.html">Browse homes <span>↗</span></a><div class="portal-user"><span class="portal-avatar">${escapeHTML(initials(user?.name || "Account"))}</span><span>${escapeHTML(user?.name || "User")}<small>${role === "admin" ? "Platform administrator" : role === "landlord" ? "Property owner" : "Renter"}</small></span></div><a class="portal-exit" href="javascript:void(0)" onclick="if(typeof auth !== 'undefined') auth.logout(); else location.href='login.html'">Exit</a></div></header><div class="portal-layout"><aside class="portal-sidebar"><p class="market-eyebrow">${role === "admin" ? "MODERATION" : role === "landlord" ? "OWNER SPACE" : "YOUR RENTAL"}</p><nav aria-label="Account navigation">${nav.map(([key, title]) => `<a href="portal.html?view=${key}" ${view === key ? 'aria-current="page"' : ""}>${escapeHTML(title)}</a>`).join("")}</nav>${operationsLink}</aside><main class="portal-main"><div class="portal-main-top"><p class="market-eyebrow">${role === "admin" ? "PLATFORM CONTROL" : role === "landlord" ? "PROPERTY MANAGEMENT" : "RENTER ACCOUNT"}</p><a href="index.html">Room to Live home ↗</a></div><div id="portal-content"></div></main></div>`;
  renderPortalView(role, view, user);
}

function pageHeader(title, desc, action = "") { return `<div class="portal-heading"><div><h1>${escapeHTML(title)}</h1><p>${escapeHTML(desc)}</p></div>${action}</div>`; }
function metricLine(label, value, detail) { return `<div class="portal-metric"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong><small>${escapeHTML(detail)}</small></div>`; }
function tableMarkup(headers, rows) { return `<div class="portal-table-wrap"><table class="portal-table"><thead><tr>${headers.map((h) => `<th>${escapeHTML(h)}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td class="table-empty" colspan="${headers.length}">Nothing here yet.</td></tr>`}</tbody></table></div>`; }
function portalAction(label, action, id = "", style = "") { return `<button type="button" class="portal-action ${style}" data-platform-action="${action}" ${id ? `data-id="${escapeHTML(id)}"` : ""}>${escapeHTML(label)}</button>`; }
function statusPill(status) { return `<span class="portal-status portal-status-${String(status).toLowerCase().replace(/[^a-z]+/g, "-")}">${escapeHTML(status)}</span>`; }

function buildNotifications(role, user, market, owned) {
  if (role === "renter") {
    const id = user?.id;
    return [
      ...market.applications.filter((item) => item.renterId === id && item.status !== "Pending").map((item) => ({ title: `Application ${item.status.toLowerCase()}`, body: `${listingById(item.listingId)?.name || "A property"} · your request status was updated.`, date: item.updatedAt || item.date })),
      ...market.messages.filter((item) => item.to === id).map((item) => ({ title: `Message from ${item.fromName}`, body: item.body, date: item.date })),
      ...market.maintenance.filter((item) => item.renterId === id && item.status !== "Submitted").map((item) => ({ title: "Maintenance update", body: `${item.title} · ${item.status}`, date: item.date }))
    ];
  }
  if (role === "landlord") {
    return [
      ...market.applications.filter((item) => owned.some((listing) => listing.id === item.listingId)).map((item) => ({ title: `Rental application · ${item.status}`, body: `${item.renterName} is interested in ${listingById(item.listingId)?.name || "your property"}.`, date: item.date })),
      ...market.messages.filter((item) => item.ownerId === user?.id || item.to === user?.id).map((item) => ({ title: `Message · ${item.subject || "Rental inquiry"}`, body: `${item.fromName}: ${item.body}`, date: item.date })),
      ...market.maintenance.filter((item) => item.ownerId === user?.id).map((item) => ({ title: `Maintenance · ${item.status}`, body: item.title, date: item.date })),
      ...market.paymentIntents.filter((item) => owned.some((listing) => listing.id === item.listingId)).map((item) => ({ title: "Payment intent created", body: `${listingById(item.listingId)?.name || "Property"} · ${money(item.amount)} · no money moved.`, date: item.date }))
    ];
  }
  return [
    ...market.landlordApplications.filter((item) => item.status === "Submitted").map((item) => ({ title: "Landlord application", body: `${item.name} · ${item.propertyAddress}`, date: item.date })),
    ...market.reports.filter((item) => item.status === "Open").map((item) => ({ title: "Open listing report", body: `${listingById(item.listingId)?.name || "Listing"} · ${item.reason}`, date: item.date })),
    ...market.listings.filter((item) => !item.verified).map((item) => ({ title: "Property review pending", body: `${item.name} · ${item.owner}`, date: item.addedAt }))
  ];
}

function renderPortalView(role, view, user) {
  const market = platformStore();
  const root = document.getElementById("portal-content");
  const title = view === "overview" ? (role === "admin" ? "Platform overview" : role === "landlord" ? "Your properties, at a glance" : "Welcome to your rental space") : (portalViews[role].find(([key]) => key === view)?.[1] || "Overview");
  let subtitle = role === "renter" ? "Keep your rental search and home life in one place." : role === "landlord" ? "Manage your listings and rental activity." : "Review platform submissions and reports.";
  if (role === "landlord" && view === "units") subtitle = "Units across all your properties. Open a property dashboard for that property's tenant, rent, and utility records.";
  let content = pageHeader(title, subtitle);
  const owned = market.listings.filter((x) => x.ownerId === (role === "landlord" ? (market.users.some((item) => item.id === user?.id && item.capabilities?.includes("landlord")) ? user.id : "owner-demo") : "owner-demo"));
  const renterApps = market.applications.filter((x) => x.renterId === market.session?.id);
  const notifications = buildNotifications(role, user, market, owned);
  if (view === "overview" && role === "renter") {
    content += `<div class="portal-metrics">${metricLine("Applications", String(renterApps.length), "Across your account")}${metricLine("Saved places", String(market.saved.length), "Places to revisit")}${metricLine("Messages", String(market.messages.filter((x) => x.to === market.session?.id || x.from === market.session?.id).length), "Recent activity")}</div><section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">YOUR SEARCH</p><h2>Places you might like</h2></div><a href="properties.html">Explore all ↗</a></div><div class="portal-listing-strip">${market.listings.slice(0, 2).map((x) => listingCard(x, true)).join("")}</div></section><section class="portal-callout"><div><p class="market-eyebrow">GETTING STARTED</p><strong>Start with a place that catches your eye.</strong><span>Your inquiries and saved places are easy to find here.</span></div><a href="properties.html" class="market-button market-button-dark">Browse homes <span>↗</span></a></section>`;
  } else if (view === "overview" && role === "landlord") {
    const applications = market.applications.filter((x) => owned.some((p) => p.id === x.listingId));
    content += `<div class="portal-metrics">${metricLine("Active listings", String(owned.length), "Published listings")}${metricLine("New inquiries", String(applications.filter((x) => x.status === "Pending").length), "Awaiting review")}${metricLine("Payment intents", String(market.paymentIntents.filter((x) => owned.some((p) => p.id === x.listingId)).length), "Awaiting processing")}</div><section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">YOUR PLACES</p><h2>Property listings</h2></div><a href="portal.html?role=landlord&view=properties">Manage listings ↗</a></div><div class="portal-listing-strip">${owned.map(ownerListingCard).join("") || `<div class="portal-empty"><h2>No listings yet</h2><p>Add your first property to start managing its units and rental activity.</p></div>`}</div></section><section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">RECENT INTEREST</p><h2>Latest applications</h2></div><a href="portal.html?role=landlord&view=applications">All applications ↗</a></div>${renderApplicationsTable(applications, true)}</section>`;
  } else if (view === "overview" && role === "admin") {
    content += `<div class="portal-metrics">${metricLine("Listings", String(market.listings.length), "Property listings")}${metricLine("Pending verification", String(market.users.filter((x) => x.role === "landlord" && !x.verified).length), "Owner accounts")}${metricLine("Open reports", String(market.reports.filter((x) => x.status === "Open").length), "Submitted")}</div><section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">REQUIRES ATTENTION</p><h2>Owner verification</h2></div><a href="portal.html?role=admin&view=users">Review accounts ↗</a></div>${renderAdminUsers(market.users.filter((x) => x.role === "landlord"))}</section>`;
  } else if (view === "applications") {
    const items = role === "renter" ? renterApps : market.applications.filter((x) => role === "admin" || owned.some((p) => p.id === x.listingId));
    content += `<section class="portal-section">${renderApplicationsTable(items, role !== "renter")}</section>`;
  } else if (view === "saved" && role === "renter") {
    const savedItems = market.listings.filter((x) => market.saved.includes(x.id));
    content += `<section class="portal-section"><div class="portal-listing-strip">${savedItems.map((x) => listingCard(x, true)).join("") || `<div class="portal-empty"><h2>No saved places yet</h2><p>Save listings to keep them close.</p><a href="properties.html">Explore places ↗</a></div>`}</div></section>`;
  } else if (view === "reviews" && role === "renter") {
    const stays = market.leases.filter((x) => x.renterId === market.session?.id && x.status === "Completed");
    const eligible = stays.filter((stay) => !market.reviews.some((review) => review.leaseId === stay.id));
    const myReviews = market.reviews.filter((review) => review.renterId === market.session?.id);
    content += `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">VERIFIED STAYS ONLY</p><h2>Your reviews</h2></div></div>${eligible.length ? eligible.map((stay) => `<form class="review-form" data-lease-id="${escapeHTML(stay.id)}"><h3>${escapeHTML(listingById(stay.listingId)?.name || "Completed rental")}</h3><p>Property and landlord ratings are calculated separately. Your review will be marked as a verified stay.</p><div class="review-controls"><label>Property rating<select name="propertyRating" required><option value="">Select rating</option><option value="5">5 · Excellent</option><option value="4">4 · Good</option><option value="3">3 · Okay</option><option value="2">2 · Poor</option><option value="1">1 · Very poor</option></select></label><label>Landlord rating<select name="ownerRating" required><option value="">Select rating</option><option value="5">5 · Excellent</option><option value="4">4 · Good</option><option value="3">3 · Okay</option><option value="2">2 · Poor</option><option value="1">1 · Very poor</option></select></label></div><label>Written review<textarea name="body" maxlength="700" required placeholder="Share a helpful, honest account of your stay"></textarea></label><button class="portal-action" type="submit">Submit verified-stay review</button></form>`).join("") : `<div class="portal-empty"><h2>No review is available yet</h2><p>Reviews unlock after a landlord marks a stay complete. You can review a property after a completed stay.</p></div>`}${myReviews.length ? `<div class="message-list">${myReviews.map((review) => `<article><div><strong>${escapeHTML(listingById(review.listingId)?.name || "Property review")}</strong><small>${statusPill(review.status)} · Verified stay</small></div><p>Property ★ ${review.propertyRating} · Landlord ★ ${review.ownerRating}</p><p>${escapeHTML(review.body)}</p></article>`).join("")}</div>` : ""}</section>`;
  } else if (view === "properties" && role === "landlord") {
    content += `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">LISTINGS</p><h2>Your properties</h2></div>${portalAction("Add listing", "add-listing")}</div><div class="portal-listing-strip">${owned.map(ownerListingCard).join("") || `<div class="portal-empty"><h2>No listings yet</h2><p>Add a property to create its operations dashboard.</p></div>`}</div></section><form class="portal-inline-form" id="new-listing-form" hidden><h3>Add a property</h3><div class="inline-form-grid"><label>Name<input name="name" required></label><label>Property type<select name="type"><option>Apartment</option><option>Boarding house</option><option>Studio</option></select></label><label>Monthly rent (₱)<input name="rent" type="number" min="1000" required></label><label>Address<input name="address" required></label><label>Bedrooms<input name="bedrooms" type="number" min="0" value="1"></label></div><button class="portal-action" type="submit">Save property</button></form>`;
  } else if (view === "tenants" && role === "landlord") {
    const activeLeases = market.leases.filter((x) => owned.some((p) => p.id === x.listingId));
    content += `<section class="portal-section">${tableMarkup(["Renter", "Property", "Monthly rent", "Status", "Stay"], activeLeases.map((x) => `<tr><td>${escapeHTML(x.renterName)}</td><td>${escapeHTML(listingById(x.listingId)?.name || "-")}</td><td>${money(x.rent)}</td><td>${statusPill(x.status)}</td><td>${x.status === "Active" ? portalAction("Mark stay complete", "complete-stay", x.id) : "—"}</td></tr>`).join(""))}</section><p class="legal-note">Application approvals create local lease records. When a unit is available, the matching tenant and pending rent entry also appear in the property operations dashboard. Completing a stay unlocks a verified-stay review.</p>`;
  } else if (view === "units" && role === "landlord") {
    const units = market.units.filter((unit) => owned.some((listing) => listing.id === unit.listingId));
    content += `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">UNIT INVENTORY</p><h2>Rooms and availability</h2></div>${portalAction("Add unit", "add-unit")}</div>${tableMarkup(["Unit", "Property", "Monthly rent", "Capacity", "Status", "Action"], units.map((unit) => `<tr><td>${escapeHTML(unit.number)}</td><td>${escapeHTML(listingById(unit.listingId)?.name || "-")}</td><td>${money(unit.monthlyRent)}</td><td>${unit.capacity}</td><td>${statusPill(unit.status)}</td><td>${portalAction(unit.status === "Available" ? "Mark maintenance" : "Mark available", "toggle-unit", unit.id)}</td></tr>`).join(""))}</section><p class="legal-note">Confirm unit availability and lease terms before approving an application.</p>`;
  } else if (view === "messages") {
    const relevant = market.messages.filter((x) => role === "admin" || x.from === (user?.id || "") || x.to === (user?.id || "") || (role === "landlord" && x.ownerId === "owner-demo"));
    const ownersListings = market.listings.filter((listing) => listing.ownerId === user?.id);
    const applicantIds = new Set(market.applications.filter((item) => ownersListings.some((listing) => listing.id === item.listingId)).map((item) => item.renterId));
    relevant.forEach((item) => applicantIds.add(item.from === user?.id ? item.to : item.from));
    const contacts = market.users.filter((item) => applicantIds.has(item.id) && item.id !== user?.id);
    const messageListings = role === "renter" ? market.listings : ownersListings;
    const canReply = role !== "landlord" || contacts.length > 0;
    content += `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">INBOX</p><h2>Messages</h2></div></div>${renderMessages(relevant, role)}${role !== "admin" ? `<form id="message-form" class="message-form"><label>${role === "renter" ? "Message a property owner" : "Reply to a renter"}<textarea name="body" required maxlength="700" placeholder="${role === "renter" ? "Ask a question about a listing..." : "Write a response..."}"></textarea></label><label>Listing<select name="listingId" required>${messageListings.map((x) => `<option value="${x.id}">${escapeHTML(x.name)}</option>`).join("")}</select></label>${role === "landlord" ? `<label>Renter<select name="toUser" required>${contacts.map((x) => `<option value="${x.id}">${escapeHTML(x.name)}</option>`).join("")}</select></label>${canReply ? "" : '<p class="legal-note">A renter must contact you or apply before you can reply.</p>'}` : ""}<button class="portal-action" type="submit"${canReply && messageListings.length ? "" : " disabled"}>Send message</button></form>` : ""}</section>`;
  } else if (view === "maintenance") {
    const issues = market.maintenance.filter((x) => role === "admin" || (role === "renter" ? x.renterId === market.session?.id : x.ownerId === "owner-demo"));
    content += `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">SERVICE REQUESTS</p><h2>Maintenance</h2></div></div>${tableMarkup(["Request", "Property", "Submitted", "Status", ...(role === "landlord" ? ["Update"] : [])], issues.map((x) => `<tr><td>${escapeHTML(x.title)}</td><td>${escapeHTML(listingById(x.listingId)?.name || "-")}</td><td>${escapeHTML(x.date)}</td><td>${statusPill(x.status)}</td>${role === "landlord" ? `<td>${x.status !== "Resolved" ? portalAction(x.status === "Submitted" ? "Acknowledge" : x.status === "Acknowledged" ? "Start work" : "Mark resolved", "advance-maintenance", x.id) : "—"}</td>` : ""}</tr>`).join(""))}${role === "renter" ? `<form class="message-form" id="maintenance-form"><label>What needs attention?<input name="title" required maxlength="100" placeholder="e.g. Kitchen tap is leaking"></label><label>Listing<select name="listingId">${market.listings.map((x) => `<option value="${x.id}">${escapeHTML(x.name)}</option>`).join("")}</select></label><button class="portal-action" type="submit">Submit request</button></form>` : ""}</section>`;
  } else if (view === "payments") {
    const payments = market.paymentIntents.filter((x) => role === "admin" || (role === "renter" ? x.renterId === market.session?.id : owned.some((p) => p.id === x.listingId)));
    content += `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">${role === "renter" ? "RENTAL PAYMENT" : "RENTER ACTIVITY"}</p><h2>${role === "renter" ? "Payment intents" : "Payment intents received"}</h2></div>${role === "renter" ? portalAction("Create payment request", "create-payment") : ""}</div>${tableMarkup(["Property", "Amount", "Date", "Status"], payments.map((x) => `<tr><td>${escapeHTML(listingById(x.listingId)?.name || "-")}</td><td>${money(x.amount)}</td><td>${escapeHTML(x.date)}</td><td>${statusPill(x.status)}</td></tr>`).join(""))}</section><p class="legal-note">Payment intents are local records only. No payment provider, money transfer, or receipt verification is connected.</p>`;
  } else if (view === "profile") {
    content += `<section class="portal-section"><form class="profile-form" id="profile-form"><label>Full name<input name="name" value="${escapeHTML(user?.name || "")}" required></label><label>Email<input name="email" type="email" value="${escapeHTML(user?.email || "")}" required></label><label>Phone<input name="phone" type="tel" value="${escapeHTML(user?.phone || "")}" placeholder="09xx xxx xxxx"></label><label>Home address<input name="address" value="${escapeHTML(user?.address || "")}"></label><label>City / municipality<input name="city" value="${escapeHTML(user?.city || "")}"></label><label>Province<input name="province" value="${escapeHTML(user?.province || "")}"></label><button class="portal-action" type="submit">Save profile</button></form></section>`;
  } else if (view === "landlord-application" && role === "renter") {
    const application = market.landlordApplications.find((x) => x.userId === market.session?.id);
    content += application ? `<section class="portal-section"><p class="market-eyebrow">APPLICATION STATUS</p><h2>${statusPill(application.status)}</h2><p>${escapeHTML(application.propertyAddress)} · ${escapeHTML(application.propertyType)}</p><p class="legal-note">Your renter account stays the same. Approval adds landlord capabilities but does not verify your identity automatically.</p></section>` : `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">KEEP THE SAME ACCOUNT</p><h2>Apply to list a property</h2></div></div><p class="legal-note">Share your property details so the moderation team can review your application.</p><form id="landlord-application-form" class="inline-form-grid landlord-application-form"><label>Full name<input name="name" value="${escapeHTML(user?.name || "")}" required></label><label>Email<input name="email" type="email" value="${escapeHTML(user?.email || "")}" required></label><label>Phone<input name="phone" type="tel" required placeholder="09xx xxx xxxx"></label><label>Home address<input name="address" required></label><label>Property address<input name="propertyAddress" required></label><label>Property type<select name="propertyType"><option>Apartment</option><option>Boarding house</option><option>Dormitory</option><option>House</option><option>Condo</option><option>Room for rent</option><option>Bedspace</option><option>Other</option></select></label><label>Ownership / authorization<select name="authorization"><option>Owner</option><option>Authorized property manager</option></select></label><label>Supporting document filename (optional)<input name="documentName" type="text" placeholder="Optional"></label><label class="application-wide">Additional information<textarea name="notes" maxlength="600" placeholder="Anything else moderators should know?"></textarea></label><button class="portal-action application-wide" type="submit">Submit application</button></form></section>`;
  } else if (view === "landlord-applications" && role === "admin") {
    content += `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">MODERATOR REVIEW</p><h2>Landlord applications</h2></div></div>${tableMarkup(["Applicant", "Property", "Type", "Status", "Review"], market.landlordApplications.map((x) => `<tr><td>${escapeHTML(x.name)}<br><small>${escapeHTML(x.email)}</small></td><td>${escapeHTML(x.propertyAddress)}</td><td>${escapeHTML(x.propertyType)}</td><td>${statusPill(x.status)}</td><td>${x.status === "Submitted" || x.status === "Under review" ? `${portalAction("Approve application", "approve-landlord", x.id)} ${portalAction("Request changes", "request-landlord-changes", x.id, "action-muted")}` : "—"}</td></tr>`).join(""))}</section><p class="legal-note">Sample class-project records only. Approval adds landlord capability to the local renter profile; no identity or property checks are performed.</p>`;
  } else if (view === "users" && role === "admin") {
    content += `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">LANDLORD ACCOUNTS</p><h2>Verification queue</h2></div></div>${renderAdminUsers(market.users.filter((x) => x.role === "landlord"))}</section><p class="legal-note">Review owner details before updating their verification status.</p>`;
  } else if (view === "reports" && role === "admin") {
    content += `<section class="portal-section">${tableMarkup(["Listing", "Reason", "Date", "Status", "Action"], market.reports.map((x) => `<tr><td>${escapeHTML(listingById(x.listingId)?.name || "-")}</td><td>${escapeHTML(x.reason)}</td><td>${escapeHTML(x.date)}</td><td>${statusPill(x.status)}</td><td>${x.status === "Open" ? portalAction("Resolve", "resolve-report", x.id) : "—"}</td></tr>`).join(""))}</section>`;
  } else if (view === "reviews" && role === "admin") {
    content += `<section class="portal-section">${tableMarkup(["Property", "Renter", "Rating", "Review", "Action"], market.reviews.map((x) => `<tr><td>${escapeHTML(listingById(x.listingId)?.name || "-")}</td><td>${escapeHTML(x.renterName)}</td><td>★ ${x.propertyRating} / ★ ${x.ownerRating}</td><td>${escapeHTML(x.body)}</td><td>${portalAction(x.status === "Hidden" ? "Restore" : "Hide", "toggle-review", x.id)}</td></tr>`).join(""))}</section>`;
  } else if (view === "properties" && role === "admin") {
    content += `<section class="portal-section">${tableMarkup(["Listing", "Owner", "Rent", "Property state", "Review"], market.listings.map((x) => `<tr><td>${escapeHTML(x.name)}${isSampleListing(x) ? '<br><small>Class project sample</small>' : ""}</td><td>${escapeHTML(x.owner)}</td><td>${money(x.rent)}</td><td>${statusPill(isSampleListing(x) ? (x.verified ? "Demo: marked verified" : "Demo: not verified") : (x.verified ? "Verified" : "Pending"))}</td><td>${portalAction(x.verified ? "Remove verification" : "Verify property", "verify-listing", x.id)}</td></tr>`).join(""))}</section><p class="legal-note">Verification statuses in this class project are simulated. They do not confirm property ownership, identity, or inspection.</p>`;
  } else if (view === "notifications") {
    content += `<section class="portal-section"><div class="portal-section-heading"><div><p class="market-eyebrow">ACTIVITY</p><h2>Your notifications</h2></div></div>${notifications.length ? `<div class="message-list">${notifications.map((note) => `<article><div><strong>${escapeHTML(note.title)}</strong><small>${escapeHTML(note.date || "Today")}</small></div><p>${escapeHTML(note.body)}</p></article>`).join("")}</div>` : `<div class="portal-empty"><h2>You’re all caught up</h2><p>Applications, messages, and updates will appear here.</p></div>`}</section>`;
  } else {
    content += `<section class="portal-section portal-empty"><h2>This section is ready for your next step</h2><p>Choose another area from the account menu.</p><a href="portal.html?role=${role}&view=overview">Back to overview ↗</a></section>`;
  }
  root.innerHTML = content;
}

function renderApplicationsTable(items, ownerActions = false) {
  if (!items.length) {
    return ownerActions
      ? `<div class="portal-empty"><h2>No rental applications yet</h2><p>Applications will appear here when a renter applies to one of your properties.</p><a href="portal.html?view=properties">Review your listings ↗</a></div>`
      : `<div class="portal-empty"><h2>No rental applications yet</h2><p>When you apply for a place, its status will appear here.</p><a href="properties.html">Explore available homes ↗</a></div>`;
  }
  return tableMarkup(["Renter", "Property", "Move-in", "Occupants", "Requested", "Status", ...(ownerActions ? ["Review"] : [])], items.map((x) => `<tr><td>${escapeHTML(x.renterName || "You")}${x.phone ? `<br><small>${escapeHTML(x.phone)}</small>` : ""}</td><td>${escapeHTML(listingById(x.listingId)?.name || "-")}${x.message ? `<br><small>${escapeHTML(x.message)}</small>` : ""}</td><td>${escapeHTML(x.moveInDate || "-")}</td><td>${x.occupants || "-"}</td><td>${escapeHTML(x.date)}</td><td>${statusPill(x.status)}</td>${ownerActions ? `<td>${x.status === "Pending" ? `${portalAction("Approve", "approve-application", x.id)} ${portalAction("Decline", "decline-application", x.id, "action-muted")}` : "—"}</td>` : ""}</tr>`).join(""));
}
function renderAdminUsers(users) { return tableMarkup(["Owner", "Email", "Verification", "Action"], users.map((x) => `<tr><td>${escapeHTML(x.name)}</td><td>${escapeHTML(x.email)}</td><td>${statusPill(x.verified ? "Verified" : "Pending")}</td><td>${x.verified ? "—" : portalAction("Mark verified", "verify-owner", x.id)}</td></tr>`).join("")); }
function renderMessages(items, role) { return items.length ? `<div class="message-list">${items.slice().reverse().map((x) => `<article><div><strong>${escapeHTML(x.subject || listingById(x.listingId)?.name || "Message")}</strong><small>${escapeHTML(x.fromName || "User")} · ${escapeHTML(x.date)}</small></div><p>${escapeHTML(x.body)}</p></article>`).join("")}</div>` : `<div class="portal-empty"><h2>Your inbox is quiet</h2><p>Messages you send about a listing will appear here.</p><a href="properties.html">Explore homes ↗</a></div>`; }

function requirePlatformAccount() {
  if (typeof auth !== "undefined" && auth.isLoggedIn()) return true;
  location.href = "login.html";
  return false;
}

function bindPortalEvents(role) {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-platform-action]");
    if (!button) return;
    const { platformAction: action, id } = button.dataset;
    if (["save", "apply", "message", "report"].includes(action) && !requirePlatformAccount()) return;
    const market = platformStore();
    if (action === "save") {
      market.saved = market.saved.includes(id) ? market.saved.filter((x) => x !== id) : [...market.saved, id];
      saveStore(); renderPropertyDetails();
    } else if (action === "apply") {
      const form = document.getElementById("rental-application-form");
      const active = market.applications.some((item) => item.listingId === id && item.renterId === market.session?.id && ["Pending", "Approved"].includes(item.status));
      if (active) platformToast("You already have an active application for this place.", "info");
      else if (form) { form.hidden = false; form.querySelector("input")?.focus(); }
    }
    else if (action === "message") createListingMessage(id);
    else if (action === "report") createReport(id);
    else if (action === "create-payment") {
      const renterId = sessionUser?.id || market.session?.id || "renter-demo";
      const existingLease = market.leases.find((lease) => lease.renterId === renterId && lease.status === "Active");
      const item = listingById(existingLease?.listingId || market.listings[0]?.id);
      if (item) {
        market.paymentIntents.unshift({ id: `intent-${Date.now()}`, listingId: item.id, renterId, amount: existingLease?.rent || item.rent, date: new Date().toLocaleDateString("en-PH"), status: "Intent only" });
        saveStore(); renderPortal(); platformToast("Payment request created.", "success");
      }
    }
    else if (action === "add-listing") document.getElementById("new-listing-form").hidden = false;
    else if (action === "approve-application" || action === "decline-application") {
      const app = market.applications.find((x) => x.id === id);
      if (app) {
        app.status = action === "approve-application" ? "Approved" : "Declined";
        if (action === "approve-application" && !market.leases.some((x) => x.applicationId === app.id)) {
          const lease = { id: `lease-${Date.now()}`, applicationId: app.id, listingId: app.listingId, renterId: app.renterId, renterName: app.renterName, rent: listingById(app.listingId)?.rent || 0, status: "Active" };
          lease.tenantRecordId = createLegacyTenantForLease(lease, app);
          market.leases.push(lease);
        }
        saveStore(); renderPortal(); platformToast(`Application ${app.status.toLowerCase()}.`, "success");
      }
    } else if (action === "verify-owner") {
      const owner = market.users.find((x) => x.id === id);
      if (owner) { owner.verified = true; owner.status = "Active"; market.listings.filter((x) => x.ownerId === id).forEach((x) => { x.verified = true; }); saveStore(); renderPortal(); }
    } else if (action === "approve-landlord" || action === "request-landlord-changes") {
      const application = market.landlordApplications.find((x) => x.id === id);
      if (application) {
        application.status = action === "approve-landlord" ? "Approved" : "Additional information required";
        if (action === "approve-landlord") {
          const account = market.users.find((x) => x.id === application.userId);
        if (account) { account.role = "landlord"; account.capabilities = [...new Set([...(account.capabilities || ["renter"]), "landlord"])]; account.status = "Active"; }
        }
        saveStore(); renderPortal();
      }
    } else if (action === "verify-listing") {
      const listing = market.listings.find((x) => x.id === id);
      if (listing) { listing.verified = !listing.verified; saveStore(); renderPortal(); }
    } else if (action === "complete-stay") {
      const lease = market.leases.find((x) => x.id === id);
      if (lease) { lease.status = "Completed"; saveStore(); renderPortal(); }
    } else if (action === "advance-maintenance") {
      const issue = market.maintenance.find((x) => x.id === id);
      if (issue) { issue.status = ({ Submitted: "Acknowledged", Acknowledged: "In progress", "In progress": "Resolved" })[issue.status] || "Acknowledged"; saveStore(); renderPortal(); }
    } else if (action === "toggle-unit") {
      const unit = market.units.find((x) => x.id === id);
      if (unit) { unit.status = unit.status === "Available" ? "Maintenance" : "Available"; saveStore(); renderPortal(); }
    } else if (action === "add-unit") {
      const owned = market.listings.filter((listing) => listing.ownerId === (market.users.find((item) => item.id === market.session?.id && item.capabilities?.includes("landlord"))?.id || "owner-demo"));
      const listing = owned[0];
      if (listing) {
        const count = market.units.filter((unit) => unit.listingId === listing.id).length + 1;
        market.units.push({ id: `${listing.id}-U${Date.now()}`, listingId: listing.id, number: String(count).padStart(2, "0"), monthlyRent: listing.rent, capacity: 1, status: "Available" });
        listing.available = Number(listing.available || 0) + 1;
        saveStore(); renderPortal(); platformToast("Unit added to the property.", "success");
      }
    } else if (action === "resolve-report") { const report = market.reports.find((x) => x.id === id); if (report) report.status = "Resolved"; saveStore(); renderPortal(); }
    else if (action === "toggle-review") { const review = market.reviews.find((x) => x.id === id); if (review) review.status = review.status === "Hidden" ? "Visible" : "Hidden"; saveStore(); renderPortal(); }
  });
  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (form.id === "new-listing-form") {
      event.preventDefault(); const data = Object.fromEntries(new FormData(form));
      const market = platformStore();
      const currentOwner = market.users.find((item) => item.id === market.session?.id && item.capabilities?.includes("landlord")) || market.users.find((item) => item.id === "owner-demo");
      const listing = { id: `home-${Date.now()}`, name: data.name.trim(), type: data.type, rent: Number(data.rent), address: data.address.trim(), city: data.address.split(",").slice(-1)[0].trim(), region: "NCR", province: "Metro Manila", barangay: "", bedrooms: Number(data.bedrooms) || 0, bathrooms: 1, occupants: Number(data.bedrooms) || 1, furnished: false, pets: false, verified: false, rating: 0, reviewCount: 0, ownerRating: 0, ownerReviewCount: 0, image: "photo-1765185237761-9f42d0764304", imageAlt: "Illustrative sunlit rental interior", ownerId: currentOwner?.id || "owner-demo", owner: currentOwner?.name || "Maya Santos", available: 1, addedAt: new Date().toISOString().slice(0, 10), description: "A new property listing.", amenities: ["Details provided by owner"], rules: ["Please contact the owner for current terms."] };
      market.units.push({ id: `${listing.id}-U1`, listingId: listing.id, number: "101", monthlyRent: listing.rent, capacity: listing.occupants, status: "Available" });
      platformStore().listings.unshift(listing); saveStore(); renderPortal(); platformToast("Property listing published.", "success");
    } else if (form.id === "rental-application-form") {
      event.preventDefault();
      if (!requirePlatformAccount()) return;
      const data = Object.fromEntries(new FormData(form));
      const market = platformStore();
      const listingId = form.dataset.listingId;
      if (market.applications.some((item) => item.listingId === listingId && item.renterId === market.session?.id && ["Pending", "Approved"].includes(item.status))) { platformToast("You already have an active application for this place.", "info"); return; }
      const renter = market.users.find((item) => item.id === market.session?.id);
      market.applications.unshift({ id: `app-${Date.now()}`, listingId, renterId: market.session?.id || "renter-demo", renterName: renter?.name || market.session?.name || "Renter", renterEmail: renter?.email || "", phone: data.phone.trim(), moveInDate: data.moveInDate, occupants: Number(data.occupants), message: data.message.trim(), date: new Date().toLocaleDateString("en-PH"), status: "Pending" });
      saveStore(); form.hidden = true; platformToast("Application submitted.", "success");
    } else if (form.id === "message-form") {
      event.preventDefault(); const data = Object.fromEntries(new FormData(form)); const item = listingById(data.listingId); const market = platformStore();
      if (!item || !data.body.trim() || (market.session?.role === "landlord" && !data.toUser)) { platformToast("Choose a property and renter, then enter a message.", "error"); return; }
      const isOwner = market.users.some((account) => account.id === market.session?.id && account.capabilities?.includes("landlord"));
      const sender = market.users.find((account) => account.id === market.session?.id);
      const recipient = isOwner ? data.toUser : item?.ownerId;
      market.messages.push({ id: `msg-${Date.now()}`, from: market.session?.id || "renter-demo", to: recipient, ownerId: item?.ownerId, fromName: sender?.name || market.session?.name || "User", listingId: item?.id, subject: item?.name, body: data.body.trim(), date: new Date().toLocaleDateString("en-PH") }); saveStore(); renderPortal(); platformToast("Message added to the conversation.", "success");
    } else if (form.id === "maintenance-form") {
      event.preventDefault(); const data = Object.fromEntries(new FormData(form)); const item = listingById(data.listingId); const market = platformStore();
      market.maintenance.unshift({ id: `maintenance-${Date.now()}`, title: data.title.trim(), listingId: data.listingId, renterId: market.session?.id || "renter-demo", ownerId: item?.ownerId, date: new Date().toLocaleDateString("en-PH"), status: "Submitted" }); saveStore(); renderPortal(); platformToast("Request submitted.", "success");
    } else if (form.id === "profile-form") {
      event.preventDefault(); const data = Object.fromEntries(new FormData(form)); const market = platformStore(); const current = market.users.find((x) => x.id === market.session?.id); const submit = form.querySelector('[type="submit"]');
      if (submit) { submit.disabled = true; submit.textContent = "Saving…"; }
      auth.updateProfile(data).then((session) => {
        if (current) Object.assign(current, data);
        Object.assign(market.session, { name: session.name, email: session.email });
        renderPortal(); platformToast("Profile saved to your account.", "success");
      }).catch((error) => {
        if (submit) { submit.disabled = false; submit.textContent = "Save profile"; }
        platformToast(error.message || "Your profile could not be saved.", "error");
      });
    } else if (form.id === "landlord-application-form") {
      event.preventDefault(); const data = Object.fromEntries(new FormData(form)); const market = platformStore();
      const application = { id: `landlord-app-${Date.now()}`, userId: market.session?.id || "renter-demo", ...data, status: "Submitted", date: new Date().toLocaleDateString("en-PH") };
      market.landlordApplications.push(application);
      if (data.documentName.trim()) market.documents.push({ id: `doc-${Date.now()}`, applicationId: application.id, filename: data.documentName.trim(), uploaded: false });
      saveStore(); renderPortal(); platformToast("Application submitted for review.", "success");
    } else if (form.matches(".review-form")) {
      event.preventDefault(); const data = Object.fromEntries(new FormData(form)); const market = platformStore();
      const lease = market.leases.find((item) => item.id === form.dataset.leaseId && item.renterId === market.session?.id && item.status === "Completed");
      if (!lease || market.reviews.some((review) => review.leaseId === lease.id)) { platformToast("A completed eligible stay is required, and each stay can be reviewed once.", "error"); return; }
      market.reviews.push({ id: `review-${Date.now()}`, leaseId: lease.id, renterId: lease.renterId, renterName: lease.renterName, listingId: lease.listingId, propertyRating: Number(data.propertyRating), ownerRating: Number(data.ownerRating), body: data.body.trim(), status: "Visible", verifiedStay: true, date: new Date().toLocaleDateString("en-PH") });
      saveStore(); renderPortal(); platformToast("Review submitted.", "success");
    }
  });
}

function createLegacyTenantForLease(lease, application) {
  const listing = listingById(lease.listingId);
  if (!listing) return "";
  const market = platformStore();
  const scoped = listing.id !== "home-narra";
  const scopedKey = `room-to-live-operations:${listing.id}`;
  let operations = store;
  if (scoped) {
    try {
      operations = JSON.parse(localStorage.getItem(scopedKey)) || buildPropertyStore({ listing, market, owner: market.users.find((item) => item.id === listing.ownerId) });
    } catch (error) {
      operations = buildPropertyStore({ listing, market, owner: market.users.find((item) => item.id === listing.ownerId) });
    }
  }
  const unit = operations.units.find((item) => item.status === "Available" && (!scoped || !market.units.some((platformUnit) => platformUnit.id === item.id) || market.units.find((platformUnit) => platformUnit.id === item.id)?.status === "Available"));
  if (!unit) return "";
  const nameParts = String(lease.renterName || "Renter").trim().split(/\s+/);
  const nextNumber = operations.tenants.reduce((max, item) => Math.max(max, Number(String(item.id).match(/\d+$/)?.[0]) || 0), 0) + 1;
  const id = `TN-${String(nextNumber).padStart(4, "0")}`;
  const renter = market.users.find((item) => item.id === lease.renterId);
  const now = new Date();
  const month = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" }).format(now);
  unit.status = "Occupied";
  operations.tenants.push({ id, firstName: nameParts[0] || "Tenant", lastName: nameParts.slice(1).join(" ") || "Renter", phone: application.phone || renter?.phone || "", email: renter?.email || "", address: [renter?.city, renter?.province].filter(Boolean).join(", "), unitId: unit.id, moveInDate: application.moveInDate || now.toISOString().slice(0, 10), status: "Active", monthlyRent: lease.rent });
  const paymentNumber = operations.payments.reduce((max, item) => Math.max(max, Number(String(item.id).match(/\d+$/)?.[0]) || 0), 0) + 1;
  operations.payments.push({ id: `RP-${now.toISOString().slice(2, 7).replace("-", "")}-${String(paymentNumber).padStart(3, "0")}`, tenantId: id, unitId: unit.id, billingMonth: month, amount: lease.rent, paymentDate: "", paymentMethod: "", reference: "", notes: "Created from an approved rental application", status: "Pending" });
  if (scoped) {
    const platformUnit = market.units.find((item) => item.id === unit.id);
    if (platformUnit) platformUnit.status = "Occupied";
    localStorage.setItem(scopedKey, JSON.stringify(operations));
    if (typeof api !== "undefined") api.saveState(scopedKey, operations).catch((error) => console.warn("MySQL save failed for this property.", error));
  }
  return id;
}

function createListingMessage(listingId) {
  const item = listingById(listingId); const market = platformStore();
  market.messages.push({ id: `msg-${Date.now()}`, from: market.session?.id || "renter-demo", to: item.ownerId, ownerId: item.ownerId, fromName: market.session?.name || "Alex Rivera", listingId, subject: item.name, body: `I’m interested in ${item.name}. Could you share more details?`, date: new Date().toLocaleDateString("en-PH") });
  saveStore(); platformToast("Your inquiry was sent.", "success");
}
function createReport(listingId) {
  const reason = window.prompt("Why are you reporting this property? (e.g. inaccurate details)");
  if (!reason?.trim()) return;
  const market = platformStore(); market.reports.unshift({ id: `report-${Date.now()}`, listingId, reason: reason.trim(), date: new Date().toLocaleDateString("en-PH"), status: "Open" }); saveStore(); platformToast("Report submitted.", "success");
}

document.addEventListener("DOMContentLoaded", async () => {
  syncAuthenticationPage();
  if (typeof appDataReady !== "undefined") await appDataReady;
  const page = document.body.dataset.platform;
  if (page) initPlatform(page);
});
