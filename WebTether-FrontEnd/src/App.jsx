"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"

// Layouts
import DashboardLayout from "./layouts/DashboardLayout"

// Pages
import HomePage from "./pages/HomePage"
import SignInPage from "./pages/auth/SignInPage"
import SignUpPage from "./pages/auth/SignUpPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import WebsitesPage from "./pages/dashboard/WebsitesPage"
import ValidatorsPage from "./pages/dashboard/ValidatorsPage"
import ReportsPage from "./pages/dashboard/ReportsPage"
import ProfilePage from "./pages/dashboard/ProfilePage"
import SettingsPage from "./pages/SettingsPage"

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="websites" element={<WebsitesPage />} />
        <Route path="validators" element={<ValidatorsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Settings page */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

