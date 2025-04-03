import axios from "axios"

// Create API instance with environment variable or fallback URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Track ongoing requests to prevent duplicates
const pendingRequests = new Map()

// Request interceptor for authentication and request tracking
api.interceptors.request.use(
  async (config) => {
    // Create a request key based on method and URL
    const requestKey = `${config.method}:${config.url}`

    // Log the request for debugging
    console.log(`API Request: ${requestKey}`)

    // If there's already a pending request with this key, cancel this one
    if (pendingRequests.has(requestKey)) {
      console.log(`Duplicate request canceled: ${requestKey}`)
      return {
        ...config,
        cancelToken: new axios.CancelToken((cancel) => cancel("Duplicate request canceled")),
      }
    }

    // Add this request to pending
    pendingRequests.set(requestKey, true)

    // Get the clerk user ID and token from localStorage
    const clerkUserId = localStorage.getItem("clerk-user-id") || ""
    const clerkToken = localStorage.getItem("clerk-token") || ""

    // Add clerk user ID to headers if available
    if (clerkUserId) {
      config.headers["X-Clerk-User-Id"] = clerkUserId
    }

    // Add authorization token if available
    if (clerkToken) {
      config.headers["Authorization"] = `Bearer ${clerkToken}`
    }

    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling and cleanup
api.interceptors.response.use(
  (response) => {
    // Remove from pending requests
    const requestKey = `${response.config.method}:${response.config.url}`
    pendingRequests.delete(requestKey)

    return response
  },
  (error) => {
    // Log the error for debugging
    console.error("API Response Error:", error.response || error)

    // If request was canceled due to our duplicate detection, just return a resolved promise
    if (axios.isCancel(error)) {
      return Promise.resolve({ data: null, status: "canceled" })
    }

    // Remove from pending requests
    if (error.config) {
      const requestKey = `${error.config.method}:${error.config.url}`
      pendingRequests.delete(requestKey)
    }

    // Handle 401 Unauthorized errors - redirect to login
    if (error.response && error.response.status === 401) {
      // Clear auth data
      localStorage.removeItem("clerk-user-id")
      localStorage.removeItem("clerk-token")

      // Redirect to login page if not already there
      if (!window.location.pathname.includes("/sign-in") && !window.location.pathname.includes("/sign-up")) {
        window.location.href = "/sign-in"
      }
    }

    return Promise.reject(error)
  },
)

// User related API calls
export const userAPI = {
  createUser: (userData) => api.post("/users", userData),
  getUserByClerkId: (clerkId) => api.get(`/users/clerk/${clerkId}`),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  getUserProfile: () => api.get("/users/profile"),
}

// Website related API calls
export const websiteAPI = {
  getAllWebsites: () => api.get("/websites"),
  getWebsiteById: (id) => api.get(`/websites/${id}`),
  createWebsite: (websiteData) => api.post("/websites", websiteData),
  updateWebsite: (id, websiteData) => api.put(`/websites/${id}`, websiteData),
  deleteWebsite: (id) => api.delete(`/websites/${id}`),
  getWebsiteStats: () => api.get("/websites/stats"),
  pingWebsite: (id) => api.post(`/websites/${id}/ping`),
}

// Validator related API calls
export const validatorAPI = {
  getAllValidators: () => api.get("/validators"),
  getValidatorById: (id) => api.get(`/validators/${id}`),
  createValidator: (validatorData) => api.post("/validators", validatorData),
  updateValidator: (id, validatorData) => api.put(`/validators/${id}`, validatorData),
  deleteValidator: (id) => api.delete(`/validators/${id}`),
  getValidatorStats: () => api.get("/validators/stats"),
  assignWebsite: (validatorId, websiteId) => api.post(`/validators/${validatorId}/websites`, { website_id: websiteId }),
  removeWebsite: (validatorId, websiteId) => api.delete(`/validators/${validatorId}/websites/${websiteId}`),
  validateWebsite: (validatorId, websiteId) => api.post(`/validators/${validatorId}/validate/${websiteId}`),
}

// Report related API calls
export const reportAPI = {
  getAllReports: () => api.get("/reports"),
  getReportById: (id) => api.get(`/reports/${id}`),
  createReport: (reportData) => api.post("/reports", reportData),
  updateReport: (id, reportData) => api.put(`/reports/${id}`, reportData),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  getReportStats: () => api.get("/reports/stats"),
}

// Settings related API calls
export const settingsAPI = {
  getSettings: () => api.get("/settings"),
  updateSettings: (settingsData) => api.put("/settings", settingsData),
  updateNotificationSettings: (notificationSettings) => api.put("/settings/notifications", notificationSettings),
  updateSecuritySettings: (securitySettings) => api.put("/settings/security", securitySettings),
}

export default api

