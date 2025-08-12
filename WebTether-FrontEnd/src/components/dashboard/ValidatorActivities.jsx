"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Activity, CheckCircle, XCircle, Clock, Coins, RefreshCw, ExternalLink, TrendingUp } from "lucide-react"

export function ValidatorActivities() {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load activities from localStorage and generate some if empty
  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = () => {
    const savedHistory = JSON.parse(localStorage.getItem("pingHistory") || "[]")

    if (savedHistory.length === 0) {
      // Generate some mock activities if none exist
      const mockActivities = generateMockActivities()
      setActivities(mockActivities)
      localStorage.setItem("pingHistory", JSON.stringify(mockActivities))
    } else {
      setActivities(savedHistory.slice(0, 20)) // Show last 20 activities
    }
  }

  const generateMockActivities = () => {
    const websites = [
      "https://google.com",
      "https://github.com",
      "https://stackoverflow.com",
      "https://reddit.com",
      "https://youtube.com",
    ]

    const activities = []
    const now = new Date()

    for (let i = 0; i < 15; i++) {
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000) // 5 minutes apart
      const success = Math.random() > 0.15 // 85% success rate
      const website = websites[Math.floor(Math.random() * websites.length)]
      const responseTime = Math.floor(Math.random() * 500) + 50
      const earnings = success ? 0.0001 : 0

      activities.push({
        id: `activity_${i}`,
        success,
        responseTime,
        timestamp: timestamp.toISOString(),
        txHash: `TX-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        earnings,
        website,
      })
    }

    return activities
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      loadActivities()
      setIsLoading(false)
    }, 1000)
  }

  const getTimeAgo = (timestamp) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 1) return "Just now"
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    } catch (error) {
      return "Unknown"
    }
  }

  const totalEarnings = activities.reduce((sum, activity) => sum + (activity.earnings || 0), 0)
  const successRate =
    activities.length > 0 ? ((activities.filter((a) => a.success).length / activities.length) * 100).toFixed(1) : 0

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Validator Activities
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Recent ping validation history and earnings
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-transparent border-border text-foreground hover:bg-accent"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-card-foreground flex items-center justify-center gap-1">
              <Coins className="w-4 h-4 text-yellow-600" />
              {totalEarnings.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">Total Earned (ETH)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-card-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              {successRate}%
            </div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-card-foreground">{activities.length}</div>
            <div className="text-xs text-muted-foreground">Total Pings</div>
          </div>
        </div>

        {/* Activities List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No validator activities yet</p>
                <p className="text-sm">Start pinging websites to see your history here</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {activity.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-card-foreground truncate">{activity.website}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(activity.website, "_blank")}
                          className="h-5 w-5 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{activity.responseTime}ms</span>
                        </div>
                        <div className="font-mono text-xs">{activity.txHash}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={activity.success ? "default" : "destructive"}
                      className={
                        activity.success ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" : ""
                      }
                    >
                      {activity.success ? "Success" : "Failed"}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium text-card-foreground">
                        {activity.earnings > 0 ? `+${activity.earnings.toFixed(4)} ETH` : "0 ETH"}
                      </div>
                      <div className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        {activities.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Clear history
                localStorage.removeItem("pingHistory")
                setActivities([])
              }}
              className="bg-transparent border-border text-foreground hover:bg-accent"
            >
              Clear History
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
