"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Timer, TrendingUp, TrendingDown } from "lucide-react"

export function ResponseTimeChart({ data = [], title = "Response Time", className }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate mock data
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        responseTime: Math.random() * 200 + 50,
        label: `${i.toString().padStart(2, "0")}:00`,
      }))
    }
    return data
  }, [data])

  const stats = useMemo(() => {
    const avgResponseTime = chartData.reduce((sum, point) => sum + point.responseTime, 0) / chartData.length
    const maxResponseTime = Math.max(...chartData.map((p) => p.responseTime))
    const minResponseTime = Math.min(...chartData.map((p) => p.responseTime))

    const trend = chartData.length > 1 ? chartData[chartData.length - 1].responseTime - chartData[0].responseTime : 0

    return {
      avg: Math.round(avgResponseTime),
      max: Math.round(maxResponseTime),
      min: Math.round(minResponseTime),
      trend: Math.round(trend),
    }
  }, [chartData])

  const maxValue = Math.max(...chartData.map((d) => d.responseTime))
  const minValue = Math.min(...chartData.map((d) => d.responseTime))

  const getResponseTimeColor = (responseTime) => {
    if (responseTime <= 100) return "bg-emerald-500"
    if (responseTime <= 200) return "bg-green-500"
    if (responseTime <= 500) return "bg-blue-500"
    if (responseTime <= 1000) return "bg-blue-500"
    return "bg-red-500"
  }

  const getLineHeight = (responseTime) => {
    const normalizedHeight = ((responseTime - minValue) / (maxValue - minValue)) * 100
    return Math.max(normalizedHeight, 5)
  }

  return (
    <Card className={`modern-card ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Timer className="h-5 w-5 text-blue-600" />
              {title}
            </CardTitle>
            <CardDescription>Last 24 hours average response time</CardDescription>
          </div>
          <Badge
            variant={stats.trend <= 0 ? "default" : "destructive"}
            className={stats.trend <= 0 ? "status-success" : "status-warning"}
          >
            {stats.trend <= 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
            {Math.abs(stats.trend)}ms
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.avg}ms</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.min}ms</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Best</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.max}ms</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Worst</div>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <div className="relative h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="responseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path
                d={`M 0 100 ${chartData
                  .map(
                    (point, index) =>
                      `L ${(index / (chartData.length - 1)) * 100} ${100 - getLineHeight(point.responseTime)}`,
                  )
                  .join(" ")} L 100 100 Z`}
                fill="url(#responseGradient)"
              />

              {/* Line */}
              <path
                d={`M 0 ${100 - getLineHeight(chartData[0]?.responseTime || 0)} ${chartData
                  .map(
                    (point, index) =>
                      `L ${(index / (chartData.length - 1)) * 100} ${100 - getLineHeight(point.responseTime)}`,
                  )
                  .join(" ")}`}
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="0.5"
                className="animate-fade-in"
              />

              {/* Data points */}
              {chartData.map((point, index) => (
                <circle
                  key={index}
                  cx={(index / (chartData.length - 1)) * 100}
                  cy={100 - getLineHeight(point.responseTime)}
                  r="0.8"
                  fill="rgb(59, 130, 246)"
                  className="hover:r-1.5 transition-all cursor-pointer"
                />
              ))}
            </svg>
          </div>

          {/* Time labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>

          {/* Performance indicators */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
              <span>Fast (&lt;100ms)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              <span>Average (100-500ms)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              <span>Slow (500-1000ms)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <span>Very Slow (&gt;1000ms)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
  