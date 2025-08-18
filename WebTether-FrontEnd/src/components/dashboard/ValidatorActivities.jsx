"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Activity, CheckCircle, XCircle, Clock, Coins, RefreshCw, ExternalLink, TrendingUp } from "lucide-react"
import { pingAPI } from "../../services/api"

export function ValidatorActivities({ pings = [], websites = [], user }) {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("ValidatorActivities - Props received:", {
      pingsCount: pings.length,
      websitesCount: websites.length,
      userId: user?.id,
      isVisitor: user?.isVisitor,
    })

    if (user && pings.length > 0) {
      generateActivitiesFromPings()
    }
  }, [pings, websites, user])

  const generateActivitiesFromPings = () => {
    console.log("ValidatorActivities - Generating activities from pings...")
    setIsLoading(true)

    try {
      // Filter pings for this validator (user who performed the ping)
      const validatorPings = pings.filter((ping) => {
        const matches = ping.checked_by_uid === user.id
        console.log(`Ping ${ping.pid}: checked_by_uid=${ping.checked_by_uid} vs user.id=${user.id} = ${matches}`)
        return matches
      })

      console.log(`ValidatorActivities - Found ${validatorPings.length} pings for validator ${user.id}`)

      // Sort by timestamp (newest first)
      const sortedPings = validatorPings.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.created_at)
        const timeB = new Date(b.timestamp || b.created_at)
        return timeB - timeA
      })

      // Convert pings to activities
      const generatedActivities = sortedPings.map((ping) => {
        // Try to find the website for this ping
        const website = websites.find((w) => w.wid === ping.wid)
        const websiteUrl = website?.url || website?.name || `Website ID: ${ping.wid}`

        const activity = {
          id: ping.pid,
          success: ping.is_up,
          responseTime: ping.latency_ms,
          timestamp: ping.timestamp || ping.created_at,
          txHash: ping.tx_hash,
          earnings: ping.fee_paid_numeric || 0,
          website: websiteUrl,
          region: ping.region,
          source: ping.source,
        }

        console.log("ValidatorActivities - Generated activity:", activity)
        return activity
      })

      console.log(`ValidatorActivities - Generated ${generatedActivities.length} activities:`, generatedActivities)
      setActivities(generatedActivities)
    } catch (error) {
      console.error("ValidatorActivities - Error generating activities:", error)
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    console.log("ValidatorActivities - Refreshing data...")
    setIsLoading(true)

    try {
      // Reload ping data
      const pingsResponse = await pingAPI.getAllPings()
      const pingsData = Array.isArray(pingsResponse) ? pingsResponse : pingsResponse.pings || []

      console.log("ValidatorActivities - Refreshed pings:", pingsData.length)

      // Trigger parent component to update
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent("refreshDashboardData"))
      }
    } catch (error) {
      console.error("ValidatorActivities - Error refreshing:", error)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
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
      console.error("ValidatorActivities - Error formatting time:", error)
      return "Unknown"
    }
  }

  const totalEarnings = activities.reduce((sum, activity) => sum + (activity.earnings || 0), 0)
  const successRate =
    activities.length > 0 ? ((activities.filter((a) => a.success).length / activities.length) * 100).toFixed(1) : 0

  console.log("ValidatorActivities - Render state:", {
    activitiesCount: activities.length,
    isLoading,
    totalEarnings,
    successRate,
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" />
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
              <Coins className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              {totalEarnings.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground">Total Earned (ETH)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-card-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
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
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <p>Loading validator activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No validator activities yet</p>
                <p className="text-sm">Start pinging websites to see your history here</p>
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
              activities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {activity.success ? (
                        <CheckCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-card-foreground truncate">{activity.website}</span>
                        {activity.website.startsWith("http") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(activity.website, "_blank")}
                            className="h-5 w-5 p-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{activity.responseTime}ms</span>
                        </div>
                        {activity.region && (
                          <div className="flex items-center gap-1">
                            <span className="text-violet-600 dark:text-violet-400">📍 {activity.region}</span>
                          </div>
                        )}
                        <div className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">{activity.txHash}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={activity.success ? "default" : "destructive"}
                      className={
                        activity.success
                          ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200 border-violet-200 dark:border-violet-800"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-800"
                      }
                    >
                      {activity.success ? "Success" : "Failed"}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium text-card-foreground">
                        {activity.earnings > 0 ? (
                          <span className="text-purple-600 dark:text-purple-400">
                            +{activity.earnings.toFixed(4)} ETH
                          </span>
                        ) : (
                          "0 ETH"
                        )}
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
                setActivities([])
                console.log("ValidatorActivities - Activities cleared")
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
  