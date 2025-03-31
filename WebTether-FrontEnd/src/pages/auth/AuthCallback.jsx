"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { userAPI } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { Logo } from "../../components/Logo"

export default function AuthCallback() {
  const navigate = useNavigate()
  const { isSignedIn, user, isLoaded } = useUser()
  const { toast } = useToast()
  const [status, setStatus] = useState("Processing authentication...")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Only run this once when the component mounts and user data is loaded
    const processAuth = async () => {
      if (!isLoaded) return

      if (!isSignedIn || !user) {
        setStatus("Authentication failed. Redirecting to login...")
        setTimeout(() => navigate("/login"), 1500)
        return
      }

      try {
        // Prevent duplicate processing
        if (isProcessing) return
        setIsProcessing(true)

        setStatus("Setting up your account...")

        // Store authentication data
        localStorage.setItem("clerk-token", user.id)
        localStorage.setItem("clerk-user-id", user.id)

        // Prepare user data
        const userData = {
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || `${user.id}@example.com`,
          first_name: user.firstName,
          last_name: user.lastName,
          image_url: user.imageUrl,
          auth_provider: "clerk",
          username: user.username,
        }

        // Check if user exists
        try {
          setStatus("Checking existing account...")
          await userAPI.getUserByClerkId(user.id)
          setStatus("Account found! Redirecting to dashboard...")
        } catch (error) {
          // If user doesn't exist, create them
          if (error.response && error.response.status === 404) {
            setStatus("Creating your account...")
            await userAPI.createUser(userData)
            setStatus("Account created! Redirecting to dashboard...")
          } else {
            throw error
          }
        }

        // Show success message
        toast({
          title: "Authentication successful",
          description: `Welcome ${user.firstName || user.username || "to WebTether"}!`,
          type: "success",
        })

        // Redirect to dashboard
        navigate("/dashboard")
      } catch (error) {
        console.error("Authentication error:", error)
        setStatus("Authentication error. Please try again.")
        toast({
          title: "Authentication Error",
          description: "There was a problem setting up your account. Please try again.",
          type: "error",
        })

        // Clear any partial auth data
        localStorage.removeItem("clerk-token")
        localStorage.removeItem("clerk-user-id")

        // Redirect to login after a delay
        setTimeout(() => navigate("/login"), 2000)
      } finally {
        setIsProcessing(false)
      }
    }

    processAuth()
  }, [isLoaded, isSignedIn, user, navigate, toast, isProcessing])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Logo size="large" />
      <div className="mt-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Authentication in Progress</h1>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}

