"use client"

import { useState } from "react"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "./components/ui/sonner"
import WebTetherLanding from "./pages/WebTetherLanding"
import Dashboard from "./pages/Dashboard"
import "./styles/globals.css"

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.pathname === "/dashboard" ? "dashboard" : "landing")

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
  window.addEventListener("popstate", () => {
    setCurrentPage(window.location.pathname === "/dashboard" ? "dashboard" : "landing")
  })

  return (
    <ThemeProvider defaultTheme="dark" storageKey="web-tether-theme">
      <AuthProvider>
        {renderPage()}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
