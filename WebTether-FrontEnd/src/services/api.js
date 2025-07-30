const API_BASE_URL = "http://127.0.0.1:5000"

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("web-tether-token")
}

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken()
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    return makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  signup: async (userData) => {
    return makeRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },
}

// Website API
export const websiteAPI = {
  createWebsite: async (url, uid, category = null) => {
    return makeRequest("/websites/website", {
      method: "POST",
      body: JSON.stringify({ url, uid, category, status: "active" }),
    })
  },

  getAllWebsites: async () => {
    return makeRequest("/websites/website")
  },

  getWebsiteById: async (wid) => {
    return makeRequest(`/websites/website/${wid}`)
  },

  updateWebsite: async (wid, data) => {
    return makeRequest(`/websites/website/${wid}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deleteWebsite: async (wid) => {
    return makeRequest(`/websites/website/${wid}`, {
      method: "DELETE",
    })
  },
}

// Ping API
export const pingAPI = {
  createPing: async (wid, is_up, latency_ms = null, region = null, uid = null) => {
    return makeRequest("/pings/ping", {
      method: "POST",
      body: JSON.stringify({ wid, is_up, latency_ms, region, uid }),
    })
  },

  getAllPings: async () => {
    return makeRequest("/pings/ping")
  },

  getPingById: async (pid) => {
    return makeRequest(`/pings/ping/${pid}`)
  },

  updatePing: async (pid, data) => {
    return makeRequest(`/pings/ping/${pid}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deletePing: async (pid) => {
    return makeRequest(`/pings/ping/${pid}`, {
      method: "DELETE",
    })
  },

  // Get available sites for current user to ping (corrected endpoint)
  getAvailableSites: async () => {
    return makeRequest("/websites/available-sites")
  },

  // Manual ping endpoint
  manualPing: async (uid, wid, url) => {
    return makeRequest("/pings/ping/manual", {
      method: "POST",
      body: JSON.stringify({ uid, wid, url }),
    })
  },
}

// User API
export const userAPI = {
  createUser: async (
    name,
    isVisitor = false,
    secret_key = null,
    replit_agent_url = null,
    replit_agent_token = null,
  ) => {
    return makeRequest("/users/users", {
      method: "POST",
      body: JSON.stringify({
        name,
        isVisitor,
        secret_key,
        replit_agent_url,
        replit_agent_token,
      }),
    })
  },

  getAllUsers: async () => {
    return makeRequest("/users/users")
  },

  getUserById: async (userId) => {
    return makeRequest(`/users/users/${userId}`)
  },

  updateUser: async (userId, data) => {
    return makeRequest(`/users/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deleteUser: async (userId) => {
    return makeRequest(`/users/users/${userId}`, {
      method: "DELETE",
    })
  },
}

// Report API
export const reportAPI = {
  createReport: async (pid, reason, uid = null) => {
    return makeRequest("/reports/report", {
      method: "POST",
      body: JSON.stringify({ pid, reason, uid }),
    })
  },

  getAllReports: async () => {
    return makeRequest("/reports/report")
  },

  getReportById: async (rid) => {
    return makeRequest(`/reports/report/${rid}`)
  },

  updateReport: async (rid, data) => {
    return makeRequest(`/reports/report/${rid}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deleteReport: async (rid) => {
    return makeRequest(`/reports/report/${rid}`, {
      method: "DELETE",
    })
  },
}
