"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { SignIn, useUser } from "@clerk/clerk-react"
import { Navbar } from "../../components/Navbar"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { isSignedIn } = useUser()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // If user is already signed in, redirect to dashboard
    if (isSignedIn) {
      navigate("/dashboard")
    } else {
      setIsLoading(false)
    }
  }, [isSignedIn, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div className="text-center mb-8" initial="hidden" animate="visible" variants={fadeIn}>
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </motion.div>

          <motion.div
            className="bg-card rounded-lg shadow-lg p-6 border border-border"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/signup"
              redirectUrl="/auth/callback"
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                  card: "bg-transparent shadow-none border-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formFieldInput: "bg-background border-border text-foreground",
                  formFieldLabel: "text-foreground",
                  formButtonReset: "text-primary hover:text-primary/90",
                  footerActionLink: "text-primary hover:text-primary/90",
                },
              }}
            />
          </motion.div>

          <motion.p
            className="text-center mt-6 text-sm text-muted-foreground"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  )
}

