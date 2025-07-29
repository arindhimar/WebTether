"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { CheckCircle, XCircle, Clock, TrendingUp, Coins, Zap } from "lucide-react"

export function ValidatorActivities({ pings, userId }) {
  const userPings = useMemo(() => {
    return pings.filter((ping) => ping.uid === userId)
  }, [pings, userId])

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayPings = userPings.filter((ping) => new Date(ping.created_at).toDateString() === today)
    const successfulPings = userPings.filter((ping) => ping.is_up)
    const successRate = userPings.length > 0 ? ((successfulPings.length / userPings.length) * 100).toFixed(1) : 0
    const coinsEarned = userPings.length * 5 // Assuming 5 coins per ping
    const replitPings = userPings.filter((ping) => ping.replit_used)

    return {
      todayValidations: todayPings.length,
      successRate,
      coinsEarned,
      totalValidations: userPings.length,
      replitUsage: userPings.length > 0 ? ((replitPings.length / userPings.length) * 100).toFixed(1) : 0,
    }
  }, [userPings])

  const recentActivities = useMemo(() => {
    return userPings
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map((ping) => ({
        id: ping.pid,
        url: `Website ${ping.wid}`, // You might want to join with website data
        status: "completed",
        result: ping.is_up ? "up" : "down",
        reward: 5,
        timestamp: formatTimeAgo(ping.created_at),
        latency: ping.latency_ms,
        region: ping.region,
        replitUsed: ping.replit_used,
      }))
  }, [userPings])

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  const getStatusIcon = (status, result) => {
    if (status === "in-progress") return <Clock className="h-4 w-4 text-amber-500" />
    if (result === "up") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (result === "down") return <XCircle className="h-4 w-4 text-red-500" />
    return null
  }

  const getStatusBadge = (status, result) => {
    if (status === "in-progress") return <Badge variant="secondary">In Progress</Badge>
    if (result === "up") return <Badge variant="default">Site Up</Badge>
    if (result === "down") return <Badge variant="destructive">Site Down</Badge>
    return null
  }

  return (
    <div className="space-y-6">
      {/* Validator Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Validations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayValidations}</div>
            <p className="text-xs text-muted-foreground">Total: {stats.totalValidations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successRate >= 95 ? "Excellent" : stats.successRate >= 85 ? "Good" : "Needs improvement"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coins Earned</CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coinsEarned}</div>
            <p className="text-xs text-muted-foreground">Total earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replit Usage</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replitUsage}%</div>
            <p className="text-xs text-muted-foreground">Agent-powered pings</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Validation Activities</CardTitle>
          <CardDescription>Your latest website validation results using Replit agents</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No validation activities yet</h3>
              <p className="text-muted-foreground">Start validating websites to see your activity here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(activity.status, activity.result)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{activity.url}</h4>
                        {activity.replitUsed && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Replit
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{activity.timestamp}</span>
                        {activity.latency && <span>• {activity.latency}ms</span>}
                        {activity.region && <span>• {activity.region}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(activity.status, activity.result)}
                    <div className="text-right">
                      <div className="font-semibold text-amber-600">+{activity.reward} coins</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
