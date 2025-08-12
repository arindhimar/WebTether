"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Skeleton } from "../ui/skeleton"
import { Alert, AlertDescription } from "../ui/alert"
import { useToast } from "../../hooks/use-toast"
import { websiteAPI, api } from "../../services/api"
import { Globe, Search, Filter, Clock, TrendingUp, Zap, CheckCircle, AlertCircle, RefreshCw, Coins } from "lucide-react"

export default function AvailableSites({ onPingAccepted }) {
  const [availableSites, setAvailableSites] = useState([])
  const [filteredSites, setFilteredSites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState([])
  const [pingingStates, setPingingStates] = useState({})
  const { toast } = useToast()

  useEffect(() => {
    fetchAvailableSites()
  }, [])

  useEffect(() => {
    filterSites()
  }, [availableSites, searchTerm, selectedCategory])

  const fetchAvailableSites = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const sites = await websiteAPI.getAvailableSites()

      setAvailableSites(sites)

      // Extract unique categories
      const uniqueCategories = [...new Set(sites.map((site) => site.category).filter(Boolean))]
      setCategories(uniqueCategories)
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

  const filterSites = () => {
    let filtered = availableSites

    if (searchTerm) {
      filtered = filtered.filter(
        (site) =>
          site.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((site) => site.category === selectedCategory)
    }

    setFilteredSites(filtered)
  }

  const handlePing = async (site) => {
    try {
      setPingingStates((prev) => ({ ...prev, [site.wid]: true }))

      // Generate a fake transaction hash for simulation
      const txHash = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      await api.manualPing({
        wid: site.wid,
        url: site.url,
        tx_hash: txHash,
      })

      toast({
        title: "Ping Successful!",
        description: `Successfully pinged ${site.url}. You earned 0.001 ETH!`,
        variant: "default",
      })

      if (onPingAccepted) {
        onPingAccepted()
      }

      // Refresh the available sites list
      fetchAvailableSites()
    } catch (err) {
      console.error("Error pinging site:", err)
      toast({
        title: "Ping Failed",
        description: err.message || "Failed to ping the website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPingingStates((prev) => ({ ...prev, [site.wid]: false }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "up":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "down":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      "E-commerce": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Blog: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      News: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Portfolio: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      Business: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      Social: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    }
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
          <Button onClick={fetchAvailableSites} variant="outline" size="sm" className="ml-2 bg-transparent">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Available Sites</h2>
          <p className="text-muted-foreground">
            Validate websites and earn ETH rewards • {filteredSites.length} sites available
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Coins className="h-3 w-3 mr-1" />
            0.001 ETH per ping
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search websites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={fetchAvailableSites} variant="outline" size="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Sites Grid */}
      {filteredSites.length === 0 ? (
        <Card className="p-8 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Sites Available</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== "all"
              ? "No sites match your current filters. Try adjusting your search."
              : "There are no websites available for validation at the moment."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSites.map((site, index) => (
            <motion.div
              key={site.wid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {site.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{site.url}</p>
                    </div>
                    <Badge variant="secondary" className={`ml-2 ${getStatusColor(site.last_status || "unknown")}`}>
                      {site.last_status === "up" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {site.last_status || "Unknown"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Category and Stats */}
                    <div className="flex items-center justify-between">
                      {site.category && (
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(site.category)}`}>
                          {site.category}
                        </Badge>
                      )}
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {site.last_ping_time ? new Date(site.last_ping_time).toLocaleDateString() : "Never pinged"}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                        <span className="text-muted-foreground">{site.ping_count || 0} pings</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="h-3 w-3 mr-1 text-blue-600" />
                        <span className="text-muted-foreground">{site.response_time || "N/A"}ms</span>
                      </div>
                    </div>

                    {/* Ping Button */}
                    <Button
                      onClick={() => handlePing(site)}
                      disabled={pingingStates[site.wid]}
                      className="w-full"
                      size="sm"
                    >
                      {pingingStates[site.wid] ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Pinging...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Ping & Earn 0.001 ETH
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
