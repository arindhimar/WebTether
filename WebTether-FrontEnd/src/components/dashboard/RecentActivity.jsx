"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { Activity, CheckCircle, XCircle } from "lucide-react"

export default function RecentActivity({ websites = [], pings = [], user }) {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  console.log("RecentActivity - Props received:", {
    websites: websites.length,
    pings: pings.length,
    user: user?.id,
    isVisitor: user?.isVisitor,
    pingsData: pings.slice(0, 2), // Show first 2 for debugging
  })

  useEffect(() => {
    if (user && (websites.length > 0 || pings.length > 0)) {
      generateActivities()
    }
  }, [websites, pings, user])

  const generateActivities = () => {
    console.log("RecentActivity - Starting to generate activities...")
    setIsLoading(true)

    try {
      let userActivities = []

      if (user?.isVisitor) {
        console.log("RecentActivity - Processing validator activities...")
        // Validator activities - show recent pings they performed
        const userPings = pings
          .filter((ping) => {
            const matches = ping.checked_by_uid === user.id
            console.log(
              `RecentActivity - Ping ${ping.pid}: checked_by_uid=${ping.checked_by_uid} vs user.id=${user.id} = ${matches}`,
            )
            return matches
          })
          .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))
          .slice(0, 10)

        console.log(`RecentActivity - Found ${userPings.length} validator pings`)

        userActivities = userPings.map((ping) => {
          // Try to find the website for this ping
          const website = websites.find((w) => w.wid === ping.wid)
          const websiteUrl = website?.url || website?.name || `Website ID: ${ping.wid}`

          const activity = {
            id: ping.pid,
            type: ping.is_up ? "ping_success" : "ping_failed",
            message: ping.is_up ? "Site validation successful" : "Site validation failed",
            timestamp: ping.timestamp || ping.created_at,
            url: websiteUrl,
            responseTime: ping.latency_ms,
            region: ping.region,
            txHash: ping.tx_hash,
            fee: ping.fee_paid_numeric || 0,
          }

          console.log("RecentActivity - Generated validator activity:", activity)
          return activity
        })
      } else {
        console.log("RecentActivity - Processing website owner activities...")
        // Website owner activities - show pings for their websites
        const userWebsites = websites.filter((website) => website.uid === user.id)
        console.log(`RecentActivity - Found ${userWebsites.length} user websites`)

        const websitePings = pings
          .filter((ping) => userWebsites.some((w) => w.wid === ping.wid))
          .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))
          .slice(0, 10)

        console.log(`RecentActivity - Found ${websitePings.length} website pings`)

        userActivities = websitePings.map((ping) => {
          const website = userWebsites.find((w) => w.wid === ping.wid)
          const activity = {
            id: ping.pid,
            type: ping.is_up ? "site_up" : "site_down",
            message: ping.is_up ? "Site is online" : "Site is offline",
            timestamp: ping.timestamp || ping.created_at,
            url: website?.url || website?.name || `Website ID: ${ping.wid}`,
            responseTime: ping.latency_ms,
            region: ping.region,
            txHash: ping.tx_hash,
          }

          console.log("RecentActivity - Generated website activity:", activity)
          return activity
        })
      }

      console.log(`RecentActivity - Final activities generated:`, userActivities)
      setActivities(userActivities)
    } catch (error) {
      console.error("RecentActivity - Error generating activities:", error)
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "ping_success":
      case "site_up":
        return <CheckCircle className="h-3 w-3 text-violet-600 dark:text-violet-400" />
      case "ping_failed":
      case "site_down":
        return <XCircle className="h-3 w-3 text-red-500 dark:text-red-400" />
      default:
        return <Activity className="h-3 w-3 text-violet-600 dark:text-violet-400" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case "ping_success":
      case "site_up":
        return "border-l-violet-500"
      case "ping_failed":
      case "site_down":
        return "border-l-red-500"
      default:
        return "border-l-violet-500"
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  console.log("RecentActivity - Render state:", {
    activitiesCount: activities.length,
    isLoading,
  })

  return (
    <Card className="floating-card">
      <CardContent className="p-0">
        <div className="p-3 sm:p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
              <Activity className="h-3 w-3 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Activity</h3>
              <p className="text-xs text-muted-foreground">Recent updates • {activities.length} items</p>
            </div>
          </div>
        </div>

        <div className="max-h-64 sm:max-h-80 overflow-y-auto mobile-scroll">
          {isLoading ? (
            <div className="p-3 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="h-3 w-3 rounded-full loading-shimmer flex-shrink-0 mt-1" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-full loading-shimmer" />
                    <Skeleton className="h-2 w-16 loading-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/20 dark:to-purple-950/20 flex items-center justify-center mb-2">
                <Activity className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-sm font-medium text-foreground mb-1">No Recent Activity</h4>
              <p className="text-xs text-muted-foreground">
                {user?.isVisitor
                  ? "Start validating sites to see activity."
                  : "Add websites to see monitoring activity."}
              </p>
              <div className="mt-4 text-xs bg-muted/50 p-3 rounded-lg">
                <p>
                  <strong>Debug Info:</strong>
                </p>
                <p>User ID: {user?.id}</p>
                <p>Is Visitor: {user?.isVisitor ? "Yes" : "No"}</p>
                <p>Total Pings: {pings.length}</p>
                <p>Websites: {websites.length}</p>
              </div>
            </div>
          ) : (
            <div className="p-2 sm:p-3 space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-2 p-2 rounded-lg border-l-2 ${getActivityColor(activity.type)} bg-muted/30 hover:bg-muted/50 transition-colors`}
                >
                  <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground truncate font-mono">
                          {activity.url.replace(/^https?:\/\//, "")}
                        </p>
                        {activity.region && (
                          <p className="text-xs text-violet-600 dark:text-violet-400">📍 {activity.region}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                        {activity.responseTime && (
                          <p className="text-xs text-muted-foreground">{activity.responseTime}ms</p>
                        )}
                        {activity.fee > 0 && (
                          <p className="text-xs text-purple-600 dark:text-purple-400">+{activity.fee.toFixed(4)} ETH</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
