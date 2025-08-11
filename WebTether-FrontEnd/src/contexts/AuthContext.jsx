"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { api } from "../services/api"
import { debugCloudflareWorkerInfo } from "../utils/cloudflareAgent"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [token, setToken] = useState(localStorage.getItem("token"))

  // Function to refresh user data from the server
  const refreshUserData = async () => {
    if (!user?.id || !token) return

    try {
      const userData = await api.getUser(user.id)
      console.log("Refreshed user data:", userData)
      setUser(userData)
      debugCloudflareWorkerInfo(userData)
    } catch (error) {
      console.error("Failed to refresh user data:", error)
    }
  }

  // Function to fetch complete user data after login
  const fetchCompleteUserData = async (userId) => {
    try {
      const userData = await api.getUser(userId)
      console.log("Fetched complete user data:", userData)
      setUser(userData)
      debugCloudflareWorkerInfo(userData)
      return userData
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      return null
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password)
      const { user_id, email: userEmail, token } = response

      setToken(token)
      localStorage.setItem("token", token)

      // Fetch complete user data using the user_id
      const completeUserData = await fetchCompleteUserData(user_id)

      return { success: true, user: completeUserData }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: error.message }
    }
  }

  const signup = async (signupData) => {
    try {
      const response = await api.signup(signupData)
      const { user_id, email, token } = response

      setToken(token)
      localStorage.setItem("token", token)

      // Fetch complete user data using the user_id
      const completeUserData = await fetchCompleteUserData(user_id)

      // Show onboarding for validators (if they have isVisitor flag)
      if (signupData.isVisitor) {
        setShowOnboarding(true)
      }

      return { success: true, user: completeUserData }
    } catch (error) {
      console.error("Signup failed:", error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setShowOnboarding(false)
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Redirect to landing page
    window.location.href = "/"
  }

  // Add completeOnboarding function
  const completeOnboarding = () => {
    setShowOnboarding(false)
  }

  // Initialize auth state on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setToken(storedToken)

          // Refresh user data to ensure it's up to date
          const refreshedData = await fetchCompleteUserData(userData.id)
          if (!refreshedData) {
            // If refresh fails, use stored data
            setUser(userData)
          }
        } catch (error) {
          console.error("Failed to initialize auth:", error)
          logout()
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  // Store user data in localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

  const value = {
    user,
    setUser, // Export setUser function
    token,
    loading,
    showOnboarding,
    login,
    signup,
    logout,
    refreshUserData,
    fetchCompleteUserData,
    completeOnboarding,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
