const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async signup(userData) {
    return this.post('/auth/signup', userData);
  }

  async logout() {
    return this.post('/auth/logout', {});
  }

  // User endpoints
  async getUser(userId) {
    return this.get(`/users/${userId}`);
  }

  async updateUser(userId, data) {
    return this.put(`/users/${userId}`, data);
  }

  // Website endpoints
  async getWebsites() {
    return this.get('/websites/website/');
  }

  async getAvailableSites() {
    return this.get('/websites/available-sites');
  }

  async createWebsite(url, uid, category) {
    return this.post('/websites/website', { url, uid, category });
  }

  async deleteWebsite(wid) {
    return this.delete(`/websites/website/${wid}`);
  }

  // Ping endpoints
  async getPings() {
    return this.get('/pings');
  }

  /**
   * Submit a simulated ping with fake transaction code
   * @param {Object} params - Ping parameters
   * @param {number} params.wid - Website ID
   * @param {string} params.url - Website URL
   * @param {string} params.tx_hash - Fake transaction code (TX-001, TX-002, etc.)
   */
  async manualPing({ wid, url, tx_hash }) {
    return this.post('/pings/manual', {
      wid,
      url,
      tx_hash
    });
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.get('/pings/wallet/balance');
  }

  async getTransactionHistory() {
    return this.get('/pings/wallet/transactions');
  }

  // Network status
  async getNetworkStatus() {
    return this.get('/pings/network/status');
  }
}

export const api = new ApiService();

// Legacy exports for backward compatibility
export const pingAPI = {
  getAllPings: () => api.getPings(),
  createPing: (data) => api.post('/pings/', data),
  manualPing: (params) => api.manualPing(params),
};

export const websiteAPI = {
  getAllWebsites: () => api.getWebsites(),
  getAvailableSites: () => api.getAvailableSites(),
  createWebsite: (url, uid, category) => api.createWebsite(url, uid, category),
  updateWebsite: (wid, data) => api.put(`/websites/${wid}`, data),
  deleteWebsite: (wid) => api.deleteWebsite(wid),
};
