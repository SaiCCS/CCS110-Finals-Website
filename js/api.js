// The browser talks to the PHP API; database credentials stay on the server.
const api = {
  async getState(key) {
    const response = await fetch(`api/state.php?key=${encodeURIComponent(key)}`, {
      credentials: "same-origin",
      headers: { Accept: "application/json" }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load saved data.");
    return result.data;
  },

  async saveState(key, data) {
    const isRenter = typeof auth !== "undefined" && ["tenant", "renter"].includes(auth.getRole());
    const response = await fetch(isRenter ? "api/tenant-state.php" : "api/state.php", {
      credentials: "same-origin",
      method: isRenter ? "POST" : "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(isRenter ? { marketplace: data.marketplace || {} } : { key, data })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save data to MySQL.");
    return result;
  },

  async authRequest(action, data = {}) {
    const response = await fetch("api/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, ...data })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The account request could not be completed.");
    return result;
  },

  async registerAccount(account) {
    return this.authRequest("register", account);
  },

  async loginAccount(username, password) {
    return this.authRequest("login", { username, password });
  },

  async logoutAccount() {
    return this.authRequest("logout");
  }
};
