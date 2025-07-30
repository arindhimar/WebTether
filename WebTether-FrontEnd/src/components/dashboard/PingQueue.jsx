"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Clock, Coins, Globe, Zap, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { pingAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
// Import the utility at the top
import { hasValidReplitAgent, debugReplitAgent } from "../../utils/replitAgent.js"

export function PingQueue({ pings, websites, userId, onPingAccepted }) {
  const [acceptingPing, setAcceptingPing] = useState(null)
  const [availableSites, setAvailableSites] = useState([])
  const [isLoadingSites, setIsLoadingSites] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Replace the hasReplitAgent check
  const hasReplitAgent = hasValidReplitAgent(user)

  // Load available sites for pinging
  // Add debug logging in useEffect
  useEffect(() => {
    if (user) {
      debugReplitAgent(user)
    }
    loadAvailableSites()
  }, [user])

  const loadAvailableSites = async () => {
    if (!user?.isVisitor) return // Only validators can ping sites

    setIsLoadingSites(true)
    setError(null)

    try {
      const sites = await pingAPI.getAvailableSites()
      setAvailableSites(sites)
    } catch (error) {
      console.error("Error loading available sites:", error)
      setError(error.message)
      toast({
        title: "Error Loading Sites",
        description: "Failed to load available sites for pinging. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSites(false)
    }
  }

  // Generate ping requests from available sites
  const availablePingRequests = useMemo(() => {
    if (!availableSites.length) return []

    return availableSites
      .filter((site) => {
        // Filter out sites that have been pinged recently (last hour)
        const recentPings = pings.filter((ping) => {
          const pingDate = new Date(ping.created_at)
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
          return ping.wid === site.wid && pingDate > hourAgo && ping.uid === userId
        })
        return recentPings.length === 0
      })
      .slice(0, 8) // Limit to 8 requests
      .map((site, index) => ({
        id: `ping-${site.wid}`,
        wid: site.wid,
        url: site.url,
        name: site.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        category: site.category,
        requestedBy: "System",
        reward: Math.floor(Math.random() * 5) + 3, // 3-7 coins
        priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        timeLeft: 300 + index * 120, // Different time limits
        requiresReplit: true, // All pings now use Replit agents
        createdAt: site.created_at,
      }))
  }, [availableSites, pings, userId])

  const handleAcceptPing = async (pingRequest) => {
    if (!hasReplitAgent) {
      toast({
        title: "Replit Agent Required",
        description: "Please configure your Replit agent in settings to accept ping requests.",
        variant: "destructive",
      })
      return
    }

    setAcceptingPing(pingRequest.id)

    try {
      // Use the manual ping endpoint
      const result = await pingAPI.manualPing(userId, pingRequest.wid, pingRequest.url)

      const isUp = result.result?.is_up || false
      const latency = result.result?.latency_ms || null

      toast({
        title: "Ping Completed!",
        description: `Website ${pingRequest.name} ${isUp ? "is online" : "is offline"}${latency ? ` (${latency}ms)` : ""}. You earned ${pingRequest.reward} coins!`,
      })

      // Trigger refresh of dashboard data
      if (onPingAccepted) {
        onPingAccepted()
      }

      // Refresh available sites
      loadAvailableSites()
    } catch (error) {
      console.error("Error accepting ping:", error)

      let errorMessage = "Failed to complete ping validation. Please try again."
      if (error.message.includes("not linked a Replit agent")) {
        errorMessage = "Please configure your Replit agent in settings first."
      }

      toast({
        title: "Ping Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setAcceptingPing(null)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const formatTimeLeft = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return "Recently added"
  }

  return (
    <div className="space-y-6">
      {/* Replit Agent Status */}
      {!hasReplitAgent && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">Replit Agent Required</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Configure your Replit agent with your JWT token in settings to start accepting ping requests and
                  earning rewards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ping Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <CardTitle>Available Ping Requests</CardTitle>
              {hasReplitAgent && <Zap className="h-4 w-4 text-green-500" title="Replit Agent Connected" />}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAvailableSites}
              disabled={isLoadingSites}
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingSites ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Accept ping requests to earn coins by validating website uptime using your Replit agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSites ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading available sites...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Sites</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadAvailableSites} variant="outline">
                Try Again
              </Button>
            </div>
          ) : availablePingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No ping requests available</h3>
              <p className="text-muted-foreground mb-4">
                {availableSites.length === 0
                  ? "No websites are currently available for pinging."
                  : "You've recently pinged all available sites. Check back later for new opportunities."}
              </p>
              <Button onClick={loadAvailableSites} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh List
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {availablePingRequests.map((ping, index) => (
                <motion.div
                  key={ping.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{ping.name}</h4>
                      <Badge variant={getPriorityColor(ping.priority)}>{ping.priority}</Badge>
                      {ping.category && (
                        <Badge variant="outline" className="text-xs">
                          {ping.category}
                        </Badge>
                      )}
                      {ping.requiresReplit && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          JWT Auth
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{ping.url}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {formatTimeAgo(ping.createdAt)} • Requested by {ping.requestedBy}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Coins className="h-4 w-4" />
                        <span className="font-semibold">{ping.reward}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeLeft(ping.timeLeft)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAcceptPing(ping)}
                      disabled={acceptingPing === ping.id || !hasReplitAgent}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                    >
                      {acceptingPing === ping.id ? (
                        <>
                          <Zap className="h-3 w-3 mr-1 animate-pulse" />
                          Pinging...
                        </>
                      ) : (
                        "Accept"
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
