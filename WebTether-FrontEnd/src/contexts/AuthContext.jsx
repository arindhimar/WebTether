"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useUser, useClerk } from "@clerk/clerk-react"
import { userAPI } from "../services/api"

// Create context
const AuthContext = createContext(null)

// Auth provider component
export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  // Initialize user in our backend only once when Clerk loads
  const initializeUser = useCallback(async () => {
    // Skip if already initialized or authenticating or not loaded yet
    if (isInitialized || isAuthenticating || !isLoaded) return

    // If not signed in, clear any stored data
    if (!isSignedIn || !user) {
      localStorage.removeItem("user-profile")
      localStorage.removeItem("auth-initialized")
      setUserProfile(null)
      setIsInitialized(true)
      return
    }

    try {
      setIsAuthenticating(true)
      setAuthError(null)

      // Check if we have cached user data
      const cachedProfile = localStorage.getItem("user-profile")
      if (cachedProfile) {
        try {
          const profile = JSON.parse(cachedProfile)
          // Only use cache if it's for the current user
          if (profile && profile.clerk_id === user.id) {
            setUserProfile(profile)
            setIsInitialized(true)
            setIsAuthenticating(false)
            return
          }
        } catch (e) {
          console.error("Error parsing cached profile:", e)
          // Continue with API call if cache parsing fails
        }
      }

      // Prepare user data
      const userData = {
        clerk_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        image_url: user.imageUrl || "",
        auth_provider: "clerk",
        username: user.username || "",
      }

      // Store clerk ID for API requests
      localStorage.setItem("clerk-user-id", user.id)

      // Try to get existing user first
      try {
        console.log("Fetching user by clerk ID:", user.id)
        const response = await userAPI.getUserByClerkId(user.id)
        console.log("User found:", response.data)
        setUserProfile(response.data)
        localStorage.setItem("user-profile", JSON.stringify(response.data))
      } catch (error) {
        console.error("Error fetching user:", error.response || error)

        // If user doesn't exist (404), create a new one
        if (error.response && error.response.status === 404) {
          console.log("Creating new user:", userData)
          try {
            const createResponse = await userAPI.createUser(userData)
            console.log("User created:", createResponse.data)

            // After creating, fetch the complete profile
            const newUserResponse = await userAPI.getUserByClerkId(user.id)
            setUserProfile(newUserResponse.data)
            localStorage.setItem("user-profile", JSON.stringify(newUserResponse.data))
          } catch (createError) {
            console.error("Error creating user:", createError.response || createError)
            throw createError
          }
        } else {
          throw error
        }
      }

      // Mark as initialized
      localStorage.setItem("auth-initialized", "true")
      setIsInitialized(true)
    } catch (error) {
      console.error("Auth initialization error:", error.response || error)
      setAuthError(error.message || "Authentication failed")

      // Even if there's an error, mark as initialized to prevent infinite retries
      setIsInitialized(true)
    } finally {
      setIsAuthenticating(false)
    }
  }, [isLoaded, isSignedIn, user, isInitialized, isAuthenticating])

  // Run initialization when auth state changes
  useEffect(() => {
    if (isLoaded && !isInitialized && !isAuthenticating) {
      initializeUser()
    }
  }, [isLoaded, isInitialized, isAuthenticating, initializeUser])

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("user-profile")
      localStorage.removeItem("auth-initialized")

      // Reset state
      setUserProfile(null)
      setIsInitialized(false)

      // Sign out from Clerk
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!isSignedIn || !user) return

    try {
      const response = await userAPI.getUserByClerkId(user.id)
      setUserProfile(response.data)
      localStorage.setItem("user-profile", JSON.stringify(response.data))
    } catch (error) {
      console.error("Error refreshing user profile:", error)
    }
  }

  // Context value
  const value = {
    isLoaded,
    isSignedIn,
    isInitialized,
    isAuthenticating,
    authError,
    userProfile,
    signOut: handleSignOut,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

