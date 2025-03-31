import axios from "axios"

// Change the API creation to include a fallback URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Track ongoing requests to prevent duplicates
const pendingRequests = new Map()

// Add debugging to help identify the 404 issue
api.interceptors.request.use(
  async (config) => {
    // Create a request key based on method and URL
    const requestKey = `${config.method}:${config.url}`

    // Log the request for debugging
    console.log(`API Request: ${requestKey}`)

    // If there's already a pending request with this key, cancel this one
    if (pendingRequests.has(requestKey)) {
      console.log(`Duplicate request canceled: ${requestKey}`)
      // Return a canceled request
      return {
        ...config,
        cancelToken: new axios.CancelToken((cancel) => cancel("Duplicate request canceled")),
      }
    }

    // Add this request to pending
    pendingRequests.set(requestKey, true)

    // Get the clerk user ID from localStorage
    const clerkUserId = localStorage.getItem("clerk-user-id") || ""

    // Add clerk user ID to headers if available
    if (clerkUserId) {
      config.headers["X-Clerk-User-Id"] = clerkUserId
    }

    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Update the response interceptor to log errors
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

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear auth data
      localStorage.removeItem("user-profile")
      localStorage.removeItem("auth-initialized")

      // Redirect to login page if not already there
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/signup")) {
        window.location.href = "/login"
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
}

// Website related API calls
export const websiteAPI = {
  getAllWebsites: () => api.get("/websites"),
  getWebsiteById: (id) => api.get(`/websites/${id}`),
  createWebsite: (websiteData) => api.post("/websites", websiteData),
  updateWebsite: (id, websiteData) => api.put(`/websites/${id}`, websiteData),
  deleteWebsite: (id) => api.delete(`/websites/${id}`),
  getWebsiteStats: () => api.get("/websites/stats"),
}

export default api

