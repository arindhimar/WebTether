"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext({
  user: null,
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
    // Check if user is already logged in on app start
    const storedUser = localStorage.getItem("web-tether-user")
    const storedToken = localStorage.getItem("web-tether-token")
    const onboardingComplete = localStorage.getItem("web-tether-onboarding-complete")

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser)
      setUser(userData)

      // Show onboarding if not completed and user just signed up
      if (!onboardingComplete && userData.isNewUser) {
        setShowOnboarding(true)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password)

      // Store user data and token from the API response
      setUser(data.user)
      localStorage.setItem("web-tether-user", JSON.stringify(data.user))
      localStorage.setItem("web-tether-token", data.token)
      return { success: true, data }
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
