"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth, useUser } from "@clerk/clerk-react"
import api from "../services/api"

/**
 * Custom hook to sync Clerk authentication with backend
 * This ensures that when a user authenticates with Clerk,
 * their information is also stored in our backend database
 */
export function useBackendAuth() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth()
  const { user, isLoaded: isUserLoaded } = useUser()
  const [backendUser, setBackendUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Function to refresh backend user data
  const refreshBackendUser = useCallback(async () => {
    if (!user?.id) return null
    try {
      const { data } = await api.get(`/users/clerk/${user.id}`)
      setBackendUser(data)
      return data
    } catch (err) {
      console.error("Error refreshing backend user:", err)
      setError(err)
      return null
    }
  }, [user?.id])

  // Sync user with backend when Clerk auth changes
  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (!isAuthLoaded || !isUserLoaded) return

      // If not signed in, clear backend user
      if (!isSignedIn || !user) {
        localStorage.removeItem("clerk-user-id")
        localStorage.removeItem("clerk-token")
        setBackendUser(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Store clerk user ID and token in localStorage for API interceptors
        localStorage.setItem("clerk-user-id", user.id)
        const token = await user.getToken()
        if (token) {
          localStorage.setItem("clerk-token", token)
        }

        // First, check if user exists in backend by clerk_id
        const { data: existingUser } = await api.get(`/users/clerk/${user.id}`).catch((err) => {
          // If 404, user doesn't exist yet
          if (err.response && err.response.status === 404) {
            return { data: null }
          }
          throw err
        })

        if (existingUser) {
          // User exists, update backend user state
          setBackendUser(existingUser)
        } else {
          // User doesn't exist, create new user
          const primaryEmail = user.emailAddresses.find(
            (email) => email.id === user.primaryEmailAddressId,
          )?.emailAddress

          const userData = {
            clerk_id: user.id,
            email: primaryEmail,
            first_name: user.firstName,
            last_name: user.lastName,
            username: user.username,
            image_url: user.imageUrl,
            auth_provider: "clerk",
          }

          const { data: newUser } = await api.post("/users", userData)

          // Get the full user data
          const { data: createdUser } = await api.get(`/users/clerk/${user.id}`)
          setBackendUser(createdUser)
        }
      } catch (err) {
        console.error("Error syncing user with backend:", err)
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    syncUserWithBackend()
  }, [isSignedIn, isAuthLoaded, isUserLoaded, user])

  return {
    backendUser,
    isLoading,
    error,
    refreshBackendUser,
  }
}

