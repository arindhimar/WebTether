"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Activity, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react"
import AvailableSites from "./AvailableSites"

export default function PingQueue({ pings = [], websites = [], userId, onPingAccepted }) {
  const [recentPings, setRecentPings] = useState([])

  useEffect(() => {
    // Filter pings for the current user and sort by most recent
    const userPings = pings
      .filter((ping) => ping.uid === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 15) // Show last 15 pings

    setRecentPings(userPings)
  }, [pings, userId])

  const getStatusIcon = (isUp) => {
    return isUp ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusBadge = (isUp) => {
    return isUp ? (
      <Badge className="status-success text-xs px-2 py-1">Success</Badge>
    ) : (
      <Badge className="status-error text-xs px-2 py-1">Failed</Badge>
    )
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

  const getWebsiteUrl = (wid) => {
    const website = websites.find((w) => w.wid === wid)
    return website ? website.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : "Unknown Website"
  }

  return (
    <div className="space-y-8">
      {/* Available Sites for Pinging */}
      <AvailableSites onPingAccepted={onPingAccepted} />

      {/* Recent Ping History */}
      <Card className="modern-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Validation History
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your recent ping validation results and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentPings.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-950/20 dark:to-green-950/20 flex items-center justify-center mb-6">
                <Activity className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">No Validation History</h3>
              <p className="text-muted-foreground">
                Start validating websites above to see your ping history and earnings here.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {recentPings.map((ping, index) => (
                  <div
                    key={ping.pid || index}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">{getStatusIcon(ping.is_up)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate mb-1">{getWebsiteUrl(ping.wid)}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{ping.latency_ms}ms</span>
                          </div>
                          <span>{formatTimeAgo(ping.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(ping.is_up)}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                          <TrendingUp className="h-3 w-3" />
                          +0.001 ETH
                        </div>
                        {ping.tx_hash && (
                          <div className="text-xs text-muted-foreground font-mono truncate max-w-24">
                            {ping.tx_hash}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
