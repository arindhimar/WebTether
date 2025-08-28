"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { api } from "../services/api"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Helper to extract user ID from JWT token
  const getUserIdFromToken = (token) => {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.user_id?.user_id || payload.user_id?.id || payload.user_id || payload.id
    } catch (error) {
      console.error("Error decoding token:", error)
      return null
    }
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (token && storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)

          // Optionally refresh user data from server
          try {
            const userId = getUserIdFromToken(token)
            if (userId) {
              const freshUserData = await api.getUser(userId)
              if (freshUserData) {
                const updatedUser = {
                  ...userData,
                  ...freshUserData,
                  // Ensure consistent field names
                  isVisitor: freshUserData.isVisitor ?? freshUserData.is_visitor ?? userData.isVisitor,
                }
                setUser(updatedUser)
                localStorage.setItem("user", JSON.stringify(updatedUser))
              }
            }
          } catch (error) {
            console.warn("Failed to refresh user data:", error)
            // Continue with stored user data
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        // Clear invalid data
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password)
      console.log("Login response:", response)

      // Handle different response formats
      const token = response.token || response.session?.token
      const userData = response.user

      if (!token || !userData) {
        throw new Error("Invalid login response format")
      }

      // Store auth data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(userData))

      // Ensure consistent field names
      const normalizedUser = {
        ...userData,
        isVisitor: userData.isVisitor ?? userData.is_visitor ?? false,
      }

      setUser(normalizedUser)
      return { success: true, user: normalizedUser }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: error.message }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.signup(userData)
      console.log("Signup response:", response)

      // Handle different response formats
      const token = response.session?.token || response.token
      const user = response.user

      if (!token || !user) {
        throw new Error("Invalid signup response format")
      }

      // Store auth data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      // Ensure consistent field names
      const normalizedUser = {
        ...user,
        isVisitor: user.isVisitor ?? user.is_visitor ?? false,
      }

      setUser(normalizedUser)
      return { success: true, user: normalizedUser }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.warn("Logout API call failed:", error)
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
    }
  }

  const updateUser = async (updates) => {
    if (!user) throw new Error("No user logged in")

    try {
      const userId = user.id
      const response = await api.updateUser(userId, updates)
      console.log("Update user response:", response)

      // Handle response format - could be array or single object
      let updatedUserData = response
      if (Array.isArray(response) && response.length > 0) {
        updatedUserData = response[0]
      }

      const updatedUser = {
        ...user,
        ...updatedUserData,
        // Ensure consistent field names
        isVisitor: updatedUserData.isVisitor ?? updatedUserData.is_visitor ?? user.isVisitor,
      }

      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      return updatedUser
    } catch (error) {
      console.error("Update user error:", error)
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
