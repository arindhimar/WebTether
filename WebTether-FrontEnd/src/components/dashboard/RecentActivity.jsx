"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Activity, Clock, Globe, CheckCircle, XCircle, TrendingUp } from "lucide-react"

export default function RecentActivity({ websites = [], pings = [], user }) {
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    generateRecentActivities()
  }, [websites, pings, user])

  const generateRecentActivities = () => {
    const activities = []

    // Add recent pings
    const recentPings = pings
      .filter((ping) => (user?.isVisitor ? ping.uid === user.id : websites.some((w) => w.wid === ping.wid)))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8)

    recentPings.forEach((ping) => {
      const website = websites.find((w) => w.wid === ping.wid)
      activities.push({
        id: `ping-${ping.pid}`,
        type: "ping",
        title: user?.isVisitor ? "Validation Completed" : "Site Pinged",
        description: website
          ? `${website.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} responded in ${ping.latency_ms}ms`
          : "Unknown website",
        timestamp: ping.created_at,
        status: ping.is_up ? "success" : "failed",
        icon: ping.is_up ? CheckCircle : XCircle,
        color: ping.is_up ? "text-emerald-500" : "text-red-500",
        bgColor: ping.is_up ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20",
        earnings: user?.isVisitor ? "0.001 ETH" : null,
      })
    })

    // Add website additions (for website owners)
    if (!user?.isVisitor) {
      websites
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3)
        .forEach((website) => {
          activities.push({
            id: `website-${website.wid}`,
            type: "website",
            title: "Website Added",
            description: website.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
            timestamp: website.created_at,
            status: "info",
            icon: Globe,
            color: "text-violet-500",
            bgColor: "bg-violet-50 dark:bg-violet-950/20",
          })
        })
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    setRecentActivities(activities.slice(0, 10))
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <Badge className="status-success text-xs px-2 py-1">Success</Badge>
      case "failed":
        return <Badge className="status-error text-xs px-2 py-1">Failed</Badge>
      case "info":
        return <Badge className="status-info text-xs px-2 py-1">Added</Badge>
      default:
        return <Badge className="status-warning text-xs px-2 py-1">Unknown</Badge>
    }
  }

  return (
    <Card className="modern-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          Activity Feed
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Latest updates and validations • {recentActivities.length} recent items
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950/20 dark:to-cyan-950/20 flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              {user?.isVisitor
                ? "Start validating websites to see activity here."
                : "Add websites and monitor their uptime to see activity."}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-border/50 bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all duration-200"
                  >
                    <div className={`p-2 rounded-xl ${activity.bgColor} flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-foreground">{activity.title}</h4>
                        {getStatusBadge(activity.status)}
                      </div>

                      <p className="text-sm text-muted-foreground truncate mb-2">{activity.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                        </div>

                        {activity.earnings && (
                          <div className="flex items-center gap-1 text-xs">
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-600 font-semibold">+{activity.earnings}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
