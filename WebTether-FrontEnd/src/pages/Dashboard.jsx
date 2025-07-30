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
import { PingQueue } from "../components/dashboard/PingQueue"
import { AvailableSites } from "../components/dashboard/AvailableSites"
import { UserSettings } from "../components/dashboard/UserSettings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useToast } from "../hooks/use-toast"

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [websites, setWebsites] = useState([])
  const [pings, setPings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Load websites and pings in parallel
      const [websitesResponse, pingsResponse] = await Promise.all([websiteAPI.getAllWebsites(), pingAPI.getAllPings()])

      // Filter websites by current user
      const userWebsites = websitesResponse.filter((website) => website.uid === user.id)

      // Process websites to add computed fields
      const processedWebsites = userWebsites.map((website) => {
        const websitePings = pingsResponse.filter((ping) => ping.wid === website.wid)
        const upPings = websitePings.filter((ping) => ping.is_up)
        const uptime = websitePings.length > 0 ? (upPings.length / websitePings.length) * 100 : 100
        const lastPing = websitePings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

        return {
          id: website.wid,
          wid: website.wid,
          url: website.url,
          name: website.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
          status: lastPing ? (lastPing.is_up ? "up" : "down") : "unknown",
          uptime: Math.round(uptime * 10) / 10,
          lastCheck: lastPing ? lastPing.created_at : website.created_at,
          responseTime: lastPing ? lastPing.latency_ms : null,
          category: website.category,
        }
      })

      setWebsites(processedWebsites)
      setPings(pingsResponse)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setError(error.message)
      toast({
        title: "Error Loading Data",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

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
                ? "Earn rewards by validating website uptime for the community using your Replit agent."
                : "Monitor your websites and track their uptime with our validator network."}
            </p>
          </div>

          {/* Stats Overview */}
          <StatsOverview websites={websites} pings={pings} user={user} />

          {/* Main Content Tabs */}
          <Tabs defaultValue={user?.isVisitor ? "available-sites" : "websites"} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="websites">My Websites</TabsTrigger>
              <TabsTrigger value="available-sites">Available Sites</TabsTrigger>
              <TabsTrigger value="validator">{user?.isVisitor ? "My Activity" : "Ping Queue"}</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="websites" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <WebsiteList
                    websites={websites}
                    setWebsites={setWebsites}
                    onWebsiteAdded={loadDashboardData}
                    onWebsiteDeleted={loadDashboardData}
                  />
                </div>
                <div className="space-y-6">
                  <UptimeChart websites={websites} pings={pings} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="available-sites" className="space-y-6">
              <AvailableSites pings={pings} onPingAccepted={loadDashboardData} />
            </TabsContent>

            <TabsContent value="validator" className="space-y-6">
              {user?.isVisitor ? (
                <ValidatorActivities pings={pings} userId={user.id} />
              ) : (
                <PingQueue pings={pings} websites={websites} userId={user.id} onPingAccepted={loadDashboardData} />
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <UserSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
  