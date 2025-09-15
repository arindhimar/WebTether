"use client"

import { useState } from "react"
import { useTheme } from "../../contexts/ThemeContext"
import { useNavigate } from "react-router-dom"

const ModernDashboardHeader = ({ user = { name: "Arin", role: "Validator" } }) => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const isDark = theme === "dark"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        isDark ? "bg-slate-900/80 border-blue-800/30" : "bg-white/80 border-blue-200/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? "bg-blue-600" : "bg-blue-600"
              }`}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>WebTether</h1>
              <p className={`text-xs ${isDark ? "text-blue-300" : "text-blue-600"}`}>Decentralized Monitoring</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all hover:scale-110 ${
                isDark
                  ? "bg-blue-800/50 text-blue-200 hover:bg-blue-700/50"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all hover:scale-105 ${
                  isDark ? "text-white hover:bg-blue-800/50" : "text-slate-900 hover:bg-blue-50"
                }`}
              >
                <div className="text-right">
                  <div className="text-sm font-medium">Welcome, {user.name}</div>
                  <div className={`text-xs ${isDark ? "text-blue-300" : "text-blue-600"}`}>{user.role}</div>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                </div>
                <svg
                  className={`w-4 h-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border py-1 z-50 backdrop-blur-sm ${
                    isDark ? "bg-slate-800/90 border-blue-800/30" : "bg-white/90 border-blue-200/50"
                  }`}
                >
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      isDark ? "text-slate-300 hover:bg-blue-800/50" : "text-slate-700 hover:bg-blue-50"
                    }`}
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ModernDashboardHeader
  