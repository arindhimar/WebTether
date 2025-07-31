"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { websiteAPI, pingAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../hooks/use-toast"
import { Globe, RefreshCw, Zap, Coins, AlertCircle, ExternalLink, Cloud } from "lucide-react"

import { hasValidCloudflareAgent } from "../../utils/cloudflareAgent"

export function PingQueue({ onPingAccepted }) {
  const [availableSites, setAvailableSites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [acceptingPing, setAcceptingPing] = useState(null)

  const { user } = useAuth()
  const { toast } = useToast()

  const hasCloudflareAgent = hasValidCloudflareAgent(user)

  useEffect(() => {
    loadAvailableSites()
  }, [])

  const loadAvailableSites = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const sites = await websiteAPI.getAvailableSites()
      // Show only first 5 sites for the queue
      setAvailableSites(sites.slice(0, 5))
    } catch (error) {
      console.error("Error loading available sites:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePingSite = async (site) => {
    if (!hasCloudflareAgent) {
      toast({
        title: "Cloudflare Worker Required",
        description: "Please configure your Cloudflare Worker in settings to ping websites.",
        variant: "destructive",
      })
      return
    }

    setAcceptingPing(site.wid)

    try {
      const result = await pingAPI.manualPing(user.id, site.wid, site.url)

      const isUp = result.result?.is_up || false
      const latency = result.result?.latency_ms || null
      const region = result.result?.region || "cloudflare-edge"
      const reward = Math.floor(Math.random() * 5) + 3 // 3-7 coins

      toast({
        title: "Ping Completed!",
        description: `${getSiteName(site.url)} ${isUp ? "is online" : "is offline"}${latency ? ` (${latency}ms)` : ""} from ${region}. You earned ${reward} coins!`,
      })

      // Trigger refresh of dashboard data
      if (onPingAccepted) {
        onPingAccepted()
      }

      // Refresh available sites
      loadAvailableSites()
    } catch (error) {
      console.error("Error pinging site:", error)

      let errorMessage = "Failed to ping website. Please try again."
      if (error.message.includes("not linked a Cloudflare Worker")) {
        errorMessage = "Please configure your Cloudflare Worker in settings first."
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

  const getSiteName = (url) => {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "")
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-orange-600" />
            Ping Queue
          </CardTitle>
          <CardDescription>Websites ready for validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading ping queue...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-orange-600" />
            Ping Queue
          </CardTitle>
          <CardDescription>Websites ready for validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadAvailableSites} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-600" />
              Ping Queue
            </CardTitle>
            <CardDescription>Websites ready for validation</CardDescription>
          </div>
          <Button onClick={loadAvailableSites} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasCloudflareAgent && (
          <div className="mb-4 p-3 border rounded-lg bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Configure your Cloudflare Worker in settings to start pinging websites.
              </p>
            </div>
          </div>
        )}

        {availableSites.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No websites available for pinging</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableSites.map((site, index) => {
              const siteName = getSiteName(site.url)

              return (
                <motion.div
                  key={site.wid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                      <Globe className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={siteName}>
                        {siteName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Coins className="h-3 w-3 text-amber-500" />
                          <span>3-7 coins</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Cloud className="h-3 w-3 text-orange-500" />
                          <span>CF Edge</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => window.open(site.url, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePingSite(site)}
                      disabled={acceptingPing === site.wid || !hasCloudflareAgent}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50"
                    >
                      {acceptingPing === site.wid ? (
                        <>
                          <Zap className="h-3 w-3 mr-1 animate-pulse" />
                          Pinging...
                        </>
                      ) : (
                        "Ping"
                      )}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
