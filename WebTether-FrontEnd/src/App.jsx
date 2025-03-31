"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react"
import { ThemeProvider } from "./components/theme-provider"
import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import WebsiteDetails from "./pages/WebsiteDetails"
import ValidatorsPage from "./pages/ValidatorsPage"
import ReportsPage from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"
import NotFoundPage from "./pages/NotFoundPage"
import ServerErrorPage from "./pages/ServerErrorPage"
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"
import { dark } from "@clerk/themes"
import { Toaster } from "./components/ui/toaster"
import { Logo } from "./components/Logo"
import AuthCallback from "./pages/auth/AuthCallback"

// Your Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key")
}

function App() {
  const [mounted, setMounted] = useState(false)

  // Ensure theme is applied after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#1e40af", // Dark blue
          colorTextOnPrimaryBackground: "white",
        },
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "bg-card border border-border shadow-lg",
          formFieldInput: "bg-background border-border text-foreground",
          rootBox: "rounded-lg shadow-lg",
          navbar: "bg-background border-b border-border",
          headerTitle: "text-foreground font-bold",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "border-border hover:bg-accent",
          socialButtonsBlockButtonText: "text-foreground",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          formFieldLabel: "text-foreground",
          footerActionLink: "text-primary hover:text-primary/90",
          identityPreviewEditButton: "text-primary hover:text-primary/90",
        },
      }}
      afterSignInUrl="/auth/callback"
      afterSignUpUrl="/auth/callback"
      signInUrl="/login"
      signUpUrl="/signup"
      navigate={(to) => (window.location.href = to)}
    >
      <ThemeProvider defaultTheme="dark">
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <>
                  <SignedIn>
                    <Dashboard />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/website/:id"
              element={
                <>
                  <SignedIn>
                    <WebsiteDetails />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/validators"
              element={
                <>
                  <SignedIn>
                    <ValidatorsPage />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/reports"
              element={
                <>
                  <SignedIn>
                    <ReportsPage />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/settings"
              element={
                <>
                  <SignedIn>
                    <SettingsPage />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            {/* Error pages */}
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  )
}

// Loading component for Clerk
export function ClerkLoading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <Logo size="large" animated={true} />
      <div className="mt-8 flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-lg text-foreground">Loading WebTether...</p>
      </div>
    </div>
  )
}

export default App

