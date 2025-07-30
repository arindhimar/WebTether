"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authAPI, userAPI } from "../services/api"

const AuthContext = createContext({
  user: null,
  setUser: () => {}, // Add this line
  login: () => {},
  signup: () => {},
  logout: () => {},
  isLoading: false,
  showOnboarding: false,
  completeOnboarding: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user is already logged in on app start
      const storedUser = localStorage.getItem("web-tether-user")
      const storedToken = localStorage.getItem("web-tether-token")
      const onboardingComplete = localStorage.getItem("web-tether-onboarding-complete")

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser)

        try {
          // Fetch latest user data from database to sync any changes
          const latestUserData = await userAPI.getUserById(userData.id)
          const syncedUserData = { ...userData, ...latestUserData }

          setUser(syncedUserData)
          localStorage.setItem("web-tether-user", JSON.stringify(syncedUserData))

          // Show onboarding if not completed and user just signed up
          if (!onboardingComplete && syncedUserData.isNewUser) {
            setShowOnboarding(true)
          }
        } catch (error) {
          console.error("Error syncing user data:", error)
          // If we can't sync, use stored data but user might need to refresh
          setUser(userData)

          if (!onboardingComplete && userData.isNewUser) {
            setShowOnboarding(true)
          }
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password)

      // Fetch the complete user data from the database to ensure we have latest info
      const completeUserData = await userAPI.getUserById(data.user.id)

      // Merge the login response with complete user data
      const fullUserData = { ...data.user, ...completeUserData }

      // Store user data and token from the API response
      setUser(fullUserData)
      localStorage.setItem("web-tether-user", JSON.stringify(fullUserData))
      localStorage.setItem("web-tether-token", data.token)
      return { success: true, data: { ...data, user: fullUserData } }
    } catch (error) {
      return { success: false, error: error.message || "Login failed" }
    }
  }

  const signup = async (userData) => {
    try {
      const data = await authAPI.signup(userData)

      // Mark user as new for onboarding
      const userWithNewFlag = { ...data.user, isNewUser: true }

      // Store user data and token from the API response
      setUser(userWithNewFlag)
      localStorage.setItem("web-tether-user", JSON.stringify(userWithNewFlag))
      localStorage.setItem("web-tether-token", data.session.token)

      // Show onboarding for new users
      setShowOnboarding(true)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message || "Signup failed" }
    }
  }

  const logout = () => {
    setUser(null)
    setShowOnboarding(false)
    localStorage.removeItem("web-tether-user")
    localStorage.removeItem("web-tether-token")
    localStorage.removeItem("web-tether-onboarding-complete")
  }

  const completeOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem("web-tether-onboarding-complete", "true")

    // Remove the isNewUser flag
    if (user) {
      const updatedUser = { ...user }
      delete updatedUser.isNewUser
      setUser(updatedUser)
      localStorage.setItem("web-tether-user", JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    setUser, // Add this line
    login,
    signup,
    logout,
    isLoading,
    showOnboarding,
    completeOnboarding,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
