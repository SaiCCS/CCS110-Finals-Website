const auth = {
  SESSION_KEY: 'rtl-session',
  STORE_KEY: 'narra-house-prototype-v3',

  async login(username, password) {
    try {
      const result = await api.loginAccount(username, password);
      return this._createSession(result.user);
    } catch (error) {
      return { success: false, error: error.message || 'Invalid username/email or password.' };
    }
  },

  async updateProfile(profile) {
    const result = await api.authRequest('update-profile', profile);
    const session = { ...(this.getSession() || {}), ...result.user };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return session;
  },
  
  _createSession(user) {
    const session = {
      id: user.id || Date.now().toString(),
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      loginTime: Date.now()
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },
  
  async logout() {
    try {
      if (typeof api !== 'undefined') await api.logoutAccount();
    } catch (error) {
      console.warn('Could not end the server session.', error);
    }
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'index.html';
  },
  
  // Get current session (or null if not logged in)
  getSession() {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      if (sessionStr) {
        return JSON.parse(sessionStr);
      }
    } catch (e) {
      console.error('Error parsing session data:', e);
      this.logout();
    }
    return null;
  },
  
  // Check if user is logged in
  isLoggedIn() {
    return this.getSession() !== null;
  },
  
  // Get current user's role
  getRole() {
    const session = this.getSession();
    return session ? session.role : null;
  },
  
  // Protect a page — redirect to login if not authenticated.
  // Optional requiredRole param to check role (can be string or array of strings)
  requireAuth(requiredRole = null) {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    
    if (requiredRole) {
      const currentRole = this.getRole();
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      if (!roles.includes(currentRole)) {
        alert('Unauthorized access. Redirecting to your dashboard.');
        this.redirectToDashboard();
        return false;
      }
    }
    
    return true;
  },
  
  // Redirect to the correct dashboard based on user role
  redirectToDashboard() {
    const role = this.getRole();
    if (!role) {
      window.location.href = 'login.html';
      return;
    }
    
    switch(role) {
      case 'admin':
        window.location.href = 'portal.html?role=admin&view=overview';
        break;
      case 'landlord':
        window.location.href = 'portal.html?role=landlord&view=overview';
        break;
      case 'tenant':
        window.location.href = 'portal.html?role=renter&view=overview';
        break;
      default:
        window.location.href = 'index.html';
    }
  }
};
