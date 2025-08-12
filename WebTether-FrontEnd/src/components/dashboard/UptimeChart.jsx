"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { TrendingUp, TrendingDown, Activity, Globe } from "lucide-react"

// Mock data generator for demonstration
const generateMockPingData = () => {
  const data = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate realistic ping data
    const totalPings = Math.floor(Math.random() * 100) + 50
    const successfulPings = Math.floor(totalPings * (0.85 + Math.random() * 0.14)) // 85-99% success rate
    const uptime = totalPings > 0 ? (successfulPings / totalPings) * 100 : 0

    data.push({
      date: date.toISOString().split("T")[0],
      totalPings,
      successfulPings,
      failedPings: totalPings - successfulPings,
      uptime: Math.round(uptime * 100) / 100,
      websites: Math.floor(Math.random() * 10) + 5,
    })
  }

  return data
}

export function UptimeChart() {
  const weeklyData = useMemo(() => {
    try {
      // In a real app, this would come from your API
      // For now, we'll use mock data
      return generateMockPingData()
    } catch (error) {
      console.error("Error generating uptime data:", error)
      // Return safe fallback data
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toISOString().split("T")[0],
          totalPings: 0,
          successfulPings: 0,
          failedPings: 0,
          uptime: 0,
          websites: 0,
        }
      })
    }
  }, [])

  const stats = useMemo(() => {
    if (!weeklyData || weeklyData.length === 0) {
      return {
        averageUptime: 0,
        totalPings: 0,
        totalWebsites: 0,
        trend: 0,
      }
    }

    const totalPings = weeklyData.reduce((sum, day) => sum + (day.totalPings || 0), 0)
    const totalSuccessful = weeklyData.reduce((sum, day) => sum + (day.successfulPings || 0), 0)
    const averageUptime = totalPings > 0 ? (totalSuccessful / totalPings) * 100 : 0
    const totalWebsites = Math.max(...weeklyData.map((day) => day.websites || 0))

    // Calculate trend (compare first half vs second half of week)
    const firstHalf = weeklyData.slice(0, 3)
    const secondHalf = weeklyData.slice(4, 7)

    const firstHalfAvg =
      firstHalf.length > 0 ? firstHalf.reduce((sum, day) => sum + (day.uptime || 0), 0) / firstHalf.length : 0
    const secondHalfAvg =
      secondHalf.length > 0 ? secondHalf.reduce((sum, day) => sum + (day.uptime || 0), 0) / secondHalf.length : 0

    const trend = secondHalfAvg - firstHalfAvg

    return {
      averageUptime: Math.round(averageUptime * 100) / 100,
      totalPings,
      totalWebsites,
      trend: Math.round(trend * 100) / 100,
    }
  }, [weeklyData])

  const maxPings = Math.max(...weeklyData.map((day) => day.totalPings || 0), 1)

  const getDayName = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "N/A"
      }
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } catch (error) {
      return "N/A"
    }
  }

  const getUptimeColor = (uptime) => {
    if (uptime >= 99) return "bg-green-500"
    if (uptime >= 95) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Weekly Uptime Overview
            </CardTitle>
            <CardDescription className="text-muted-foreground">Last 7 days performance metrics</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-background border-border text-foreground">
              <Globe className="h-3 w-3 mr-1" />
              {stats.totalWebsites} sites
            </Badge>
            <Badge
              variant={stats.trend >= 0 ? "default" : "destructive"}
              className={stats.trend >= 0 ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" : ""}
            >
              {stats.trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(stats.trend).toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-card-foreground">{stats.averageUptime.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Avg Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-card-foreground">{stats.totalPings.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Pings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-card-foreground">{stats.totalWebsites}</div>
              <div className="text-xs text-muted-foreground">Websites</div>
            </div>
          </div>

          {/* Daily Bars */}
          <div className="space-y-3">
            {weeklyData.map((day, index) => (
              <div key={day.date || index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{getDayName(day.date)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-card-foreground font-mono">{day.uptime?.toFixed(1) || "0.0"}%</span>
                    <span className="text-xs text-muted-foreground">
                      ({day.successfulPings || 0}/{day.totalPings || 0})
                    </span>
                  </div>
                </div>
                <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`${getUptimeColor(day.uptime || 0)} transition-all duration-300`}
                    style={{
                      width: `${Math.max(day.uptime || 0, 2)}%`,
                    }}
                  />
                  <div
                    className="bg-red-200 dark:bg-red-900"
                    style={{
                      width: `${Math.max(100 - (day.uptime || 0), 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Successful</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Degraded</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Failed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
