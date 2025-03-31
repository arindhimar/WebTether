import axios from "axios"

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  async (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("clerk-token")
    const clerkUserId = localStorage.getItem("clerk-user-id")

    // Prevent infinite loops for certain endpoints
    const isUserEndpoint = config.url.includes("/users/clerk/")

    // Add a timestamp to prevent caching issues
    if (isUserEndpoint) {
      config.params = { ...config.params, _t: new Date().getTime() }
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }

    if (clerkUserId) {
      config.headers["X-Clerk-User-Id"] = clerkUserId
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear auth data
      localStorage.removeItem("clerk-token")
      localStorage.removeItem("clerk-user-id")

      // Redirect to login page if not already there
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/signup")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

// Auth related API calls
export const authAPI = {
  verifyToken: (clerkUserId) => api.post("/auth/verify", { clerk_user_id: clerkUserId }),
}

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

