"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { websiteAPI, pingAPI } from "../services/api"
import { DashboardHeader } from "../components/dashboard/DashboardHeader"
import { StatsOverview } from "../components/dashboard/StatsOverview"
import  WebsiteList  from "../components/dashboard/WebsiteList"
import RecentActivity  from "../components/dashboard/RecentActivity"
import { ValidatorActivities } from "../components/dashboard/ValidatorActivities"
import { PingQueue } from "../components/dashboard/PingQueue"
import AvailableSites from "../components/dashboard/AvailableSites"
import UserSettings from "../components/dashboard/UserSettings"
import { useToast } from "../hooks/use-toast"
import WalletPage from "./WalletPage"
import { WalletBalanceWidget } from "../components/WalletBalanceWidget"
import { Skeleton } from "../components/ui/skeleton"
import { Card, CardContent } from "../components/ui/card"
import { AlertCircle, RefreshCw, TrendingUp, Activity, Zap } from "lucide-react"
import { Button } from "../components/ui/button"

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
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <StatsOverview websites={websites} pings={pings} user={user} />
                <WebsiteList
                  websites={websites}
                  setWebsites={setWebsites}
                  onWebsiteAdded={handleDataRefresh}
                  onWebsiteDeleted={handleDataRefresh}
                  compact={true}
                />
              </div>
              <div className="space-y-4">
                <WalletBalanceWidget />
                <RecentActivity websites={websites} pings={pings} user={user} />
              </div>
            </div>
          </div>
        )

      case "websites":
        return (
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <WebsiteList
                websites={websites}
                setWebsites={setWebsites}
                onWebsiteAdded={handleDataRefresh}
                onWebsiteDeleted={handleDataRefresh}
              />
            </div>
            <div className="space-y-4">
              <WalletBalanceWidget />
              <RecentActivity websites={websites} pings={pings} user={user} />
            </div>
          </div>
        )

      case "available-sites":
        return <AvailableSites pings={pings} onPingAccepted={handleDataRefresh} />

      case "activity":
        return user?.isVisitor ? (
          <ValidatorActivities pings={pings} userId={user.id} />
        ) : (
          <PingQueue pings={pings} websites={websites} userId={user.id} onPingAccepted={handleDataRefresh} />
        )

      case "wallet":
        return <WalletPage />

      case "settings":
        return <UserSettings />

      default:
        return (
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <WebsiteList
                websites={websites}
                setWebsites={setWebsites}
                onWebsiteAdded={handleDataRefresh}
                onWebsiteDeleted={handleDataRefresh}
              />
            </div>
            <div className="space-y-4">
              <WalletBalanceWidget />
              <RecentActivity websites={websites} pings={pings} user={user} />
            </div>
          </div>
        )
    }
  }

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48 bg-muted" />
                <Skeleton className="h-4 w-64 bg-muted" />
              </div>
              <Skeleton className="h-16 w-64 bg-muted" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 bg-muted" />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 bg-muted" />
              </div>
              <Skeleton className="h-64 bg-muted" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication required if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
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
        <main className="container mx-auto px-4 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48 bg-muted" />
                <Skeleton className="h-4 w-64 bg-muted" />
              </div>
              <Skeleton className="h-16 w-64 bg-muted" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 bg-muted" />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 bg-muted" />
              </div>
              <Skeleton className="h-64 bg-muted" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader currentView={currentView} onNavigate={handleNavigation} />
        <main className="container mx-auto px-4 py-4">
          <Card className="max-w-md mx-auto bg-card border-border">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-card-foreground">Failed to Load Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={loadDashboardData}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader currentView={currentView} onNavigate={handleNavigation} />

      <main className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {user?.isVisitor ? "Validator Dashboard" : "Website Owner Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.isVisitor
                  ? "Earn ETH by validating website uptime across the network"
                  : "Monitor your websites and earn from validator pings"}
              </p>
            </div>

            <div className="flex gap-2">
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-2 text-center">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-800 dark:text-green-200">
                      {user?.isVisitor
                        ? `${pings.filter((p) => p.uid === user.id).length} Pings`
                        : `${websites.length} Sites`}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-2 text-center">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      {websites.filter((w) => w.status === "up").length} Online
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-2 text-center">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">Active</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {renderCurrentView()}
        </motion.div>
      </main>
    </div>
  )
}
