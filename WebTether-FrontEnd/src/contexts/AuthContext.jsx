"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext({
  user: null,
  login: () => {},
  signup: () => {},
  logout: () => {},
  isLoading: false,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in on app start
    const storedUser = localStorage.getItem("web-tether-user")
    const storedToken = localStorage.getItem("web-tether-token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
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

      // Store user data and token from the API response
      setUser(data.user)
      localStorage.setItem("web-tether-user", JSON.stringify(data.user))
      localStorage.setItem("web-tether-token", data.session.token)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message || "Signup failed" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("web-tether-user")
    localStorage.removeItem("web-tether-token")
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
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
