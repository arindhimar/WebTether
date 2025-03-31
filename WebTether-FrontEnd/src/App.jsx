"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ClerkProvider } from "@clerk/clerk-react"
import { ThemeProvider } from "./components/ThemeProvider"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
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
import AuthCallback from "./pages/auth/AuthCallback"
import LoadingScreen from "./components/LoadingScreen"

// Your Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key")
}

// Protected route component
function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, isInitialized, isAuthenticating } = useAuth()

  // Show loading while Clerk is loading or we're initializing auth
  if (!isLoaded || isAuthenticating || !isInitialized) {
    return <LoadingScreen message={!isLoaded ? "Loading..." : "Setting up your account..."} />
  }

  // If not signed in, redirect to login
  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  // Otherwise, render the protected content
  return children
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
      signInFallbackRedirectUrl="/auth/callback"
      signUpFallbackRedirectUrl="/auth/callback"
      signInUrl="/login"
      signUpUrl="/signup"
    >
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
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
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/website/:id"
                element={
                  <ProtectedRoute>
                    <WebsiteDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/validators"
                element={
                  <ProtectedRoute>
                    <ValidatorsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Error pages */}
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default App

