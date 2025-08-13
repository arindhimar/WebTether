"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Skeleton } from "../ui/skeleton"
import { Alert, AlertDescription } from "../ui/alert"
import { useToast } from "../../hooks/use-toast"
import { websiteAPI, api } from "../../services/api"
import { LoadingSpinner } from "./LoadingSpinner"
import {
  Globe,
  Search,
  Filter,
  Clock,
  TrendingUp,
  Zap,
  AlertCircle,
  RefreshCw,
  Coins,
  ExternalLink,
  Target,
  Activity,
  MapPin,
  Timer,
  Wifi,
  WifiOff,
} from "lucide-react"

export default function AvailableSites({ onPingAccepted }) {
  const [availableSites, setAvailableSites] = useState([])
  const [filteredSites, setFilteredSites] = useState([])
  const [pingsData, setPingsData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState([])
  const [pingingStates, setPingingStates] = useState({})
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterSites()
  }, [availableSites, searchTerm, selectedCategory])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch both available sites and pings data
      const [sites, pings] = await Promise.all([websiteAPI.getAvailableSites(), api.getPings()])

      setAvailableSites(sites)
      setPingsData(pings)

      // Extract unique categories from numeric category IDs
      const uniqueCategories = [...new Set(sites.map((site) => site.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } catch (err) {
      console.error("Error fetching data:", err)
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

  const filterSites = () => {
    let filtered = availableSites

    if (searchTerm) {
      filtered = filtered.filter(
        (site) =>
          site.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.category?.toString().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((site) => site.category?.toString() === selectedCategory)
    }

    setFilteredSites(filtered)
  }

  const getSiteStats = (wid) => {
    const sitePings = pingsData.filter((ping) => ping.wid === wid)
    if (sitePings.length === 0) {
      return {
        totalPings: 0,
        avgLatency: 0,
        uptime: 0,
        lastPing: null,
        lastStatus: "unknown",
        regions: [],
      }
    }

    const upPings = sitePings.filter((ping) => ping.is_up)
    const avgLatency = Math.round(sitePings.reduce((sum, ping) => sum + ping.latency_ms, 0) / sitePings.length)
    const uptime = Math.round((upPings.length / sitePings.length) * 100)
    const lastPing = sitePings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
    const regions = [...new Set(sitePings.map((ping) => ping.region))]

    return {
      totalPings: sitePings.length,
      avgLatency,
      uptime,
      lastPing,
      lastStatus: lastPing?.is_up ? "up" : "down",
      regions,
    }
  }

  const handlePing = async (site) => {
    try {
      setPingingStates((prev) => ({ ...prev, [site.wid]: true }))

      // Generate a fake transaction hash for simulation
      const txHash = `TX-${Date.now().toString().slice(-3)}`

      await api.manualPing({
        wid: site.wid,
        url: site.url,
        tx_hash: txHash,
      })

      toast({
        title: "Validation Successful! 🎉",
        description: `Successfully validated ${site.url}. You earned 0.0002 ETH!`,
        variant: "default",
      })

      if (onPingAccepted) {
        onPingAccepted()
      }

      // Refresh the data
      fetchData()
    } catch (err) {
      console.error("Error pinging site:", err)
      toast({
        title: "Validation Failed",
        description: err.message || "Failed to validate the website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPingingStates((prev) => ({ ...prev, [site.wid]: false }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "up":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
      case "down":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
    }
  }

  const getCategoryColor = (category) => {
    const colors = [
      "bg-gradient-to-r from-blue-500 to-cyan-500",
      "bg-gradient-to-r from-purple-500 to-pink-500",
      "bg-gradient-to-r from-orange-500 to-red-500",
      "bg-gradient-to-r from-emerald-500 to-green-500",
      "bg-gradient-to-r from-indigo-500 to-purple-500",
      "bg-gradient-to-r from-cyan-500 to-blue-500",
    ]
    const index = Number.parseInt(category) % colors.length
    return `${colors[index]} text-white`
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never"
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-xl" />
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
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="ml-2 bg-transparent border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search websites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-0 bg-gray-50 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 h-12 border-0 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="border-0 shadow-lg bg-white dark:bg-gray-900 rounded-xl">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toString()}>
                    Category {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={fetchData}
              variant="outline"
              className="h-12 px-6 border-0 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-violet-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredSites.length} Sites Available
                </span>
              </div>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-lg">
                <Coins className="h-3 w-3 mr-1" />
                0.0002 ETH per validation
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sites Grid */}
      {filteredSites.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/20 dark:to-purple-950/20 flex items-center justify-center mb-6">
              <Globe className="h-10 w-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Sites Available</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm || selectedCategory !== "all"
                ? "No sites match your current filters. Try adjusting your search."
                : "There are no websites available for validation at the moment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSites.map((site, index) => {
            const stats = getSiteStats(site.wid)

            return (
              <motion.div
                key={site.wid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-full group hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate text-gray-900 dark:text-white mb-1">
                            {site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                            {site.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(site.url, "_blank")}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Badge className={`${getStatusColor(stats.lastStatus)} text-xs px-2 py-1 rounded-lg border`}>
                            {stats.lastStatus === "up" ? (
                              <Wifi className="h-3 w-3 mr-1" />
                            ) : stats.lastStatus === "down" ? (
                              <WifiOff className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {stats.lastStatus === "up" ? "Online" : stats.lastStatus === "down" ? "Offline" : "Unknown"}
                          </Badge>
                        </div>
                      </div>

                      {/* Category and Last Ping */}
                      <div className="flex items-center justify-between">
                        <Badge className={`${getCategoryColor(site.category)} text-xs px-3 py-1 rounded-lg`}>
                          Category {site.category}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(stats.lastPing?.timestamp)}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                              {stats.totalPings}
                            </span>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-400">Total Pings</p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                              {stats.uptime}%
                            </span>
                          </div>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">Uptime</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Timer className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                              {stats.avgLatency}ms
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 dark:text-purple-400">Avg Latency</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                              {stats.regions.length}
                            </span>
                          </div>
                          <p className="text-xs text-orange-700 dark:text-orange-400">Regions</p>
                        </div>
                      </div>

                      {/* Regions */}
                      {stats.regions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {stats.regions.map((region) => (
                            <Badge
                              key={region}
                              variant="outline"
                              className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                              {region}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Ping Button */}
                      <Button
                        onClick={() => handlePing(site)}
                        disabled={pingingStates[site.wid]}
                        className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {pingingStates[site.wid] ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Validate & Earn 0.0002 ETH
                          </>
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
