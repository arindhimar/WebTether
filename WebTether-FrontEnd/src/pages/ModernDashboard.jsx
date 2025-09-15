"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import ModernDashboardHeader from "../components/dashboard/ModernDashboardHeader"
import ModernNavigationTabs from "../components/dashboard/ModernNavigationTabs"
import ModernStatsOverview from "../components/dashboard/ModernStatsOverview"
import ModernBalanceSection from "../components/dashboard/ModernBalanceSection"
import ModernActivitySection from "../components/dashboard/ModernActivitySection"
import AvailableSites from "../components/dashboard/AvailableSites"
import UserSettings from "../components/dashboard/UserSettings"
import RecentActivity from "../components/dashboard/RecentActivity"
import WebsiteList from "../components/dashboard/WebsiteList"
import { api } from "../services/api"

const ModernDashboard = () => {
  const { theme } = useTheme()
  const { logout, user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState("Overview")
  const isDark = theme === "dark"

  // Add user state
  const [user, setUser] = useState(null)

  const [dashboardData, setDashboardData] = useState({
    websites: [],
    pings: [],
    balance: null,
    transactions: [],
    availableSites: [],
    loading: false,
    error: null,
    lastFetch: null,
  })

  const [fetchingData, setFetchingData] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        // Try to get user from auth context first
        if (authUser) {
          setUser(authUser)
          return
        }
        
        // Fallback to localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
        if (storedUser && storedUser.id) {
          setUser(storedUser)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }
    
    loadUserData()
  }, [authUser])

  const handleApiError = (error) => {
    if (
      error.message?.includes("Invalid or expired token") ||
      error.message?.includes("401") ||
      error.message?.includes("Unauthorized")
    ) {
      console.log("[v0] Token expired, logging out user")
      logout()
      return true
    }
    return false
  }

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setFetchingData(true)
      }

      setDashboardData((prev) => ({ ...prev, error: null }))

      const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}")
      const userId = currentUser.id

      console.log("[v0] Fetching dashboard data for user:", userId)

      // Fetch all dashboard data in parallel with timeout
      const fetchPromises = [
        userId ? api.getUserWebsites(userId) : api.getWebsites(),
        userId ? api.getUserPings(userId) : api.getAllPings(),
        api.getWalletBalance(),
        api.getTransactionHistory(),
        api.getAvailableSites(),
      ]

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))

      const results = await Promise.allSettled(fetchPromises.map((promise) => Promise.race([promise, timeoutPromise])))

      const [websitesResponse, pingsResponse, balanceResponse, transactionsResponse, availableSitesResponse] = results

      console.log("[v0] Dashboard data fetched successfully")

      setDashboardData({
        websites: websitesResponse.status === "fulfilled" ? websitesResponse.value : [],
        pings: pingsResponse.status === "fulfilled" ? pingsResponse.value.pings || pingsResponse.value : [],
        balance: balanceResponse.status === "fulfilled" ? balanceResponse.value : null,
        transactions: transactionsResponse.status === "fulfilled" ? transactionsResponse.value.transactions || [] : [],
        availableSites: availableSitesResponse.status === "fulfilled" ? availableSitesResponse.value : [],
        loading: false,
        error: null,
        lastFetch: new Date().toISOString(),
      })
    } catch (error) {
      console.error("[v0] Failed to fetch dashboard data:", error)

      if (handleApiError(error)) {
        return
      }

      setDashboardData((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
        lastFetch: new Date().toISOString(),
      }))
    } finally {
      setFetchingData(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !refreshing && !fetchingData) {
        fetchDashboardData(true)
      }
    }, 45000) // Increased to 45 seconds to reduce load

    return () => clearInterval(interval)
  }, [user, refreshing, fetchingData])

  const handleRefresh = () => {
    if (!refreshing && !fetchingData) {
      fetchDashboardData(true)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-8">
            <ModernStatsOverview
              data={dashboardData}
              loading={fetchingData}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ModernBalanceSection balance={dashboardData.balance} loading={fetchingData} />
              </div>
              <div className="lg:col-span-2">
                <ModernActivitySection
                  transactions={dashboardData.transactions}
                  pings={dashboardData.pings}
                  loading={fetchingData}
                />
              </div>
            </div>

            {!fetchingData && dashboardData.websites.length === 0 && (
              <div className="text-center py-16">
                <div
                  className={`p-8 rounded-3xl backdrop-blur-sm border transition-all hover:scale-[1.02] ${
                    isDark ? "bg-slate-800/40 border-blue-800/40" : "bg-white/60 border-blue-200/60"
                  }`}
                >
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg`}
                  >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent`}
                  >
                    No sites added yet
                  </h3>
                  <p className={`text-lg mb-8 max-w-md mx-auto ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Start monitoring your first website to track uptime and earn from validator pings.
                  </p>
                  <button
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all hover:scale-105 shadow-lg"
                    onClick={() => setActiveTab("Available Sites")}
                  >
                    + Add Your First Site
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      case "Available Sites":
        return (
          <div className="space-y-6">
            <AvailableSites />
          </div>
        )
      case "My Sites":
        return (
          <div className="space-y-6">
            <WebsiteList 
              websites={dashboardData.websites} 
              setWebsites={(websites) => setDashboardData(prev => ({...prev, websites}))}
              compact={false}
            />
          </div>
        )
      case "Recent Activity":
        return (
          <div className="space-y-6">
            <RecentActivity
              websites={dashboardData.websites}
              pings={dashboardData.pings} 
              user={user}
            />
          </div>
        )
      case "Wallet":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModernBalanceSection balance={dashboardData.balance} loading={fetchingData} />
              <div
                className={`p-6 rounded-2xl backdrop-blur-sm border ${
                  isDark ? "bg-slate-800/40 border-blue-800/40" : "bg-white/60 border-blue-200/60"
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent`}
                >
                  Transaction History
                </h3>
                {fetchingData ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`h-4 rounded ${isDark ? "bg-slate-700" : "bg-slate-200"}`}></div>
                    ))}
                  </div>
                ) : dashboardData.transactions.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.transactions.slice(0, 5).map((tx, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 rounded-lg bg-slate-50/50 dark:bg-slate-700/30"
                      >
                        <div>
                          <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                            {tx.type || "Ping Payment"}
                          </p>
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`font-semibold ${tx.amount > 0 ? "text-emerald-500" : "text-red-400"}`}>
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount} ETH
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>No transactions yet</p>
                )}
              </div>
            </div>
          </div>
        )
      case "Settings":
        return <UserSettings />
      default:
        return null
    }
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-100"
      }`}
    >
      <ModernDashboardHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent`}
          >
            {activeTab}
          </h1>
          <p className={`text-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Your website monitoring statistics
          </p>
        </div>

        <ModernNavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {renderTabContent()}
      </main>
    </div>
  )
}

export default ModernDashboard