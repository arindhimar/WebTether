import axios from "axios"

const API_BASE_URL = "http://localhost:5000"

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
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
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
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

  async signup({ name, email, password, isVisitor = false, secret_key, cloudflare_worker_url = null }) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        isVisitor,
        secret_key,
        cloudflare_worker_url
      }),
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

  // Website endpoints
  async getWebsites() {
    return this.request("/websites/website")
  }

  async getAvailableSites() {
    return this.request("/websites/available-sites")
  }

  async createWebsite(url, uid, category) {
    return this.request("/websites/website", {
      method: "POST",
      body: JSON.stringify({ url, uid, category }),
    })
  }

  async deleteWebsite(wid) {
    return this.request(`/websites/website/${wid}`, {
      method: "DELETE",
    })
  }

  // Ping endpoints
  async manualPing(wid, uid, url) {
    return this.request("/pings/manual", {
      method: "POST",
      body: JSON.stringify({ wid, uid, url }),
    })
  }

  async getPings() {
    return this.request("/pings")
  }
}

export const api = new ApiService()

export const pingAPI = {
  getPings: () => api.get("/pings"),
  createPing: (data) => api.post("/pings", data),
  manualPing: (wid, uid, url) => api.post("/pings/manual", { wid, uid, url }),
}

export const websiteAPI = {
  getWebsites: () => api.get("/websites/website"),
  getAvailableSites: () => api.get("/websites/available-sites"),
  createWebsite: (url, uid, category) => api.post("/websites/website", { url, uid, category }),
  updateWebsite: (wid, data) => api.put(`/websites/website/${wid}`, data),
  deleteWebsite: (wid) => api.delete(`/websites/website/${wid}`),
}
