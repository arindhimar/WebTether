"use client"

import React from "react"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "./components/ui/sonner"
import { Header } from "./components/layout/Header"
import { Footer } from "./components/layout/Footer"
import NewWebTetherLanding from "./pages/NewWebTetherLanding"
import NewDashboard from "./pages/NewDashboard"
import WalletPage from "./pages/WalletPage"
import { toast } from "sonner"
import "./App.css"

function App() {
  // Show welcome toast on app load
  React.useEffect(() => {
    const hasShownWelcome = localStorage.getItem("hasShownWelcome")
    if (!hasShownWelcome) {
      setTimeout(() => {
        toast.success("Welcome to WebTether! 🎉", {
          description: "The first monitoring service that pays you back.",
          duration: 5000,
        })
        localStorage.setItem("hasShownWelcome", "true")
      }, 1000)
    }
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/" element={<NewWebTetherLanding />} />
              <Route
                path="/dashboard"
                element={
                  <div className="min-h-screen">
                    <NewDashboard />
                  </div>
                }
              />
              <Route
                path="/wallet"
                element={
                  <div className="min-h-screen">
                    <Header />
                    <WalletPage />
                    <Footer />
                  </div>
                }
              />
            </Routes>
            <Toaster position="top-right" expand={true} richColors={true} closeButton={true} />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
