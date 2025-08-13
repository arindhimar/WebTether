"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { websiteAPI, pingAPI } from "../services/api"
import { DashboardHeader } from "../components/dashboard/DashboardHeader"
import  StatsOverview  from "../components/dashboard/StatsOverview"
import WebsiteList from "../components/dashboard/WebsiteList"
import RecentActivity from "../components/dashboard/RecentActivity"
import { ValidatorActivities } from "../components/dashboard/ValidatorActivities"
import PingQueue from "../components/dashboard/PingQueue"
import AvailableSites from "../components/dashboard/AvailableSites"
import UserSettings from "../components/dashboard/UserSettings"
import { useToast } from "../hooks/use-toast"
import WalletPage from "./WalletPage"
import { WalletBalanceWidget } from "../components/WalletBalanceWidget"
import { LoadingSpinner } from "../components/dashboard/LoadingSpinner"
import ErrorBoundary from "../components/dashboard/ErrorBoundary"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

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

  const loadDashboardData = async (silent = false) => {
    if (!user) return

    if (!silent) {
      setIsLoading(true)
      setError(null)
    }

    try {
      const [websitesResponse, pingsResponse] = await Promise.all([websiteAPI.getAllWebsites(), pingAPI.getAllPings()])

      const userWebsites = websitesResponse.filter((website) => website.uid === user.id)

      const processedWebsites = userWebsites.map((website) => {
        const websitePings = pingsResponse.filter((ping) => ping.wid === website.wid)
        const upPings = websitePings.filter((ping) => ping.is_up)

        let uptime = 0
        let uptimeDisplay = "No data"

        if (websitePings.length > 0) {
          uptime = (upPings.length / websitePings.length) * 100
          uptimeDisplay = `${Math.round(uptime * 10) / 10}%`
        }

        const lastPing = websitePings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

        return {
          id: website.wid,
          wid: website.wid,
          url: website.url,
          name: website.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
          status: lastPing ? (lastPing.is_up ? "up" : "down") : "unknown",
          uptime: uptimeDisplay,
          uptimeValue: uptime,
          lastCheck: lastPing ? lastPing.created_at : website.created_at,
          responseTime: lastPing ? lastPing.latency_ms : null,
          category: website.category,
          pingCount: websitePings.length,
        }
      })

      setWebsites(processedWebsites)
      setPings(pingsResponse)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
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

  const renderCurrentView = () => {
    switch (currentView) {
      case "overview":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <StatsOverview websites={websites} pings={pings} user={user} />
                <WebsiteList
                  websites={websites}
                  setWebsites={setWebsites}
                  onWebsiteAdded={handleDataRefresh}
                  onWebsiteDeleted={handleDataRefresh}
                  compact={true}
                />
              </div>
              <div className="space-y-6">
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
            className="grid gap-6 lg:grid-cols-4"
          >
            <div className="lg:col-span-3">
              <WebsiteList
                websites={websites}
                setWebsites={setWebsites}
                onWebsiteAdded={handleDataRefresh}
                onWebsiteDeleted={handleDataRefresh}
              />
            </div>
            <div className="space-y-6">
              <WalletBalanceWidget />
              <RecentActivity websites={websites} pings={pings} user={user} />
            </div>
          </motion.div>
        )

      case "available-sites":
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <AvailableSites pings={pings} onPingAccepted={handleDataRefresh} />
          </motion.div>
        )

      case "activity":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-4"
          >
            <div className="lg:col-span-3">
              {user?.isVisitor ? (
                <ValidatorActivities pings={pings} userId={user.id} />
              ) : (
                <PingQueue pings={pings} websites={websites} userId={user.id} onPingAccepted={handleDataRefresh} />
              )}
            </div>
            <div className="space-y-6">
              <WalletBalanceWidget />
              <RecentActivity websites={websites} pings={pings} user={user} />
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
            className="grid gap-6 lg:grid-cols-4"
          >
            <div className="lg:col-span-3">
              <WebsiteList
                websites={websites}
                setWebsites={setWebsites}
                onWebsiteAdded={handleDataRefresh}
                onWebsiteDeleted={handleDataRefresh}
              />
            </div>
            <div className="space-y-6">
              <WalletBalanceWidget />
              <RecentActivity websites={websites} pings={pings} user={user} />
            </div>
          </motion.div>
        )
    }
  }

  // Show loading while auth is loading
  if (authLoading) {
    return <LoadingSpinner />
  }

  // Show authentication required if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to access your dashboard.</p>
              <Button onClick={() => (window.location.href = "/")} className="w-full">
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
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader currentView={currentView} onNavigate={handleNavigation} />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Failed to Load Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadDashboardData} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <DashboardHeader currentView={currentView} onNavigate={handleNavigation} />

        <main className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {renderCurrentView()}
          </motion.div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
