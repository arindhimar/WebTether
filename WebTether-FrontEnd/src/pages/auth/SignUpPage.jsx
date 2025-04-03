"use client"

import { SignUp } from "@clerk/clerk-react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"

export default function SignUpPage() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard")
    }
  }, [isSignedIn, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-background/95">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text">Create an Account</h1>
          <p className="text-muted-foreground mt-2">Join WebTether to monitor your websites</p>
        </div>
        <div className="rounded-lg border bg-card shadow-lg">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none border-0",
                formButtonPrimary: "bg-primary hover:bg-primary/90",
              },
            }}
            redirectUrl="/dashboard"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  )
}

