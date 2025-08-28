"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

export function UptimeChart({ data = [], title = "Uptime Overview", className }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate mock data for demonstration
      return Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return {
          date: date.toISOString().split("T")[0],
          uptime: Math.random() > 0.1 ? Math.random() * 20 + 80 : Math.random() * 50,
          pings: Math.floor(Math.random() * 50) + 10,
        }
      })
    }
    return data
  }, [data])

  const stats = useMemo(() => {
    const avgUptime = chartData.reduce((sum, day) => sum + day.uptime, 0) / chartData.length
    const totalPings = chartData.reduce((sum, day) => sum + day.pings, 0)
    const trend = chartData.length > 1 ? chartData[chartData.length - 1].uptime - chartData[0].uptime : 0

    return {
      avgUptime: Math.round(avgUptime * 10) / 10,
      totalPings,
      trend: Math.round(trend * 10) / 10,
    }
  }, [chartData])

  const maxUptime = Math.max(...chartData.map((d) => d.uptime))
  const minUptime = Math.min(...chartData.map((d) => d.uptime))

  const getUptimeColor = (uptime) => {
    if (uptime >= 99) return "bg-emerald-500"
    if (uptime >= 95) return "bg-green-500"
    if (uptime >= 90) return "bg-blue-500"
    if (uptime >= 80) return "bg-blue-500"
    return "bg-red-500"
  }

  const getBarHeight = (uptime) => {
    const normalizedHeight = ((uptime - minUptime) / (maxUptime - minUptime)) * 100
    return Math.max(normalizedHeight, 5) // Minimum 5% height for visibility
  }

  return (
    <Card className={`modern-card ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Activity className="h-5 w-5 text-violet-600" />
              {title}
            </CardTitle>
            <CardDescription>Last {chartData.length} days performance</CardDescription>
          </div>
          <Badge
            variant={stats.trend >= 0 ? "default" : "destructive"}
            className={stats.trend >= 0 ? "status-success" : "status-error"}
          >
            {stats.trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(stats.trend).toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">{stats.avgUptime}%</div>
            <div className="text-xs text-violet-600 dark:text-violet-400">Avg Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">
              {stats.totalPings.toLocaleString()}
            </div>
            <div className="text-xs text-violet-600 dark:text-violet-400">Total Checks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">{chartData.length}</div>
            <div className="text-xs text-violet-600 dark:text-violet-400">Days Tracked</div>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <div className="flex items-end justify-between h-32 gap-1 px-2">
            {chartData.map((day, index) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative w-full flex items-end h-24">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-80 ${getUptimeColor(day.uptime)}`}
                    style={{ height: `${getBarHeight(day.uptime)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.uptime.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>

          {/* Date labels */}
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            <span>{new Date(chartData[0]?.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <span>Today</span>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
              <span>Excellent (99%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span>Good (95%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              <span>Fair (90%+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <span>Poor</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
