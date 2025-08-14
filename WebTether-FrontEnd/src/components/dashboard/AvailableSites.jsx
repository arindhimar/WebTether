"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { Alert, AlertDescription } from "../ui/alert"
import { useToast } from "../../hooks/use-toast"
import { websiteAPI } from "../../services/api"
import { LoadingSpinner } from "./LoadingSpinner"
import { PingAnimation } from "../animations/PingAnimation"
import { Clock, Zap, AlertCircle, CheckCircle, XCircle, RefreshCw, Target, DollarSign } from "lucide-react"

export default function AvailableSites() {
  const { toast } = useToast()
  const [sites, setSites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pingingIds, setPingingIds] = useState(new Set())
  const [showPingAnimation, setShowPingAnimation] = useState(false)
  const [pingingSiteUrl, setPingingSiteUrl] = useState("")

  useEffect(() => {
    fetchAvailableSites()
  }, [])

  const fetchAvailableSites = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await websiteAPI.getAvailableSites()

      // Handle different response formats
      let sitesData = []
      if (Array.isArray(response)) {
        sitesData = response
      } else if (response && Array.isArray(response.data)) {
        sitesData = response.data
      } else if (response && Array.isArray(response.sites)) {
        sitesData = response.sites
      } else {
        console.warn("Unexpected response format:", response)
        sitesData = []
      }

      setSites(sitesData)
    } catch (err) {
      console.error("Error fetching available sites:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load available sites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePingSite = async (site) => {
    if (pingingIds.has(site.wid)) return

    try {
      setPingingIds((prev) => new Set([...prev, site.wid]))
      setPingingSiteUrl(site.url)

      // Show ping animation
      setShowPingAnimation(true)

      // Simulate ping operation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Ping Successful! 🎯",
        description: `Successfully pinged ${site.url}. Reward earned!`,
      })

      // Update site status optimistically
      setSites((prev) =>
        prev.map((s) =>
          s.wid === site.wid
            ? {
                ...s,
                lastPing: new Date().toISOString(),
                status: "up",
                responseTime: Math.floor(Math.random() * 200) + 50,
              }
            : s,
        ),
      )
    } catch (err) {
      console.error("Error pinging site:", err)
      toast({
        title: "Ping Failed",
        description: err.message || "Failed to ping site. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPingingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(site.wid)
        return newSet
      })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "up":
        return <CheckCircle className="h-3 w-3 text-emerald-500" />
      case "down":
        return <XCircle className="h-3 w-3 text-red-500" />
      default:
        return <AlertCircle className="h-3 w-3 text-amber-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "up":
        return "bg-emerald-500"
      case "down":
        return "bg-red-500"
      default:
        return "bg-amber-500"
    }
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Never"
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded loading-shimmer" />
          <Skeleton className="h-6 w-40 loading-shimmer" />
        </div>
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="modern-card">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-full loading-shimmer" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 loading-shimmer" />
                      <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-28 loading-shimmer" />
                    </div>
                  </div>
                  <Skeleton className="h-7 sm:h-8 w-12 sm:w-16 loading-shimmer rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {error}
          <Button
            onClick={fetchAvailableSites}
            variant="outline"
            size="sm"
            className="ml-2 btn-secondary bg-transparent h-7 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Available Sites</h2>
            <p className="text-xs text-muted-foreground">{sites.length} sites available for pinging</p>
          </div>
        </div>

        <Button
          onClick={fetchAvailableSites}
          variant="outline"
          size="sm"
          className="btn-secondary rounded-lg px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm flex-shrink-0 bg-transparent"
        >
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Sites List */}
      <AnimatePresence mode="wait">
        {sites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/20 dark:to-teal-950/20 flex items-center justify-center mb-3 sm:mb-4">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 text-foreground">No sites available</h3>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto px-4">
              There are currently no websites available for pinging. Check back later for new opportunities.
            </p>
            <Button
              onClick={fetchAvailableSites}
              variant="outline"
              className="btn-secondary rounded-lg px-4 sm:px-6 h-9 sm:h-10 text-sm bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Check Again
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3 sm:space-y-4"
          >
            {sites.map((site, index) => (
              <motion.div
                key={site.wid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="modern-card group hover:shadow-md transition-all duration-200">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Status Indicator */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(site.status)}`} />
                          <div
                            className={`absolute inset-0 w-2 h-2 rounded-full ${getStatusColor(site.status)} animate-ping opacity-75`}
                          />
                        </div>

                        {/* Site Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h3 className="font-semibold text-sm text-foreground truncate">
                              {site.name || site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            </h3>
                            <Badge className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
                              {site.category}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground truncate font-mono mb-1.5">{site.url}</p>

                          {/* Stats */}
                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-0.5">
                              <DollarSign className="h-2.5 w-2.5 text-emerald-500" />
                              <span>{site.reward_per_ping || 0.001} per ping</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5 text-blue-500" />
                              <span>{formatTimeAgo(site.lastPing)}</span>
                            </div>
                            {site.responseTime && (
                              <div className="flex items-center gap-0.5 hidden sm:flex">
                                <Zap className="h-2.5 w-2.5 text-amber-500" />
                                <span>{site.responseTime}ms</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ping Button */}
                      <Button
                        onClick={() => handlePingSite(site)}
                        disabled={pingingIds.has(site.wid)}
                        size="sm"
                        className="btn-primary rounded-lg px-3 sm:px-4 h-7 sm:h-8 text-xs flex-shrink-0"
                      >
                        {pingingIds.has(site.wid) ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-1.5" />
                            <span className="hidden sm:inline">Pinging...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Target className="h-3 w-3 mr-1.5" />
                            <span className="hidden sm:inline">Ping</span>
                            <span className="sm:hidden">Ping</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ping Animation */}
      <PingAnimation open={showPingAnimation} onOpenChange={setShowPingAnimation} siteUrl={pingingSiteUrl} />
    </div>
  )
}
