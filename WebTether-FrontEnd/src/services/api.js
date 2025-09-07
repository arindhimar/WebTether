const API_BASE_URL = "http://localhost:5000"

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: "GET", ...options })
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: "POST", body: JSON.stringify(body), ...options })
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { method: "PUT", body: JSON.stringify(body), ...options })
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: "DELETE", ...options })
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      console.log(`API Request: ${config.method} ${url}`, config.body ? JSON.parse(config.body) : "")

      const response = await fetch(url, config)
      const responseData = await response.json()

      console.log(`API Response: ${response.status}`, responseData)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid or expired token")
        }
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`)
      }

      return responseData
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(signupData) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(signupData),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  // User endpoints
  async getUser(userId) {
    return this.request(`/users/${userId}`)
  }

  async updateUser(userId, data) {
    return this.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async getAllUsers() {
    return this.request("/users/")
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: "DELETE",
    })
  }

  // Website endpoints
  async getWebsites() {
    return this.request("/websites/")
  }

  async getWebsite(wid) {
    return this.request(`/websites/${wid}`)
  }

  async getAvailableSites() {
    return this.request("/websites/available-sites")
  }

  async createWebsite(websiteData) {
    return this.request("/websites/", {
      method: "POST",
      body: JSON.stringify(websiteData),
    })
  }

  async updateWebsite(wid, data) {
    return this.request(`/websites/${wid}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteWebsite(wid) {
    return this.request(`/websites/${wid}`, {
      method: "DELETE",
    })
  }

  async getUserWebsites(uid) {
    return this.request(`/websites/user/${uid}`)
  }

  // Ping endpoints
  async getAllPings() {
    return this.request("/pings/")
  }

  async getPing(pid) {
    return this.request(`/pings/${pid}`)
  }

  async createPing(pingData) {
    return this.request("/pings/", {
      method: "POST",
      body: JSON.stringify(pingData),
    })
  }

  async updatePing(pid, data) {
    return this.request(`/pings/${pid}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deletePing(pid) {
    return this.request(`/pings/${pid}`, {
      method: "DELETE",
    })
  }

  async getUserPings(uid) {
    return this.request(`/pings/user/${uid}`)
  }

  /**
   * Manual ping with blockchain transaction
   * @param {Object} params - { wid, url, tx_hash }
   */
  async manualPing(params) {
    return this.request("/pings/manual", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.request("/pings/wallet/balance")
  }

  async getTransactionHistory() {
    return this.request("/pings/wallet/transactions")
  }

  async getNetworkStatus() {
    return this.request("/pings/network/status")
  }

  // Transaction endpoints
  async getAllTransactions(limit, offset) {
    const params = new URLSearchParams()
    if (limit) params.append("limit", limit)
    if (offset) params.append("offset", offset)
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request(`/transactions/${query}`)
  }

  async getTransaction(txHash) {
    return this.request(`/transactions/${txHash}`)
  }

  async getUserTransactions(uid) {
    return this.request(`/transactions/user/${uid}`)
  }

  async createTransaction(transactionData) {
    return this.request("/transactions/", {
      method: "POST",
      body: JSON.stringify(transactionData),
    })
  }

  async updateTransaction(txHash, data) {
    return this.request(`/transactions/${txHash}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteTransaction(txHash) {
    return this.request(`/transactions/${txHash}`, {
      method: "DELETE",
    })
  }
}

export const api = new ApiService()

// Legacy API exports for backward compatibility
export const pingAPI = {
  getAllPings: () => api.getAllPings(),
  createPing: (data) => api.createPing(data),
  manualPing: (params) => api.manualPing(params),
  getPing: (pid) => api.getPing(pid),
  updatePing: (pid, data) => api.updatePing(pid, data),
  deletePing: (pid) => api.deletePing(pid),
  getUserPings: (uid) => api.getUserPings(uid),
}

export const websiteAPI = {
  getAllWebsites: () => api.getWebsites(),
  getWebsite: (wid) => api.getWebsite(wid),
  getAvailableSites: () => api.getAvailableSites(),
  createWebsite: (websiteData) => api.createWebsite(websiteData),
  updateWebsite: (wid, data) => api.updateWebsite(wid, data),
  deleteWebsite: (wid) => api.deleteWebsite(wid),
  getUserWebsites: (uid) => api.getUserWebsites(uid),
}

export const userAPI = {
  getAllUsers: () => api.getAllUsers(),
  getUser: (uid) => api.getUser(uid),
  updateUser: (uid, data) => api.updateUser(uid, data),
  deleteUser: (uid) => api.deleteUser(uid),
}

export const authAPI = {
  login: (email, password) => api.login(email, password),
  signup: (data) => api.signup(data),
  logout: () => api.logout(),
}

export const walletAPI = {
  getBalance: () => api.getWalletBalance(),
  getTransactions: () => api.getTransactionHistory(),
  getNetworkStatus: () => api.getNetworkStatus(),
}

export const transactionAPI = {
  getAllTransactions: (limit, offset) => api.getAllTransactions(limit, offset),
  getTransaction: (txHash) => api.getTransaction(txHash),
  getUserTransactions: (uid) => api.getUserTransactions(uid),
  createTransaction: (data) => api.createTransaction(data),
  updateTransaction: (txHash, data) => api.updateTransaction(txHash, data),
  deleteTransaction: (txHash) => api.deleteTransaction(txHash),
}
