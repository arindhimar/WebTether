"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { ScrollArea } from "../ui/scroll-area"
import { Activity, CheckCircle, XCircle, Globe, Zap, TrendingUp, Clock, Coins } from "lucide-react"

export default function RecentActivity({ websites = [], pings = [], user }) {
  const [recentActivities, setRecentActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (websites.length > 0 || pings.length > 0) {
      processRecentActivity()
    }
  }, [websites, pings, user])

  const processRecentActivity = () => {
    try {
      setIsLoading(true)

      const activities = []

      // Process recent pings
      const userPings = pings
        .filter((ping) =>
          user?.isVisitor ? ping.uid === user.id : ping.wid && websites.some((w) => w.wid === ping.wid),
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)

      userPings.forEach((ping) => {
        const website = websites.find((w) => w.wid === ping.wid)
        activities.push({
          id: `ping-${ping.pid}`,
          type: "ping",
          title: user?.isVisitor ? "Validation Completed" : "Website Pinged",
          description: website ? `${website.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}` : "Unknown website",
          status: ping.is_up ? "success" : "failed",
          timestamp: ping.created_at,
          metadata: {
            responseTime: ping.latency_ms,
            earnings: user?.isVisitor ? "0.001 ETH" : null,
            url: website?.url,
          },
        })
      })

      // Process website additions (for website owners)
      if (!user?.isVisitor) {
        websites
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .forEach((website) => {
            activities.push({
              id: `website-${website.wid}`,
              type: "website_added",
              title: "Website Added",
              description: website.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
              status: "info",
              timestamp: website.created_at,
              metadata: {
                category: website.category,
                url: website.url,
              },
            })
          })
      }

      // Sort all activities by timestamp
      const sortedActivities = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15)

      setRecentActivities(sortedActivities)
    } catch (error) {
      console.error("Error processing recent activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type, status) => {
    switch (type) {
      case "ping":
        return status === "success" ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )
      case "website_added":
        return <Globe className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Success
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Failed
          </Badge>
        )
      case "info":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Added
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Calculate quick stats
  const stats = {
    totalPings: pings.filter((p) => (user?.isVisitor ? p.uid === user.id : websites.some((w) => w.wid === p.wid)))
      .length,
    successfulPings: pings.filter(
      (p) => p.is_up && (user?.isVisitor ? p.uid === user.id : websites.some((w) => w.wid === p.wid)),
    ).length,
    totalEarnings: user?.isVisitor ? (pings.filter((p) => p.uid === user.id).length * 0.001).toFixed(3) : null,
  }

  const successRate = stats.totalPings > 0 ? Math.round((stats.successfulPings / stats.totalPings) * 100) : 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </div>
          <Badge variant="outline" className="text-xs">
            {recentActivities.length} items
          </Badge>
        </CardTitle>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" />
            <span>{stats.totalPings} pings</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{successRate}% success</span>
          </div>
          {user?.isVisitor && (
            <>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Coins className="h-3 w-3" />
                <span>{stats.totalEarnings} ETH</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                <span>{stats.successfulPings} successful</span>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              {user?.isVisitor
                ? "Start validating websites to see your activity here."
                : "Add websites or wait for validator pings to see activity."}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type, activity.status)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                      {getStatusBadge(activity.status)}
                    </div>

                    <p className="text-xs text-muted-foreground truncate mb-1">{activity.description}</p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(activity.timestamp)}</span>

                      {activity.metadata?.responseTime && (
                        <>
                          <span>•</span>
                          <span>{activity.metadata.responseTime}ms</span>
                        </>
                      )}

                      {activity.metadata?.earnings && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">+{activity.metadata.earnings}</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
