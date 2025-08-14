"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Coins, TrendingUp, TrendingDown } from "lucide-react"

export function EarningsChart({ data = [], title = "Earnings Overview", className }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate mock earnings data
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toISOString().split("T")[0],
          earnings: Math.random() * 0.01 + 0.001,
          validations: Math.floor(Math.random() * 20) + 5,
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
        }
      })
    }
    return data
  }, [data])

  const stats = useMemo(() => {
    const totalEarnings = chartData.reduce((sum, day) => sum + day.earnings, 0)
    const totalValidations = chartData.reduce((sum, day) => sum + day.validations, 0)
    const avgDaily = totalEarnings / chartData.length

    const trend =
      chartData.length > 1
        ? ((chartData[chartData.length - 1].earnings - chartData[0].earnings) / chartData[0].earnings) * 100
        : 0

    return {
      total: totalEarnings,
      validations: totalValidations,
      avgDaily,
      trend: Math.round(trend * 10) / 10,
    }
  }, [chartData])

  const maxEarnings = Math.max(...chartData.map((d) => d.earnings))

  const getBarHeight = (earnings) => {
    return (earnings / maxEarnings) * 100
  }

  return (
    <Card className={`modern-card ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Coins className="h-5 w-5 text-amber-600" />
              {title}
            </CardTitle>
            <CardDescription>Last 7 days validator earnings</CardDescription>
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
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.total.toFixed(4)}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400">Total ETH</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.validations}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400">Validations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.avgDaily.toFixed(4)}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400">Daily Avg</div>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <div className="flex items-end justify-between h-32 gap-2">
            {chartData.map((day, index) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative w-full flex items-end h-24">
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-300 hover:from-amber-600 hover:to-amber-500 animate-scale-in"
                    style={{ height: `${Math.max(getBarHeight(day.earnings), 5)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">{day.day}</div>
                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.earnings.toFixed(4)} ETH
                </div>
              </div>
            ))}
          </div>

          {/* USD Conversion */}
          <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl">
            <div className="text-sm text-green-700 dark:text-green-300">
              Total USD Value: <span className="font-bold">${(stats.total * 2000).toFixed(2)}</span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">Based on current ETH price (~$2,000)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
