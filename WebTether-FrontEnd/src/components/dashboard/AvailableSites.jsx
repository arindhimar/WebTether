"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { pingAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../hooks/use-toast"
import {
  Globe,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Clock,
  Coins,
  AlertCircle,
  ExternalLink,
  Calendar,
  Tag,
} from "lucide-react"

// Import the utility at the top
import { hasValidReplitAgent, debugReplitAgent } from "../../utils/replitAgent.js"

export function AvailableSites({ pings, onPingAccepted }) {
  const [availableSites, setAvailableSites] = useState([])
  const [filteredSites, setFilteredSites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [acceptingPing, setAcceptingPing] = useState(null)

  const { user } = useAuth()
  const { toast } = useToast()

  // Replace the hasReplitAgent check
  const hasReplitAgent = hasValidReplitAgent(user)

  useEffect(() => {
    if (user) {
      debugReplitAgent(user)
    }
    loadAvailableSites()
  }, [user])

  useEffect(() => {
    filterAndSortSites()
  }, [availableSites, searchTerm, categoryFilter, sortBy, pings])

  const loadAvailableSites = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const sites = await pingAPI.getAvailableSites()
      setAvailableSites(sites)
    } catch (error) {
      console.error("Error loading available sites:", error)
      setError(error.message)
      toast({
        title: "Error Loading Sites",
        description: "Failed to load available sites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortSites = () => {
    let filtered = [...availableSites]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (site) =>
          site.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (site.category && site.category.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      if (categoryFilter === "uncategorized") {
        filtered = filtered.filter((site) => !site.category)
      } else {
        filtered = filtered.filter((site) => site.category === categoryFilter)
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at)
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at)
        case "alphabetical":
          return a.url.localeCompare(b.url)
        case "category":
          return (a.category || "").localeCompare(b.category || "")
        default:
          return 0
      }
    })

    setFilteredSites(filtered)
  }

  const handlePingSite = async (site) => {
    if (!hasReplitAgent) {
      toast({
        title: "Replit Agent Required",
        description: "Please configure your Replit agent in settings to ping websites.",
        variant: "destructive",
      })
      return
    }

    setAcceptingPing(site.wid)

    try {
      const result = await pingAPI.manualPing(user.id, site.wid, site.url)

      const isUp = result.result?.is_up || false
      const latency = result.result?.latency_ms || null
      const reward = Math.floor(Math.random() * 5) + 3 // 3-7 coins

      toast({
        title: "Ping Completed!",
        description: `${getSiteName(site.url)} ${isUp ? "is online" : "is offline"}${latency ? ` (${latency}ms)` : ""}. You earned ${reward} coins!`,
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

  const getSiteName = (url) => {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "")
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

  const getRecentPingStatus = (site) => {
    const sitePings = pings.filter((ping) => ping.wid === site.wid && ping.uid === user.id)
    const recentPing = sitePings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

    if (!recentPing) return null

    const pingDate = new Date(recentPing.created_at)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)

    if (pingDate > hourAgo) {
      return {
        recently: true,
        status: recentPing.is_up ? "up" : "down",
        time: formatTimeAgo(recentPing.created_at),
      }
    }

    return null
  }

  const getUniqueCategories = () => {
    const categories = availableSites
      .map((site) => site.category)
      .filter(Boolean)
      .filter((category, index, arr) => arr.indexOf(category) === index)
    return categories.sort()
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold mb-2">Loading Available Sites</h3>
        <p className="text-muted-foreground">Fetching websites you can ping...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Sites</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadAvailableSites} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Available Sites</h1>
          <p className="text-muted-foreground">Browse and ping websites from other users to earn rewards</p>
        </div>
        <Button onClick={loadAvailableSites} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Replit Agent Status */}
      {!hasReplitAgent && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">Replit Agent Required</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Configure your Replit agent in settings to start pinging websites and earning rewards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search websites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {getUniqueCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              {filteredSites.length} sites available
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sites Grid */}
      {filteredSites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sites Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "No websites are currently available for pinging."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSites.map((site, index) => {
            const recentPing = getRecentPingStatus(site)
            const siteName = getSiteName(site.url)

            return (
              <motion.div
                key={site.wid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate" title={siteName}>
                          {siteName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          Added {formatTimeAgo(site.created_at)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(site.url, "_blank")}
                        className="shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {site.category && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {site.category}
                        </Badge>
                      )}
                      {recentPing && (
                        <Badge variant={recentPing.status === "up" ? "default" : "destructive"} className="text-xs">
                          Recently pinged: {recentPing.status}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-amber-500" />
                          <span>3-7 coins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span>JWT Auth</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handlePingSite(site)}
                        disabled={acceptingPing === site.wid || !hasReplitAgent || (recentPing && recentPing.recently)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                      >
                        {acceptingPing === site.wid ? (
                          <>
                            <Zap className="h-3 w-3 mr-1 animate-pulse" />
                            Pinging...
                          </>
                        ) : recentPing && recentPing.recently ? (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Cooldown
                          </>
                        ) : (
                          "Ping Site"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
