"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { Clock, CheckCircle, XCircle, Globe, MapPin, Zap, Cloud, Activity } from "lucide-react"

export default function PingQueue() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [pings, setPings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPings()
    // Set up polling for real-time updates
    const interval = setInterval(fetchPings, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPings = async () => {
    try {
      const data = await api.getPings()
      // Sort by most recent first
      const sortedPings = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setPings(sortedPings.slice(0, 20)) // Show last 20 pings
    } catch (error) {
      console.error("Failed to fetch pings:", error)
      if (!loading) {
        // Don't show error on initial load
        toast({
          title: "Error",
          description: "Failed to load ping history",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusIcon = (isUp) => {
    return isUp ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (isUp) => {
    return (
      <Badge variant={isUp ? "default" : "destructive"} className="text-xs">
        {isUp ? "UP" : "DOWN"}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Ping Activity
          </CardTitle>
          <CardDescription>Loading ping history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Ping Activity
        </CardTitle>
        <CardDescription>Latest ping results from Cloudflare Workers across the network</CardDescription>
      </CardHeader>
      <CardContent>
        {pings.length === 0 ? (
          <div className="text-center py-8">
            <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ping Activity</h3>
            <p className="text-muted-foreground">
              No pings have been recorded yet. Start pinging websites to see activity here!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pings.map((ping) => (
              <div
                key={ping.pid}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(ping.is_up)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-3 w-3 text-gray-500" />
                      <span className="font-medium text-sm">Website ID: {ping.wid}</span>
                      {getStatusBadge(ping.is_up)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(ping.created_at)}
                      </span>
                      {ping.latency_ms && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {ping.latency_ms}ms
                        </span>
                      )}
                      {ping.region && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ping.region}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Cloud className="h-3 w-3" />
                    <span>Cloudflare Worker</span>
                  </div>
                  {ping.uid === user?.id && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Your ping
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Real-time Network Activity</p>
              <p className="text-blue-700">
                This shows ping results from all Cloudflare Workers in the WebTether network. Your pings help maintain
                global website monitoring coverage.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
