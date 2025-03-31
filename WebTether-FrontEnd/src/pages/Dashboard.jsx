"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
  Users,
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { formatNumber } from "../lib/utils"
import { websiteAPI } from "../services/api"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../contexts/AuthContext"
import AddWebsiteModal from "../components/AddWebsiteModal"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "up":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "down":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "degraded":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "up":
        return <ArrowUpRight className="w-3 h-3" />
      case "down":
        return <ArrowDownRight className="w-3 h-3" />
      case "degraded":
        return <Clock className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
    >
      {getStatusIcon(status)}
      <span className="capitalize">{status}</span>
    </span>
  )
}

export default function Dashboard() {
  const { isInitialized } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [websites, setWebsites] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState({
    websites: true,
    stats: true,
  })
  const [error, setError] = useState({
    websites: null,
    stats: null,
  })
  const { toast } = useToast()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const hasFetchedData = useRef(false)

  // Fetch websites
  const fetchWebsites = useCallback(async (signal) => {
    try {
      setLoading(prev => ({ ...prev, websites: true }))
      const response = await websiteAPI.getAllWebsites({ signal })
      setWebsites(response.data)
      setError(prev => ({ ...prev, websites: null }))
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(prev => ({ ...prev, websites: "Failed to load websites" }))
        toast({
          title: "Error",
          description: "Failed to load websites. Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(prev => ({ ...prev, websites: false }))
    }
  }, [toast])

  // Fetch stats
  const fetchStats = useCallback(async (signal) => {
    try {
      setLoading(prev => ({ ...prev, stats: true }))
      const response = await websiteAPI.getWebsiteStats({ signal })
      setStats(response.data || {
        totalWebsites: 0,
        activeValidators: 0,
        overallUptime: "0%",
        averageLatency: "0ms",
      })
      setError(prev => ({ ...prev, stats: null }))
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(prev => ({ ...prev, stats: "Failed to load statistics" }))
      }
    } finally {
      setLoading(prev => ({ ...prev, stats: false }))
    }
  }, [])

  // Fetch all data
  const fetchAllData = useCallback(async (signal) => {
    try {
      setLoading({ websites: true, stats: true })
      const [websitesRes, statsRes] = await Promise.all([
        fetchWebsites(signal),
        fetchStats(signal)
      ])
    } catch (err) {
      console.error("Error fetching data:", err)
    }
  }, [fetchWebsites, fetchStats])

  // Fetch data when auth is initialized
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    if (isInitialized && !hasFetchedData.current) {
      hasFetchedData.current = true
      fetchAllData(signal)
    }

    return () => {
      controller.abort()
    }
  }, [isInitialized, fetchAllData])

  const filteredWebsites = websites.filter((website) => 
    website.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddWebsite = () => {
    setIsAddModalOpen(true)
  }

  const handleWebsiteAdded = async (website) => {
    try {
      // Optimistic update
      setWebsites(prev => [...prev, website])
      
      // Refresh stats
      await fetchStats(new AbortController().signal)
      
      toast({
        title: "Success",
        description: "Website added successfully",
      })
    } catch (error) {
      // Revert if error
      setWebsites(prev => prev.filter(w => w.id !== website.id))
      toast({
        title: "Error",
        description: "Failed to update website stats",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = async () => {
    const controller = new AbortController()
    await fetchAllData(controller.signal)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your websites and view their status</p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading.websites || loading.stats}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${(loading.websites || loading.stats) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="flex items-center gap-2" onClick={handleAddWebsite}>
              <Plus className="w-4 h-4" />
              <span>Add Website</span>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Total Websites Card */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Websites</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.stats ? (
                  <div className="flex items-center justify-center h-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : error.stats || !stats ? (
                  <div className="flex items-center text-muted-foreground">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>Error loading data</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{formatNumber(stats.totalWebsites)}</div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Globe className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Validators Card */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Validators</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.stats ? (
                  <div className="flex items-center justify-center h-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : error.stats || !stats ? (
                  <div className="flex items-center text-muted-foreground">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>Error loading data</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{formatNumber(stats.activeValidators)}</div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Overall Uptime Card */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.stats ? (
                  <div className="flex items-center justify-center h-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : error.stats || !stats ? (
                  <div className="flex items-center text-muted-foreground">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>Error loading data</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stats.overallUptime}</div>
                    <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Average Latency Card */}
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Latency</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.stats ? (
                  <div className="flex items-center justify-center h-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : error.stats || !stats ? (
                  <div className="flex items-center text-muted-foreground">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>Error loading data</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stats.averageLatency}</div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold">Your Websites</h2>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search websites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              {loading.websites ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error.websites ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <p>{error.websites}</p>
                  <Button variant="link" onClick={() => fetchWebsites(new AbortController().signal)} className="mt-2">
                    Try again
                  </Button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Website
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Uptime
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Latency
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Last Checked
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredWebsites.length > 0 ? (
                      filteredWebsites.map((website) => (
                        <tr key={website.id} className="bg-card hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Globe className="h-4 w-4 text-primary" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium">{website.url}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <StatusBadge status={website.status} />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{website.uptime}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {website.status === "down" ? "-" : `${website.latency}ms`}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {website.last_checked ? new Date(website.last_checked).toLocaleString() : "Never"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end space-x-2">
                              <Link to={`/website/${website.id}`}>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">View details</span>
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          {searchQuery ? (
                            <div>
                              <p>No websites found matching "{searchQuery}"</p>
                              <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                                Clear search
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p>No websites added yet</p>
                              <Button variant="link" onClick={handleAddWebsite} className="mt-2">
                                Add your first website
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </motion.div>
      </main>
      
      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onWebsiteAdded={handleWebsiteAdded}
      />
    </div>
  )
}