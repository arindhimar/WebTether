"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/clerk-react"

/**
 * Custom hook to get and store the Clerk session token
 */
export function useClerkToken() {
  const { getToken, isSignedIn, isLoaded } = useAuth()
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to refresh the token
  const refreshToken = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return null

    try {
      setIsLoading(true)
      const sessionToken = await getToken()

      if (sessionToken) {
        localStorage.setItem("clerk-token", sessionToken)
        setToken(sessionToken)
        return sessionToken
      }
      return null
    } catch (error) {
      console.error("Error refreshing Clerk token:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn, isLoaded, getToken])

  useEffect(() => {
    const fetchToken = async () => {
      if (!isLoaded) return

      if (!isSignedIn) {
        localStorage.removeItem("clerk-token")
        setToken(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const sessionToken = await getToken()

        if (sessionToken) {
          localStorage.setItem("clerk-token", sessionToken)
          setToken(sessionToken)
        }
      } catch (error) {
        console.error("Error getting Clerk token:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [isSignedIn, isLoaded, getToken])

  return { token, isLoading, refreshToken }
}

