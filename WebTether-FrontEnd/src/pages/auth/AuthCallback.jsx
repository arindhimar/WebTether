"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { useAuth } from "../../contexts/AuthContext"
import { Logo } from "../../components/Logo"

export default function AuthCallback() {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn, user } = useUser()
  const { isInitialized, isAuthenticating, authError } = useAuth()

  useEffect(() => {
    // If Clerk has loaded and auth is initialized
    if (isLoaded && isInitialized) {
      // If signed in, store clerk ID and redirect to dashboard
      if (isSignedIn && user) {
        localStorage.setItem("clerk-user-id", user.id)
        navigate("/dashboard")
      } else {
        // If not signed in, redirect to login
        navigate("/login")
      }
    }
  }, [isLoaded, isSignedIn, user, isInitialized, navigate])

  // Determine loading message
  let statusMessage = "Processing authentication..."
  if (!isLoaded) {
    statusMessage = "Loading authentication..."
  } else if (isAuthenticating) {
    statusMessage = "Setting up your account..."
  } else if (authError) {
    statusMessage = `Authentication error: ${authError}`
  } else if (isInitialized && isSignedIn) {
    statusMessage = "Authentication successful! Redirecting..."
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Logo size="large" />
      <div className="mt-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Authentication in Progress</h1>
        <p className="text-muted-foreground">{statusMessage}</p>
      </div>
    </div>
  )
}

