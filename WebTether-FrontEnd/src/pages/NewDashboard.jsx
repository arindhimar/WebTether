"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { websiteAPI, pingAPI } from "../services/api"
import { useToast } from "../hooks/use-toast"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Globe, Activity, Wallet, Settings, Plus, RefreshCw, AlertCircle } from "lucide-react"

// Import missing components
import StatsOverview from "../components/dashboard/StatsOverview"
import WebsiteList from "../components/dashboard/WebsiteList"
import RecentActivity from "../components/dashboard/RecentActivity"
import { ValidatorActivities } from "../components/dashboard/ValidatorActivities"
import PingQueue from "../components/dashboard/PingQueue"
import AvailableSites from "../components/dashboard/AvailableSites"
import UserSettings from "../components/dashboard/UserSettings"
import WalletPage from "./WalletPage"
import WalletBalanceWidget from "../components/WalletBalanceWidget"
import ErrorBoundary from "../components/dashboard/ErrorBoundary"

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-blue-900/20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-blue-600 dark:text-blue-400">Loading dashboard...</p>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function NewDashboard() {
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

  if (authLoading) {
    return <LoadingPage />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-blue-900/20 flex items-center justify-center px-4 sm:px-6">
        <Card className="w-full max-w-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 border-blue-200 dark:border-blue-700 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Authentication Required</h2>
              <p className="text-sm text-blue-600 dark:text-blue-400">Please log in to access your dashboard.</p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-blue-900/20">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-blue-200 dark:border-blue-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">WebTether</h1>
              </div>
            </div>
          </div>
        </header>
        <LoadingPage />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-blue-900/20">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-blue-200 dark:border-blue-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">WebTether</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 sm:px-6 py-4 sm:py-6">
          <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 border-blue-200 dark:border-blue-700 shadow-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Failed to Load Dashboard</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">{error}</p>
              <Button
                onClick={loadDashboardData}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-blue-900/20 mobile-safe-area-bottom">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-blue-200 dark:border-blue-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">WebTether</h1>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-blue-600 dark:text-blue-400">Welcome, {user.name}</div>
                <Badge
                  variant={user.role === "owner" ? "default" : "secondary"}
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                >
                  {user.role === "owner" ? "Website Owner" : user.isVisitor ? "Validator" : user.role}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDataRefresh}
                  className="border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-3 sm:px-6 py-3 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <Tabs value={currentView} onValueChange={handleNavigation} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                <TabsTrigger
                  value="overview"
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white hover:bg-emerald-600/20 dark:hover:bg-emerald-600/20"
                >
                  <Activity className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value={user?.isVisitor ? "available-sites" : "websites"}
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white hover:bg-emerald-600/20 dark:hover:bg-emerald-600/20"
                >
                  <Globe className="h-4 w-4" />
                  <span>{user?.isVisitor ? "Available Sites" : "Websites"}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="wallet"
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white hover:bg-emerald-600/20 dark:hover:bg-emerald-600/20"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Wallet</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white hover:bg-emerald-600/20 dark:hover:bg-emerald-600/20"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <div>{renderCurrentView()}</div>
            </Tabs>
          </motion.div>
        </main>

        {showFAB && (
          <div className="fixed bottom-6 right-4 z-40 sm:hidden">
            <Button
              onClick={handleAddWebsite}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-6 w-6 text-white" />
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
