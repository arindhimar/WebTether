"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { websiteAPI, pingAPI } from "../services/api"
import { DashboardHeader } from "../components/dashboard/DashboardHeader"
import { StatsOverview } from "../components/dashboard/StatsOverview"
import { WebsiteList } from "../components/dashboard/WebsiteList"
import { UptimeChart } from "../components/dashboard/UptimeChart"
import { ValidatorActivities } from "../components/dashboard/ValidatorActivities"
import  PingQueue  from "../components/dashboard/PingQueue"
import  AvailableSites  from "../components/dashboard/AvailableSites"
import UserSettings from "../components/dashboard/UserSettings"
import { useToast } from "../hooks/use-toast"

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [websites, setWebsites] = useState([])
  const [pings, setPings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState(user?.isVisitor ? "available-sites" : "websites")

  useEffect(() => {
    loadDashboardData()
  }, [user])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(true) // Silent refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  const loadDashboardData = async (silent = false) => {
    if (!user) return

    if (!silent) {
      setIsLoading(true)
      setError(null)
    }

    try {
      // Load websites and pings in parallel
      const [websitesResponse, pingsResponse] = await Promise.all([websiteAPI.getAllWebsites(), pingAPI.getAllPings()])

      // Filter websites by current user
      const userWebsites = websitesResponse.filter((website) => website.uid === user.id)

      // Process websites to add computed fields
      const processedWebsites = userWebsites.map((website) => {
        const websitePings = pingsResponse.filter((ping) => ping.wid === website.wid)
        const upPings = websitePings.filter((ping) => ping.is_up)
        
        // Fix uptime calculation - show "No data" if no pings yet
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
          uptimeValue: uptime, // Keep numeric value for calculations
          lastCheck: lastPing ? lastPing.created_at : website.created_at,
          responseTime: lastPing ? lastPing.latency_ms : null,
          category: website.category,
          pingCount: websitePings.length
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Error: {error}</p>
          <button onClick={loadDashboardData} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "websites":
        return (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <WebsiteList
                websites={websites}
                setWebsites={setWebsites}
                onWebsiteAdded={handleDataRefresh}
                onWebsiteDeleted={handleDataRefresh}
              />
            </div>
            <div className="space-y-6">
              <UptimeChart websites={websites} pings={pings} />
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
      
      case "settings":
        return <UserSettings />
      
      default:
        return (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <WebsiteList
                websites={websites}
                setWebsites={setWebsites}
                onWebsiteAdded={handleDataRefresh}
                onWebsiteDeleted={handleDataRefresh}
              />
            </div>
            <div className="space-y-6">
              <UptimeChart websites={websites} pings={pings} />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader currentView={currentView} onNavigate={handleNavigation} />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">
              {user?.isVisitor
                ? "Earn rewards by validating website uptime for the community using your Cloudflare Worker."
                : "Monitor your websites and track their uptime with our validator network."}
            </p>
          </div>

          {/* Stats Overview */}
          <StatsOverview websites={websites} pings={pings} user={user} />

          {/* Current View Content */}
          <div className="space-y-6">
            {renderCurrentView()}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
