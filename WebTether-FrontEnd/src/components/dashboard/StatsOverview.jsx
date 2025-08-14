"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { Alert, AlertDescription } from "../ui/alert"
import { useAuth } from "../../contexts/AuthContext"
import { websiteAPI, pingAPI } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import {
  Globe,
  TrendingUp,
  Clock,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  DollarSign,
} from "lucide-react"

export default function StatsOverview() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalWebsites: 0,
    activeWebsites: 0,
    totalPings: 0,
    totalEarnings: 0,
    uptime: "0%",
    avgResponseTime: "0ms",
    onlineWebsites: 0,
    offlineWebsites: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [websites, pings] = await Promise.all([websiteAPI.getAllWebsites(), pingAPI.getAllPings()])

      const userWebsites = websites.filter((website) => website.uid === user.id)
      const userPings = pings.filter((ping) => {
        const website = userWebsites.find((w) => w.wid === ping.wid)
        return website
      })

      // Calculate stats based on actual data
      const totalWebsites = userWebsites.length
      const activeWebsites = userWebsites.filter((w) => w.status === "active").length
      const onlineWebsites = userWebsites.filter((w) => w.status === "active").length
      const offlineWebsites = userWebsites.filter((w) => w.status === "down").length

      // Calculate uptime based on ping success rate
      const successfulPings = userPings.filter((p) => p.status === "success").length
      const totalPings = userPings.length
      const uptimePercentage = totalPings > 0 ? Math.round((successfulPings / totalPings) * 100) : 100

      // Calculate average response time
      const responseTimes = userPings
        .filter((p) => p.response_time && p.status === "success")
        .map((p) => Number.parseFloat(p.response_time))
      const avgResponseTime =
        responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0

      // Calculate total earnings
      const totalEarnings = userPings
        .filter((p) => p.status === "success")
        .reduce((total, ping) => {
          const website = userWebsites.find((w) => w.wid === ping.wid)
          return total + (website?.reward_per_ping || 0)
        }, 0)

      setStats({
        totalWebsites,
        activeWebsites,
        totalPings: totalPings,
        totalEarnings: Number.parseFloat(totalEarnings.toFixed(4)),
        uptime: `${uptimePercentage}%`,
        avgResponseTime: `${avgResponseTime}ms`,
        onlineWebsites,
        offlineWebsites,
      })
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load statistics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Websites",
      value: stats.totalWebsites,
      icon: Globe,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950/20",
      change: "+2 this week",
    },
    {
      title: "Active Sites",
      value: stats.activeWebsites,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950/20",
      change: `${stats.onlineWebsites} online`,
    },
    {
      title: "Total Pings",
      value: stats.totalPings.toLocaleString(),
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950/20",
      change: "Last 30 days",
    },
    {
      title: "Earnings",
      value: `$${stats.totalEarnings}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-950/20",
      change: "Total earned",
    },
    {
      title: "Uptime",
      value: stats.uptime,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950/20",
      change: "Average",
    },
    {
      title: "Response Time",
      value: stats.avgResponseTime,
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-950/20",
      change: "Average",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded loading-shimmer" />
          <Skeleton className="h-6 w-32 loading-shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="modern-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-20 loading-shimmer" />
                  <Skeleton className="h-5 w-5 rounded loading-shimmer" />
                </div>
                <Skeleton className="h-6 w-16 mb-1 loading-shimmer" />
                <Skeleton className="h-3 w-24 loading-shimmer" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
          <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Overview</h2>
          <p className="text-xs text-muted-foreground">Your website monitoring statistics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="modern-card hover:shadow-md transition-all duration-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</h3>
                  <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Status Summary */}
      {stats.totalWebsites > 0 && (
        <Card className="modern-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Website Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              <Badge className="status-success text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stats.onlineWebsites} Online
              </Badge>
              {stats.offlineWebsites > 0 && (
                <Badge className="status-error text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  {stats.offlineWebsites} Offline
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stats.uptime} Uptime
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
