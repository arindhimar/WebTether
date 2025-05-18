"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Switch } from "../../components/ui/switch"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { useToast } from "../../hooks/use-toast"
import { useBackendAuth } from "../../hooks/use-backend-auth"
import { Globe, Plus, RefreshCw, Trash2, Settings, Check, X, AlertTriangle, Wifi } from "lucide-react"
import api from "../../services/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

const WebsitesPage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useBackendAuth()

  const [websites, setWebsites] = useState([])
  const [stats, setStats] = useState({
    totalWebsites: 0,
    onlineWebsites: 0,
    offlineWebsites: 0,
    averageUptime: 0,
    averageLatency: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isPinging, setPinging] = useState(false)
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [pingResults, setPingResults] = useState(null)

  // Form state
  const [newWebsite, setNewWebsite] = useState({
    url: "",
    description: "",
    monitoring_frequency: "5 minutes",
    alerts_enabled: true,
    is_public: false,
  })

  // Fetch websites
  const fetchWebsites = async () => {
    try {
      const response = await api.websiteAPI.getAllWebsites()
      setWebsites(response.data)
    } catch (error) {
      console.error("Error fetching websites:", error)
      toast({
        title: "Error",
        description: "Failed to fetch websites. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch website stats
  const fetchWebsiteStats = async () => {
    try {
      const response = await api.websiteAPI.getWebsiteStats()
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching website stats:", error)
      toast({
        title: "Error",
        description: "Failed to fetch website statistics. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Load all data
  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchWebsites(), fetchWebsiteStats()])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadData()
    }
  }, [isAuthenticated, authLoading])

  // Create website
  const handleCreateWebsite = async () => {
    if (!newWebsite.url) {
      toast({
        title: "Validation Error",
        description: "Please enter a website URL.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await api.websiteAPI.createWebsite(newWebsite)
      setWebsites([...websites, response.data.website])
      setNewWebsite({
        url: "",
        description: "",
        monitoring_frequency: "5 minutes",
        alerts_enabled: true,
        is_public: false,
      })
      toast({
        title: "Success",
        description: "Website added successfully.",
        variant: "default",
      })

      // Refresh stats
      fetchWebsiteStats()
    } catch (error) {
      console.error("Error creating website:", error)
      toast({
        title: "Error",
        description: "Failed to add website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Delete website
  const handleDeleteWebsite = async (websiteId) => {
    try {
      await api.websiteAPI.deleteWebsite(websiteId)
      setWebsites(websites.filter((w) => w.id !== websiteId))
      toast({
        title: "Success",
        description: "Website deleted successfully.",
        variant: "default",
      })

      // Refresh stats
      fetchWebsiteStats()
    } catch (error) {
      console.error("Error deleting website:", error)
      toast({
        title: "Error",
        description: "Failed to delete website. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Ping website
  const handlePingWebsite = async (websiteId) => {
    setPinging(true)
    setPingResults(null)

    try {
      const response = await api.websiteAPI.pingWebsite(websiteId)
      setPingResults(response.data)

      // Update websites list to reflect the ping
      fetchWebsites()

      // Update stats
      fetchWebsiteStats()

      toast({
        title: response.data.success ? "Success" : "Warning",
        description: response.data.success
          ? `Website pinged successfully. Response time: ${response.data.latency}ms`
          : "Website is down or unreachable.",
        variant: response.data.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error pinging website:", error)
      toast({
        title: "Error",
        description: "Failed to ping website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPinging(false)
    }
  }

  // Update website
  const handleUpdateWebsite = async (websiteId, updatedData) => {
    try {
      const response = await api.websiteAPI.updateWebsite(websiteId, updatedData)

      // Update the websites list with the updated website
      setWebsites(websites.map((website) => (website.id === websiteId ? response.data.website : website)))

      toast({
        title: "Success",
        description: "Website updated successfully.",
        variant: "default",
      })

      // Close the dialog
      setSelectedWebsite(null)
    } catch (error) {
      console.error("Error updating website:", error)
      toast({
        title: "Error",
        description: "Failed to update website. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle website public status
  const handleTogglePublic = async (website) => {
    try {
      const updatedData = {
        ...website,
        is_public: !website.is_public,
      }

      await handleUpdateWebsite(website.id, updatedData)

      toast({
        title: "Success",
        description: `Website is now ${updatedData.is_public ? "public" : "private"}.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error toggling website public status:", error)
    }
  }

  // Format uptime as a percentage
  const formatUptime = (uptime) => {
    if (typeof uptime === "string" && uptime.includes("%")) {
      return uptime
    }
    return `${Number.parseFloat(uptime).toFixed(2)}%`
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "online":
      case "up":
        return "bg-green-500"
      case "offline":
      case "down":
        return "bg-red-500"
      case "degraded":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "online":
      case "up":
        return "Online"
      case "offline":
      case "down":
        return "Offline"
      case "degraded":
        return "Degraded"
      default:
        return "Unknown"
    }
  }

  // Add this function to handle toggling public status:
  const toggleWebsitePublicStatus = async (websiteId) => {
    try {
      const response = await api.websiteAPI.togglePublicStatus(websiteId)

      // Update the website in state
      setWebsites(
        websites.map((website) =>
          website.id === websiteId ? { ...website, is_public: response.data.is_public } : website,
        ),
      )

      toast({
        title: "Success",
        description: response.data.message,
        variant: "default",
      })
    } catch (error) {
      console.error("Error toggling website public status:", error)
      toast({
        title: "Error",
        description: "Failed to update website visibility. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    navigate("/auth/signin")
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Websites</h1>
        <div className="flex space-x-2">
          <Button onClick={loadData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Website
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Website</DialogTitle>
                <DialogDescription>Add a new website to monitor its status.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="url"
                    value={newWebsite.url}
                    onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                    className="col-span-3"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newWebsite.description}
                    onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="frequency" className="text-right">
                    Check Frequency
                  </Label>
                  <select
                    id="frequency"
                    value={newWebsite.monitoring_frequency}
                    onChange={(e) => setNewWebsite({ ...newWebsite, monitoring_frequency: e.target.value })}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="1 minute">Every minute</option>
                    <option value="5 minutes">Every 5 minutes</option>
                    <option value="15 minutes">Every 15 minutes</option>
                    <option value="30 minutes">Every 30 minutes</option>
                    <option value="1 hour">Every hour</option>
                    <option value="6 hours">Every 6 hours</option>
                    <option value="12 hours">Every 12 hours</option>
                    <option value="24 hours">Every 24 hours</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alerts" className="text-right">
                    Enable Alerts
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="alerts"
                      checked={newWebsite.alerts_enabled}
                      onCheckedChange={(checked) => setNewWebsite({ ...newWebsite, alerts_enabled: checked })}
                    />
                    <Label htmlFor="alerts" className="text-sm">
                      {newWebsite.alerts_enabled ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="public" className="text-right">
                    Make Public
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="public"
                      checked={newWebsite.is_public}
                      onCheckedChange={(checked) => setNewWebsite({ ...newWebsite, is_public: checked })}
                    />
                    <Label htmlFor="public" className="text-sm">
                      {newWebsite.is_public ? "Public" : "Private"}
                    </Label>
                  </div>
                </div>
                {newWebsite.is_public && (
                  <div className="col-span-4 bg-blue-50 p-3 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Public Website</p>
                        <p>
                          Making this website public will allow other validators to monitor it. This is useful for
                          community-driven monitoring and increased reliability.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleCreateWebsite} disabled={isCreating || !newWebsite.url}>
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Website"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Websites</p>
                <h3 className="text-2xl font-bold">{stats.totalWebsites}</h3>
              </div>
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online</p>
                <h3 className="text-2xl font-bold">{stats.onlineWebsites}</h3>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <h3 className="text-2xl font-bold">{stats.offlineWebsites}</h3>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Uptime</p>
                <h3 className="text-2xl font-bold">{formatUptime(stats.averageUptime)}</h3>
              </div>
              <Wifi className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Latency</p>
                <h3 className="text-2xl font-bold">{stats.averageLatency}ms</h3>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Websites List */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Websites</TabsTrigger>
          <TabsTrigger value="online">Online</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
        </TabsList>

        {["all", "online", "offline", "public"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : websites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Websites Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't added any websites yet. Add your first website to start monitoring.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Website
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">{/* Same dialog content as above */}</DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {websites
                  .filter((website) => {
                    if (tab === "all") return true
                    if (tab === "online") return website.status === "up" || website.status === "online"
                    if (tab === "offline") return website.status === "down" || website.status === "offline"
                    if (tab === "public") return website.is_public
                    return true
                  })
                  .map((website) => (
                    <Card key={website.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <CardTitle className="truncate max-w-[200px]" title={website.url}>
                              {website.url}
                            </CardTitle>
                            {website.is_public && <Badge className="ml-2 bg-purple-500">Public</Badge>}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleDeleteWebsite(website.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSelectedWebsite(website)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleWebsitePublicStatus(website.id)}>
                                <Globe className="mr-2 h-4 w-4" />
                                {website.is_public ? "Make Private" : "Make Public"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription>{website.description || "No description provided"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Uptime:</span>
                            <span>{formatUptime(website.uptime)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Latency:</span>
                            <span>{website.latency}ms</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Checked:</span>
                            <span>
                              {website.last_checked ? new Date(website.last_checked).toLocaleString() : "Never"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Check Frequency:</span>
                            <span>{website.monitoring_frequency}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handlePingWebsite(website.id)
                          }}
                          disabled={isPinging}
                        >
                          {isPinging ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Wifi className="h-4 w-4 mr-2" />
                          )}
                          Ping
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Ping Results Dialog */}
      {pingResults && (
        <Dialog open={!!pingResults} onOpenChange={() => setPingResults(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ping Results</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                {pingResults.success ? (
                  <div className="rounded-full bg-green-100 p-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="rounded-full bg-red-100 p-3">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium mb-1">
                  {pingResults.success ? "Website is Online" : "Website is Offline"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {pingResults.success ? `Response time: ${pingResults.latency}ms` : "The website could not be reached"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={pingResults.success ? "text-green-600" : "text-red-600"}>
                    {pingResults.success ? "Online" : "Offline"}
                  </span>
                </div>

                {pingResults.success && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Latency:</span>
                    <span>{pingResults.latency}ms</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span>{new Date(pingResults.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setPingResults(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Website Dialog */}
      {selectedWebsite && (
        <Dialog open={!!selectedWebsite} onOpenChange={(open) => !open && setSelectedWebsite(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Website</DialogTitle>
              <DialogDescription>Update website details and settings.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-url" className="text-right">
                  URL
                </Label>
                <Input id="edit-url" defaultValue={selectedWebsite.url} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  defaultValue={selectedWebsite.description}
                  className="col-span-3"
                  onChange={(e) => setSelectedWebsite({ ...selectedWebsite, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-frequency" className="text-right">
                  Check Frequency
                </Label>
                <select
                  id="edit-frequency"
                  defaultValue={selectedWebsite.monitoring_frequency}
                  onChange={(e) => setSelectedWebsite({ ...selectedWebsite, monitoring_frequency: e.target.value })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="1 minute">Every minute</option>
                  <option value="5 minutes">Every 5 minutes</option>
                  <option value="15 minutes">Every 15 minutes</option>
                  <option value="30 minutes">Every 30 minutes</option>
                  <option value="1 hour">Every hour</option>
                  <option value="6 hours">Every 6 hours</option>
                  <option value="12 hours">Every 12 hours</option>
                  <option value="24 hours">Every 24 hours</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-alerts" className="text-right">
                  Enable Alerts
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="edit-alerts"
                    checked={selectedWebsite.alerts_enabled}
                    onCheckedChange={(checked) => setSelectedWebsite({ ...selectedWebsite, alerts_enabled: checked })}
                  />
                  <Label htmlFor="edit-alerts" className="text-sm">
                    {selectedWebsite.alerts_enabled ? "Enabled" : "Disabled"}
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-public" className="text-right">
                  Make Public
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="edit-public"
                    checked={selectedWebsite.is_public}
                    onCheckedChange={(checked) => setSelectedWebsite({ ...selectedWebsite, is_public: checked })}
                  />
                  <Label htmlFor="edit-public" className="text-sm">
                    {selectedWebsite.is_public ? "Public" : "Private"}
                  </Label>
                </div>
              </div>
              {selectedWebsite.is_public && (
                <div className="col-span-4 bg-blue-50 p-3 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Public Website</p>
                      <p>
                        Making this website public will allow other validators to monitor it. This is useful for
                        community-driven monitoring and increased reliability.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedWebsite(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateWebsite(selectedWebsite.id, selectedWebsite)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default WebsitesPage
