"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react"
import { ThemeProvider } from "./components/theme-provider"
import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import WebsiteDetails from "./pages/WebsiteDetails"
import ValidatorsPage from "./pages/ValidatorsPage"
import ReportsPage from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"
import NotFoundPage from "./pages/NotFoundPage"
import ServerErrorPage from "./pages/ServerErrorPage"
import { Logo } from "./components/logo"

// Import Clerk components
import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-react"
import { dark } from "@clerk/themes"

// Your Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Publishable Key")
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
          colorPrimary: "hsl(220, 70%, 30%)",
          colorTextOnPrimaryBackground: "white",
        },
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "bg-card",
          formFieldInput: "bg-background border-border",
          rootBox: "rounded-lg shadow-lg",
          card: "bg-card border border-border",
          navbar: "bg-background border-b border-border",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "border-border hover:bg-accent",
          socialButtonsBlockButtonText: "text-foreground",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          formFieldLabel: "text-foreground",
          formFieldInput: "bg-background border-border text-foreground",
          footerActionLink: "text-primary hover:text-primary/90",
          identityPreviewEditButton: "text-primary hover:text-primary/90",
        },
      }}
    >
      <ThemeProvider defaultTheme="dark">
        <Router>
          <ClerkLoading>
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
              <Logo size="large" animated={true} />
              <div className="mt-8 flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="text-lg text-foreground">Loading WebTether...</p>
              </div>
            </div>
          </ClerkLoading>

          <ClerkLoaded>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <>
                    <SignedIn>
                      <Dashboard />
                    </SignedIn>
                    <SignedOut>
                      <Navigate to="/sign-in" replace />
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
                      <Navigate to="/sign-in" replace />
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
                      <Navigate to="/sign-in" replace />
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
                      <Navigate to="/sign-in" replace />
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
                      <Navigate to="/sign-in" replace />
                    </SignedOut>
                  </>
                }
              />

              {/* Error pages */}
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ClerkLoaded>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default App

