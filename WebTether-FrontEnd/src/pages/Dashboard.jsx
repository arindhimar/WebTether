"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { websiteAPI, pingAPI } from "../services/api"
import { DashboardHeader } from "../components/dashboard/DashboardHeader"
import StatsOverview  from "../components/dashboard/StatsOverview"
import WebsiteList from "../components/dashboard/WebsiteList"
import RecentActivity from "../components/dashboard/RecentActivity"
import { ValidatorActivities } from "../components/dashboard/ValidatorActivities"
import PingQueue from "../components/dashboard/PingQueue"
import AvailableSites from "../components/dashboard/AvailableSites"
import UserSettings from "../components/dashboard/UserSettings"
import { useToast } from "../hooks/use-toast"
import WalletPage from "./WalletPage"
import WalletBalanceWidget  from "../components/WalletBalanceWidget"
import ErrorBoundary from "../components/dashboard/ErrorBoundary"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { AlertCircle, RefreshCw, Plus } from "lucide-react"

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [websites, setWebsites] = useState([])
  const [pings, setPings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState(user?.isVisitor ? "available-sites" : "overview")

  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (user && !authLoading) {
      const interval = setInterval(() => {
        loadDashboardData(true)
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user, authLoading])

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log("Dashboard - Received refresh event")
      loadDashboardData()
    }

    window.addEventListener("refreshDashboardData", handleRefresh)
    return () => window.removeEventListener("refreshDashboardData", handleRefresh)
  }, [])

  const loadDashboardData = async (silent = false) => {
    if (!user) return

    if (!silent) {
      setIsLoading(true)
      setError(null)
    }

    try {
      console.log("Dashboard - Loading data for user:", user.id)

      // Use the correct API methods
      const [websitesResponse, pingsResponse] = await Promise.all([websiteAPI.getAllWebsites(), pingAPI.getAllPings()])

      console.log("Dashboard - API Responses:", {
        websites: websitesResponse,
        pings: pingsResponse,
      })

      // Handle the case where responses might be wrapped in objects
      const pingsArray = Array.isArray(pingsResponse) ? pingsResponse : pingsResponse.pings || []
      const websitesArray = Array.isArray(websitesResponse) ? websitesResponse : websitesResponse.websites || []

      console.log("Dashboard - Processed arrays:", {
        websites: websitesArray.length,
        pings: pingsArray.length,
      })

      // Filter websites for the current user (if not a visitor)
      const userWebsites = user.isVisitor ? [] : websitesArray.filter((website) => website.uid === user.id)

      const processedWebsites = userWebsites.map((website) => {
        const websitePings = pingsArray.filter((ping) => ping.wid === website.wid)
        const upPings = websitePings.filter((ping) => ping.is_up)

        let uptime = 0
        let uptimeDisplay = "No data"

        if (websitePings.length > 0) {
          uptime = (upPings.length / websitePings.length) * 100
          uptimeDisplay = `${Math.round(uptime * 10) / 10}%`
        }

        const lastPing = websitePings.sort(
          (a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at),
        )[0]

        return {
          id: website.wid,
          wid: website.wid,
          url: website.url,
          name: website.name || website.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
          status: lastPing ? (lastPing.is_up ? "up" : "down") : "unknown",
          uptime: uptimeDisplay,
          uptimeValue: uptime,
          lastCheck: lastPing ? lastPing.timestamp || lastPing.created_at : website.created_at,
          responseTime: lastPing ? lastPing.latency_ms : null,
          category: website.category,
          pingCount: websitePings.length,
        }
      })

      console.log("Dashboard - Final processed data:", {
        processedWebsites: processedWebsites.length,
        totalPings: pingsArray.length,
      })

      setWebsites(processedWebsites)
      setPings(pingsArray)
    } catch (error) {
      console.error("Dashboard - Error loading data:", error)
      if (!silent) {
        setError(error.message)
        toast({
          title: "Error Loading Data",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  const handleNavigation = (view) => {
    setCurrentView(view)
  }

  const handleDataRefresh = () => {
    loadDashboardData()
  }

  const handleAddWebsite = () => {
    const event = new CustomEvent("openAddWebsiteDialog")
    window.dispatchEvent(event)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "overview":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                <StatsOverview websites={websites} pings={pings} user={user} />
                <div className="block lg:hidden">
                  <WalletBalanceWidget />
                </div>
                <WebsiteList
                  websites={websites}
                  setWebsites={setWebsites}
                  onWebsiteAdded={handleDataRefresh}
                  onWebsiteDeleted={handleDataRefresh}
                  compact={true}
                />
              </div>
              <div className="hidden lg:block space-y-4 sm:space-y-6">
                <WalletBalanceWidget />
                <RecentActivity websites={websites} pings={pings} user={user} />
              </div>
            </div>
          </motion.div>
        )

      case "websites":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="block lg:hidden">
              <WalletBalanceWidget />
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <WebsiteList
                  websites={websites}
                  setWebsites={setWebsites}
                  onWebsiteAdded={handleDataRefresh}
                  onWebsiteDeleted={handleDataRefresh}
                />
              </div>
              <div className="hidden lg:block space-y-4 sm:space-y-6">
                <WalletBalanceWidget />
                <RecentActivity websites={websites} pings={pings} user={user} />
              </div>
            </div>
          </motion.div>
        )

      case "available-sites":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="block lg:hidden">
              <WalletBalanceWidget />
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <AvailableSites pings={pings} onPingAccepted={handleDataRefresh} />
              </div>
              <div className="hidden lg:block space-y-4 sm:space-y-6">
                <WalletBalanceWidget />
                <RecentActivity websites={websites} pings={pings} user={user} />
              </div>
            </div>
          </motion.div>
        )

      case "activity":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="block lg:hidden">
              <WalletBalanceWidget />
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                {user?.isVisitor ? (
                  <ValidatorActivities pings={pings} websites={websites} user={user} />
                ) : (
                  <PingQueue pings={pings} websites={websites} userId={user.id} onPingAccepted={handleDataRefresh} />
                )}
              </div>
              <div className="hidden lg:block space-y-4 sm:space-y-6">
                <WalletBalanceWidget />
                <RecentActivity websites={websites} pings={pings} user={user} />
              </div>
            </div>
          </motion.div>
        )

      case "wallet":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <WalletPage />
          </motion.div>
        )

      case "settings":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <UserSettings />
          </motion.div>
        )

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="block lg:hidden">
              <WalletBalanceWidget />
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <WebsiteList
                  websites={websites}
                  setWebsites={setWebsites}
                  onWebsiteAdded={handleDataRefresh}
                  onWebsiteDeleted={handleDataRefresh}
                />
              </div>
              <div className="hidden lg:block space-y-4 sm:space-y-6">
                <WalletBalanceWidget />
                <RecentActivity websites={websites} pings={pings} user={user} />
              </div>
            </div>
          </motion.div>
        )
    }
  }

  // Show loading while auth is loading
  if (authLoading) {
    return <LoadingPage />
  }

  // Show authentication required if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6">
        <Card className="w-full max-w-md modern-card">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Authentication Required</h2>
              <p className="text-sm text-muted-foreground">Please log in to access your dashboard.</p>
              <Button onClick={() => (window.location.href = "/")} className="w-full btn-primary">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader currentView={currentView} onNavigate={handleNavigation} />
        <LoadingPage />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader currentView={currentView} onNavigate={handleNavigation} />
        <main className="px-4 sm:px-6 py-4 sm:py-6">
          <Card className="max-w-md mx-auto modern-card">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Failed to Load Dashboard</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={loadDashboardData} size="sm" className="btn-primary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const showFAB = !user?.isVisitor && (currentView === "websites" || currentView === "overview")

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background mobile-safe-area-bottom">
        <DashboardHeader currentView={currentView} onNavigate={handleNavigation} />

        <main className="px-3 sm:px-6 py-3 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            {renderCurrentView()}
          </motion.div>
        </main>

        {/* Floating Action Button - Mobile Only */}
        {showFAB && (
          <div className="fixed bottom-6 right-4 z-40 sm:hidden">
            <Button
              onClick={handleAddWebsite}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-6 w-6 text-white" />
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
