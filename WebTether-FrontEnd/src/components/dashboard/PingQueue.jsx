"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Clock, Coins, Globe } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { pingAPI } from "../../services/api"

export function PingQueue({ pings, websites, userId, onPingAccepted }) {
  const [acceptingPing, setAcceptingPing] = useState(null)
  const { toast } = useToast()

  // Generate mock ping requests for demonstration
  // In a real app, this would come from your backend
  const mockPingRequests = useMemo(() => {
    return websites
      .filter((website) => {
        // Show websites that haven't been pinged recently
        const recentPings = pings.filter((ping) => {
          const pingDate = new Date(ping.created_at)
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
          return ping.wid === website.wid && pingDate > hourAgo
        })
        return recentPings.length === 0
      })
      .slice(0, 5) // Limit to 5 requests
      .map((website, index) => ({
        id: `mock-${website.wid}`,
        wid: website.wid,
        url: website.url,
        requestedBy: "System",
        reward: Math.floor(Math.random() * 5) + 3, // 3-7 coins
        priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        timeLeft: 300 + index * 120, // Different time limits
      }))
  }, [websites, pings])

  const handleAcceptPing = async (pingRequest) => {
    setAcceptingPing(pingRequest.id)

    try {
      // Simulate ping validation
      const isUp = Math.random() > 0.2 // 80% chance of being up
      const latency = isUp ? Math.floor(Math.random() * 200) + 50 : null

      await pingAPI.createPing(
        pingRequest.wid,
        isUp,
        latency,
        "US-East", // Default region
        userId,
      )

      toast({
        title: "Ping Completed!",
        description: `Website ${isUp ? "is online" : "is offline"}. You earned ${pingRequest.reward} coins!`,
      })

      // Trigger refresh of dashboard data
      if (onPingAccepted) {
        onPingAccepted()
      }
    } catch (error) {
      console.error("Error accepting ping:", error)
      toast({
        title: "Ping Failed",
        description: "Failed to complete ping validation. Please try again.",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Available Ping Requests
        </CardTitle>
        <CardDescription>Accept ping requests to earn coins by validating website uptime</CardDescription>
      </CardHeader>
      <CardContent>
        {mockPingRequests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ping requests available</h3>
            <p className="text-muted-foreground">Check back later for new validation opportunities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockPingRequests.map((ping, index) => (
              <motion.div
                key={ping.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{ping.url}</h4>
                    <Badge variant={getPriorityColor(ping.priority)}>{ping.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Requested by {ping.requestedBy}</p>
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
                    disabled={acceptingPing === ping.id}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {acceptingPing === ping.id ? "Pinging..." : "Accept"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
