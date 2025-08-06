"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { Toaster } from "./components/ui/sonner"
import OnboardingFlow from "./components/onboarding/OnboardingFlow"
import WebTetherLanding from "./pages/WebTetherLanding"
import Dashboard from "./pages/Dashboard"
import "./styles/globals.css"

function AppContent() {
  const [currentPage, setCurrentPage] = useState(window.location.pathname === "/dashboard" ? "dashboard" : "landing")
  const { user, showOnboarding, completeOnboarding } = useAuth()

  // Show onboarding for new validators
  if (showOnboarding && user) {
    return <OnboardingFlow onComplete={completeOnboarding} />
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

  // Listen for navigation changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(window.location.pathname === "/dashboard" ? "dashboard" : "landing")
    }
    
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return renderPage()
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
