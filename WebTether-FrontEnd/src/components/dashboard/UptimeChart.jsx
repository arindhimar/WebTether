"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp } from "lucide-react"

export function UptimeChart({ websites, pings }) {
  const uptimeData = useMemo(() => {
    // Generate uptime data for the last 7 days
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const now = new Date()

    return days.map((day, index) => {
      const dayDate = new Date(now)
      dayDate.setDate(now.getDate() - (6 - index))

      // Calculate uptime for this day across all websites
      let totalUptime = 0
      let websiteCount = 0

      websites.forEach((website) => {
        const websitePings = pings.filter((ping) => {
          const pingDate = new Date(ping.created_at)
          return ping.wid === website.wid && pingDate.toDateString() === dayDate.toDateString()
        })

        if (websitePings.length > 0) {
          const upPings = websitePings.filter((ping) => ping.is_up)
          const uptime = (upPings.length / websitePings.length) * 100
          totalUptime += uptime
          websiteCount++
        }
      })

      const averageUptime = websiteCount > 0 ? totalUptime / websiteCount : 100

      return {
        day,
        uptime: Math.round(averageUptime * 10) / 10,
      }
    })
  }, [websites, pings])

  const maxUptime = 100
  const weeklyAverage = uptimeData.reduce((sum, d) => sum + d.uptime, 0) / uptimeData.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Weekly Uptime
        </CardTitle>
        <CardDescription>Average uptime across all websites</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {uptimeData.map((data, index) => (
            <div key={data.day} className="flex items-center justify-between">
              <span className="text-sm font-medium w-8">{data.day}</span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(data.uptime / maxUptime) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right">{data.uptime.toFixed(1)}%</span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Average this week:</span>
            <span className="font-semibold text-green-600">{weeklyAverage.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
