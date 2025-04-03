"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, CheckCircle2, Clock, Globe, Plus, RefreshCw, ArrowRight, Zap, Activity } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { motion } from "framer-motion"
import { websiteAPI, validatorAPI } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { useBackendAuthContext } from "../../context/backend-auth-context"
import { AnimatedCard } from "../../components/ui/animated-card"

export default function DashboardPage() {
  const [websites, setWebsites] = useState([])
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("")
  const [isAddingWebsite, setIsAddingWebsite] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    totalWebsites: 0,
    uptime: 0,
    avgLatency: 0,
    validatorStatus: "inactive",
    validatorLevel: 0,
    coinsEarned: 0,
  })
  const [uptimeData, setUptimeData] = useState([])
  const [latencyData, setLatencyData] = useState([])
  const { toast } = useToast()
  const { backendUser } = useBackendAuthContext()

  // Animation effect when component mounts and fetch data
  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = useCallback(async () => {
    if (!backendUser) return

    try {
      setIsLoading(true)

      // Fetch website data
      const websitesResponse = await websiteAPI.getAllWebsites()
      if (websitesResponse.data && Array.isArray(websitesResponse.data)) {
        const websiteData = websitesResponse.data.map((website) => ({
          id: website.id,
          url: website.url,
          status: website.status || "unknown",
          latency: website.latency || 0,
          uptime: website.uptime ? Number.parseFloat(website.uptime) : 0,
          lastChecked: website.last_checked ? new Date(website.last_checked).toLocaleTimeString() : "unknown",
        }))
        setWebsites(websiteData)
      }

      // Fetch website stats
      const websiteStatsResponse = await websiteAPI.getWebsiteStats()
      if (websiteStatsResponse.data) {
        // Parse uptime and latency from response
        const uptimeValue = websiteStatsResponse.data.overallUptime
          ? Number.parseFloat(websiteStatsResponse.data.overallUptime)
          : Math.round((websites.filter((w) => w.status === "up").length / Math.max(websites.length, 1)) * 100)

        const avgLatency = websiteStatsResponse.data.averageLatency
          ? Number.parseInt(websiteStatsResponse.data.averageLatency)
          : Math.round(
              websites.filter((w) => w.status === "up").reduce((acc, site) => acc + site.latency, 0) /
                Math.max(websites.filter((w) => w.status === "up").length, 1),
            )

        setProgress(uptimeValue)

        // Update dashboard stats with website info
        setDashboardStats((prev) => ({
          ...prev,
          totalWebsites: websiteStatsResponse.data.totalWebsites || websites.length,
          uptime: uptimeValue,
          avgLatency: avgLatency,
        }))
      }

      // Check validator status
      const validatorsResponse = await validatorAPI.getAllValidators()
      if (validatorsResponse.data && Array.isArray(validatorsResponse.data) && validatorsResponse.data.length > 0) {
        // User is a validator
        const validatorStats = await validatorAPI.getValidatorStats()
        if (validatorStats.data) {
          setDashboardStats((prev) => ({
            ...prev,
            validatorStatus: "active",
            validatorLevel: Math.floor(validatorStats.data.totalValidators / 2) + 1 || 2,
            coinsEarned: validatorStats.data.totalValidators * 50 || 215,
          }))
        }
      }

      // Generate chart data
      generateChartData()
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error loading dashboard",
        description: "There was a problem loading your dashboard data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [backendUser, websites, toast])

  const generateChartData = () => {
    // Generate uptime trend data (simulating 7-day data)
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const uptimeHistory = days.map((day) => ({
      name: day,
      value: Math.min(100, Math.max(95, 97 + Math.random() * 3)),
    }))
    setUptimeData(uptimeHistory)

    // Generate latency trend data
    const latencyHistory = days.map((day) => ({
      name: day,
      value: Math.round(85 + Math.random() * 40),
    }))
    setLatencyData(latencyHistory)
  }

  const addWebsite = async () => {
    if (!newWebsiteUrl) return

    try {
      const response = await websiteAPI.createWebsite({
        url: newWebsiteUrl,
        description: "",
        monitoring_frequency: "5 minutes",
        alerts_enabled: true,
      })

      if (response.data && response.data.website) {
        // Add new website to state
        const newWebsite = {
          id: response.data.website.id,
          url: response.data.website.url,
          status: response.data.website.status || "unknown",
          latency: response.data.website.latency || 0,
          lastChecked: "just now",
        }

        setWebsites([...websites, newWebsite])
        setDashboardStats((prev) => ({ ...prev, totalWebsites: prev.totalWebsites + 1 }))
        setNewWebsiteUrl("")
        setIsAddingWebsite(false)

        toast({
          title: "Website Added",
          description: `${newWebsiteUrl} has been added to your monitoring list.`,
        })
      }
    } catch (error) {
      console.error("Error adding website:", error)
      toast({
        title: "Error",
        description: "Failed to add website. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "up":
        return <CheckCircle2 className="h-5 w-5 text-green-500 animate-pulse-subtle" />
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500 animate-pulse-subtle" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse-subtle" />
      case "timeout":
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse-subtle" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "up":
        return <Badge className="bg-green-500 animate-pulse-subtle">Up</Badge>
      case "down":
        return <Badge className="bg-red-500 animate-pulse-subtle">Down</Badge>
      case "degraded":
        return <Badge className="bg-yellow-500 animate-pulse-subtle">Degraded</Badge>
      case "timeout":
        return <Badge className="bg-yellow-500 animate-pulse-subtle">Timeout</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const refreshData = async () => {
    toast({
      title: "Refreshing data",
      description: "Fetching the latest monitoring information...",
    })

    await fetchDashboardData()

    toast({
      title: "Data refreshed",
      description: "Your dashboard has been updated with the latest information.",
    })
  }

  const pingWebsite = async (websiteId) => {
    try {
      const response = await websiteAPI.pingWebsite(websiteId)

      if (response.data) {
        // Update the website in state with new data
        setWebsites(
          websites.map((website) =>
            website.id === websiteId
              ? {
                  ...website,
                  status: response.data.status || website.status,
                  latency: response.data.latency || website.latency,
                  lastChecked: "just now",
                }
              : website,
          ),
        )

        toast({
          title: "Website Pinged",
          description: `Status: ${response.data.status || "Unknown"}, Latency: ${response.data.latency || 0}ms`,
        })
      }
    } catch (error) {
      console.error("Error pinging website:", error)
      toast({
        title: "Ping Failed",
        description: "Unable to ping the website. Please try again.",
        variant: "destructive",
      })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-lg font-medium">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    // Ensure the dashboard page doesn't add its own scrollbars
    <motion.div
      className={`space-y-8 w-full ${mounted ? "" : "opacity-0"}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-text">Welcome Back</h2>
          <p className="text-muted-foreground">Here's an overview of your website monitoring status</p>
        </div>
        <Dialog open={isAddingWebsite} onOpenChange={setIsAddingWebsite}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="animate-in-button shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Add Website
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add a new website</DialogTitle>
              <DialogDescription>Enter the URL of the website you want to monitor.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={newWebsiteUrl}
                  onChange={(e) => setNewWebsiteUrl(e.target.value)}
                  className="focus-visible:ring-primary focus:shadow-inner-glow"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingWebsite(false)}>
                Cancel
              </Button>
              <Button onClick={addWebsite} variant="gradient" className="shadow-glow">
                Add Website
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats cards with AnimatedCard */}
      <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <AnimatedCard className="border-primary/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
              <Globe className="h-4 w-4 text-primary animate-hover-bounce" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{dashboardStats.totalWebsites}</div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span className="flex items-center text-green-500">
                  <ArrowRight className="mr-1 h-3 w-3 rotate-45" />
                  Last added{" "}
                  {websites.length > 0
                    ? new Date(websites[0].created_at || Date.now()).toLocaleDateString()
                    : "recently"}
                </span>
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnimatedCard className="border-primary/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary animate-hover-bounce" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{dashboardStats.uptime.toFixed(1)}%</div>
              <div className="mt-2">
                <Progress value={progress} className="h-2 bg-primary/20" />
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnimatedCard className="border-primary/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Latency</CardTitle>
              <Zap className="h-4 w-4 text-primary animate-hover-bounce" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">
                {dashboardStats.avgLatency}
                <span className="text-lg font-normal">ms</span>
              </div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span className="flex items-center text-green-500">
                  <ArrowRight className="mr-1 h-3 w-3 -rotate-45" />
                  15ms faster than last week
                </span>
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnimatedCard className="border-primary/10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validator Status</CardTitle>
              <Activity className="h-4 w-4 text-primary animate-hover-bounce" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text capitalize">{dashboardStats.validatorStatus}</div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                {dashboardStats.validatorStatus === "active" ? (
                  <span className="flex items-center">
                    Level {dashboardStats.validatorLevel} Validator • {dashboardStats.coinsEarned} coins earned
                  </span>
                ) : (
                  <span className="flex items-center">Become a validator to earn rewards</span>
                )}
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>
      </motion.div>

      {/* Chart cards with AnimatedCard */}
      <motion.div className="grid gap-6 md:grid-cols-2 w-full" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <AnimatedCard className="border-primary/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="gradient-text">Uptime Overview</CardTitle>
              <CardDescription>7-day uptime percentage across all websites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={uptimeData}>
                    <defs>
                      <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#uptimeGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AnimatedCard className="border-primary/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="gradient-text">Latency Trends</CardTitle>
              <CardDescription>7-day average response time in milliseconds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyData}>
                    <defs>
                      <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#latencyGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="card-3d border border-primary/10 rounded-lg bg-card/50 backdrop-blur-sm p-4 overflow-hidden w-full"
      >
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="w-full sm:w-auto bg-muted/80">
              <TabsTrigger
                value="all"
                className="animate-in-button data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                All Websites
              </TabsTrigger>
              <TabsTrigger
                value="up"
                className="animate-in-button data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Up
              </TabsTrigger>
              <TabsTrigger
                value="down"
                className="animate-in-button data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Down
              </TabsTrigger>
              <TabsTrigger
                value="degraded"
                className="animate-in-button data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Degraded
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto animate-in-button group"
              onClick={refreshData}
            >
              <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin group-hover:text-primary transition-colors" />
              Refresh
            </Button>
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {websites.length > 0 ? (
                websites.map((website) => (
                  <AnimatedCard key={website.id} className="border-primary/10 overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="line-clamp-1 gradient-text">{website.url}</CardTitle>
                        <CardDescription>Last checked: {website.lastChecked}</CardDescription>
                      </div>
                      {getStatusIcon(website.status)}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">Status: {getStatusBadge(website.status)}</div>
                        <div>
                          {website.status === "up" && (
                            <span className="text-sm text-muted-foreground">{website.latency}ms</span>
                          )}
                        </div>
                      </div>

                      {website.status === "up" && (
                        <div className="mt-4 h-[100px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={[
                                { time: "12:00", latency: website.latency - Math.random() * 20 },
                                { time: "12:05", latency: website.latency + Math.random() * 20 },
                                { time: "12:10", latency: website.latency - Math.random() * 10 },
                                { time: "12:15", latency: website.latency + Math.random() * 15 },
                                { time: "12:20", latency: website.latency - Math.random() * 5 },
                                { time: "12:25", latency: website.latency + Math.random() * 10 },
                                { time: "12:30", latency: website.latency },
                              ]}
                            >
                              <Line
                                type="monotone"
                                dataKey="latency"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="animate-in-button group"
                        onClick={() => pingWebsite(website.id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin group-hover:text-primary transition-colors" />
                        Ping
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="animate-in-button group">
                        <Link to={`/dashboard/websites/${website.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </AnimatedCard>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No websites found</h3>
                      <p className="text-muted-foreground mb-4 text-center">
                        Add your first website to start monitoring its performance and uptime.
                      </p>
                      <Button variant="gradient" onClick={() => setIsAddingWebsite(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Website
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="up" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {websites
                .filter((w) => w.status === "up")
                .map((website) => (
                  <AnimatedCard key={website.id} className="border-primary/10 overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="line-clamp-1 gradient-text">{website.url}</CardTitle>
                        <CardDescription>Last checked: {website.lastChecked}</CardDescription>
                      </div>
                      {getStatusIcon(website.status)}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">Status: {getStatusBadge(website.status)}</div>
                        <div>
                          <span className="text-sm text-muted-foreground">{website.latency}ms</span>
                        </div>
                      </div>

                      <div className="mt-4 h-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={[
                              { time: "12:00", latency: website.latency - Math.random() * 20 },
                              { time: "12:05", latency: website.latency + Math.random() * 20 },
                              { time: "12:10", latency: website.latency - Math.random() * 10 },
                              { time: "12:15", latency: website.latency + Math.random() * 15 },
                              { time: "12:20", latency: website.latency - Math.random() * 5 },
                              { time: "12:25", latency: website.latency + Math.random() * 10 },
                              { time: "12:30", latency: website.latency },
                            ]}
                          >
                            <Line
                              type="monotone"
                              dataKey="latency"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="animate-in-button group"
                        onClick={() => pingWebsite(website.id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin group-hover:text-primary transition-colors" />
                        Ping
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="animate-in-button group">
                        <Link to={`/dashboard/websites/${website.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </AnimatedCard>
                ))}

              {websites.filter((w) => w.status === "up").length === 0 && (
                <div className="col-span-full">
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No websites up</h3>
                      <p className="text-muted-foreground text-center">
                        None of your websites are currently up. Check the "All Websites" tab to see your sites.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="down" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {websites
                .filter((w) => w.status === "down")
                .map((website) => (
                  <AnimatedCard key={website.id} className="border-primary/10 overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="line-clamp-1 gradient-text">{website.url}</CardTitle>
                        <CardDescription>Last checked: {website.lastChecked}</CardDescription>
                      </div>
                      {getStatusIcon(website.status)}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">Status: {getStatusBadge(website.status)}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="animate-in-button group"
                        onClick={() => pingWebsite(website.id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin group-hover:text-primary transition-colors" />
                        Ping
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="animate-in-button group">
                        <Link to={`/dashboard/websites/${website.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </AnimatedCard>
                ))}

              {websites.filter((w) => w.status === "down").length === 0 && (
                <div className="col-span-full">
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No websites down</h3>
                      <p className="text-muted-foreground text-center">
                        Good news! None of your websites are currently down.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="degraded" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {websites
                .filter((w) => w.status === "degraded")
                .map((website) => (
                  <AnimatedCard key={website.id} className="border-primary/10 overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="line-clamp-1 gradient-text">{website.url}</CardTitle>
                        <CardDescription>Last checked: {website.lastChecked}</CardDescription>
                      </div>
                      {getStatusIcon(website.status)}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">Status: {getStatusBadge(website.status)}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="animate-in-button group"
                        onClick={() => pingWebsite(website.id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin group-hover:text-primary transition-colors" />
                        Ping
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="animate-in-button group">
                        <Link to={`/dashboard/websites/${website.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </AnimatedCard>
                ))}

              {websites.filter((w) => w.status === "degraded").length === 0 && (
                <div className="col-span-full">
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No degraded websites</h3>
                      <p className="text-muted-foreground text-center">
                        None of your websites are currently in a degraded state.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

