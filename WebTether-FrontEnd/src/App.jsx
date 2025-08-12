"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { Toaster } from "./components/ui/sonner"
import OnboardingFlow from "./components/onboarding/OnboardingFlow"
import WebTetherLanding from "./pages/WebTetherLanding"
import Dashboard from "./pages/Dashboard"
import "./index.css"

function AppContent() {
  const { user, showOnboarding, completeOnboarding } = useAuth()
  const [currentPage, setCurrentPage] = useState(window.location.pathname === "/dashboard" ? "dashboard" : "landing")

  // Listen for navigation changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(window.location.pathname === "/dashboard" ? "dashboard" : "landing")
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Show onboarding for new validators
  if (showOnboarding && user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <OnboardingFlow onComplete={completeOnboarding} />
      </div>
    )
  }

  // Simple routing
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      default:
        return <WebTetherLanding />
    }
  }

  return <div className="min-h-screen bg-background text-foreground">{renderPage()}</div>
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="web-tether-theme">
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
