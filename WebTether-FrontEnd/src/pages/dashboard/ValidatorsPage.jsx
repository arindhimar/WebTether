"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
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
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { useToast } from "../../hooks/use-toast"
import { useBackendAuth } from "../../hooks/use-backend-auth"
import {
  Activity,
  AlertTriangle,
  Check,
  Globe,
  MapPin,
  Plus,
  RefreshCw,
  Server,
  Settings,
  Trash2,
  User,
  Wifi,
  X,
} from "lucide-react"
import api from "../../services/api"

const ValidatorsPage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useBackendAuth()

  const [validators, setValidators] = useState([])
  const [websites, setWebsites] = useState([])
  const [availableWebsites, setAvailableWebsites] = useState([])
  const [stats, setStats] = useState({
    totalValidators: 0,
    activeValidators: 0,
    locations: 0,
    monitoredWebsites: 0,
    totalPings: 0,
    successfulPings: 0,
    totalRewards: 0,
    level: 1,
    progress: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isPinging, setPinging] = useState(false)
  const [selectedValidator, setSelectedValidator] = useState(null)
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [pingResults, setPingResults] = useState(null)
  const [activeTab, setActiveTab] = useState("validators")

  // Form state
  const [newValidator, setNewValidator] = useState({
    name: "",
    location: "",
    ip: "",
    websites: [],
  })

  // Fetch validators
  const fetchValidators = async () => {
    try {
      const response = await api.validatorAPI.getAllValidators()
      setValidators(response.data)
    } catch (error) {
      console.error("Error fetching validators:", error)
      toast({
        title: "Error",
        description: "Failed to fetch validators. Please try again.",
        variant: "destructive",
      })
    }
  }

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

  // Fetch all available websites (owned + public)
  const fetchAvailableWebsites = async () => {
    try {
      const response = await api.validatorAPI.getAvailableWebsites()
      setAvailableWebsites(response.data)
    } catch (error) {
      console.error("Error fetching available websites:", error)
      toast({
        title: "Error",
        description: "Failed to fetch available websites. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch validator stats
  const fetchValidatorStats = async () => {
    try {
      // Try to fetch enhanced stats first
      try {
        const response = await api.validatorAPI.get("/enhanced-stats")
        setStats(response.data)
      } catch (error) {
        // Fall back to regular stats if enhanced stats endpoint doesn't exist
        const response = await api.validatorAPI.get("/stats")
        setStats({
          ...stats,
          totalValidators: response.data.totalValidators,
          activeValidators: response.data.activeValidators,
          locations: response.data.locations,
          monitoredWebsites: response.data.monitoredWebsites,
        })
      }
    } catch (error) {
      console.error("Error fetching validator stats:", error)
      toast({
        title: "Error",
        description: "Failed to fetch validator statistics. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Load all data
  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchValidators(), fetchWebsites(), fetchValidatorStats(), fetchAvailableWebsites()])
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

  // Create validator
  const handleCreateValidator = async () => {
    if (!newValidator.name || !newValidator.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await api.validatorAPI.createValidator(newValidator)
      setValidators([...validators, response.data.validator])
      setNewValidator({
        name: "",
        location: "",
        ip: "",
        websites: [],
      })
      toast({
        title: "Success",
        description: "Validator created successfully.",
        variant: "default",
      })

      // Refresh stats
      fetchValidatorStats()
    } catch (error) {
      console.error("Error creating validator:", error)
      toast({
        title: "Error",
        description: "Failed to create validator. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Delete validator
  const handleDeleteValidator = async (validatorId) => {
    try {
      await api.validatorAPI.deleteValidator(validatorId)
      setValidators(validators.filter((v) => v.id !== validatorId))
      toast({
        title: "Success",
        description: "Validator deleted successfully.",
        variant: "default",
      })

      // Refresh stats
      fetchValidatorStats()
    } catch (error) {
      console.error("Error deleting validator:", error)
      toast({
        title: "Error",
        description: "Failed to delete validator. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Ping website
  const handlePingWebsite = async (validatorId, websiteId) => {
    setPinging(true)
    setPingResults(null)

    try {
      const response = await api.validatorAPI.post(`/${validatorId}/ping/${websiteId}`)
      setPingResults(response.data)

      // Update validators list to reflect the ping
      fetchValidators()

      // Update websites list to reflect status changes
      fetchWebsites()

      // Update available websites
      fetchAvailableWebsites()

      // Update stats
      fetchValidatorStats()

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

  // Handle website selection for a validator
  const handleWebsiteSelection = (websiteId) => {
    if (newValidator.websites.includes(websiteId)) {
      setNewValidator({
        ...newValidator,
        websites: newValidator.websites.filter((id) => id !== websiteId),
      })
    } else {
      setNewValidator({
        ...newValidator,
        websites: [...newValidator.websites, websiteId],
      })
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

  // Get ownership badge color
  const getOwnershipColor = (ownership) => {
    switch (ownership) {
      case "owned":
        return "bg-blue-500"
      case "public":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/sign-in")
    }
  }, [isAuthenticated, authLoading, navigate])

  if (!isAuthenticated) {
    return null
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Validators</h1>
        <div className="flex space-x-2">
          <Button onClick={loadData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Validator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Validator</DialogTitle>
                <DialogDescription>Add a new validator to monitor your websites.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newValidator.name}
                    onChange={(e) => setNewValidator({ ...newValidator, name: e.target.value })}
                    className="col-span-3"
                    placeholder="My Validator"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={newValidator.location}
                    onChange={(e) => setNewValidator({ ...newValidator, location: e.target.value })}
                    className="col-span-3"
                    placeholder="New York, USA"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ip" className="text-right">
                    IP Address
                  </Label>
                  <Input
                    id="ip"
                    value={newValidator.ip}
                    onChange={(e) => setNewValidator({ ...newValidator, ip: e.target.value })}
                    className="col-span-3"
                    placeholder="192.168.1.1 (Optional)"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Websites</Label>
                  <div className="col-span-3 space-y-2">
                    {availableWebsites.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No websites available. Add websites first.</p>
                    ) : (
                      availableWebsites.map((website) => (
                        <div key={website.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`website-${website.id}`}
                            checked={newValidator.websites.includes(website.id)}
                            onChange={() => handleWebsiteSelection(website.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`website-${website.id}`} className="text-sm flex items-center">
                            {website.url}
                            {website.ownership === "public" && <Badge className="ml-2 bg-purple-500">Public</Badge>}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateValidator}
                  disabled={isCreating || !newValidator.name || !newValidator.location}
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Validator"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Validators</p>
                <h3 className="text-2xl font-bold">{stats.totalValidators}</h3>
              </div>
              <Server className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Validators</p>
                <h3 className="text-2xl font-bold">{stats.activeValidators}</h3>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Locations</p>
                <h3 className="text-2xl font-bold">{stats.locations}</h3>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monitored Websites</p>
                <h3 className="text-2xl font-bold">{stats.monitoredWebsites}</h3>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validator Level */}
      {stats.level && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Validator Level</CardTitle>
            <CardDescription>Your current validator level and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level {stats.level}</span>
              {stats.level < 5 && <span className="text-sm text-muted-foreground">Level {stats.level + 1}</span>}
            </div>
            <Progress value={stats.level < 5 ? stats.progress : 100} className="h-2" />
            <div className="mt-2 text-sm text-muted-foreground">
              {stats.level < 5 ? `${stats.progress}% progress to next level` : "Maximum level reached"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validators List */}
      <Tabs defaultValue="validators" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="validators">Validators</TabsTrigger>
          <TabsTrigger value="websites">Assigned Websites</TabsTrigger>
          <TabsTrigger value="public-websites">Public Websites</TabsTrigger>
        </TabsList>

        <TabsContent value="validators">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : validators.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Server className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Validators Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't added any validators yet. Add your first validator to start monitoring websites.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Validator
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">{/* Same dialog content as above */}</DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validators.map((validator) => (
                <Card key={validator.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{validator.name}</CardTitle>
                      <Badge className={getStatusColor(validator.status)}>{getStatusText(validator.status)}</Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {validator.location}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">IP Address:</span>
                        <span>{validator.ip}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span>{formatUptime(validator.uptime)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Ping:</span>
                        <span>{validator.last_ping ? new Date(validator.last_ping).toLocaleString() : "Never"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Websites:</span>
                        <span>{validator.websites ? validator.websites.length : 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleDeleteValidator(validator.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedValidator(validator)
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="websites">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : validators.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Validators Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You need to add validators before you can assign websites to them.
                </p>
                <Button onClick={() => setActiveTab("validators")}>View Validators</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {validators.map((validator) => (
                <Card key={validator.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{validator.name}</CardTitle>
                      <Badge className={getStatusColor(validator.status)}>{getStatusText(validator.status)}</Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {validator.location}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {validator.websites && validator.websites.length > 0 ? (
                      <div className="space-y-4">
                        {validator.websites.map((website) => {
                          // Find the full website object from our websites array
                          const fullWebsite =
                            availableWebsites.find((w) => w.id === website.id) ||
                            websites.find((w) => w.id === website.id)
                          if (!fullWebsite) return null

                          return (
                            <div key={website.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center">
                                <Globe className="h-5 w-5 mr-3 text-primary" />
                                <div>
                                  <div className="flex items-center">
                                    <h4 className="font-medium">{fullWebsite.url}</h4>
                                    {fullWebsite.ownership === "public" && (
                                      <Badge className="ml-2 bg-purple-500">Public</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {fullWebsite.description || "No description"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(fullWebsite.status)}>
                                  {getStatusText(fullWebsite.status)}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedValidator(validator)
                                    setSelectedWebsite(fullWebsite)
                                    handlePingWebsite(validator.id, fullWebsite.id)
                                  }}
                                  disabled={isPinging}
                                >
                                  {isPinging && selectedWebsite?.id === fullWebsite.id ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Wifi className="h-4 w-4 mr-2" />
                                  )}
                                  Ping
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                        <h4 className="text-lg font-medium mb-1">No Websites Assigned</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          This validator doesn't have any websites assigned to it yet.
                        </p>
                        <Button variant="outline" size="sm" onClick={() => setSelectedValidator(validator)}>
                          Assign Websites
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public-websites">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Public Websites</CardTitle>
                  <CardDescription>These websites are publicly available for all validators to monitor</CardDescription>
                </CardHeader>
                <CardContent>
                  {availableWebsites.filter((w) => w.ownership === "public").length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Public Websites</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        There are no public websites available for monitoring yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableWebsites
                        .filter((website) => website.ownership === "public")
                        .map((website) => (
                          <div key={website.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                              <Globe className="h-5 w-5 mr-3 text-purple-500" />
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium">{website.url}</h4>
                                  <Badge className="ml-2 bg-purple-500">Public</Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <User className="h-3 w-3 mr-1" />
                                  {website.owner ? website.owner.username : "Unknown User"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(website.status)}>{getStatusText(website.status)}</Badge>
                              {validators.length > 0 && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Wifi className="h-4 w-4 mr-2" />
                                      Ping
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Select Validator</DialogTitle>
                                      <DialogDescription>
                                        Choose which validator to use for pinging this website
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                      {validators.map((validator) => (
                                        <div
                                          key={validator.id}
                                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted"
                                          onClick={() => {
                                            handlePingWebsite(validator.id, website.id)
                                            document
                                              .querySelector('[role="dialog"]')
                                              .querySelector('button[aria-label="Close"]')
                                              .click()
                                          }}
                                        >
                                          <div className="flex items-center">
                                            <Server className="h-5 w-5 mr-3 text-primary" />
                                            <div>
                                              <h4 className="font-medium">{validator.name}</h4>
                                              <p className="text-sm text-muted-foreground">{validator.location}</p>
                                            </div>
                                          </div>
                                          <Badge className={getStatusColor(validator.status)}>
                                            {getStatusText(validator.status)}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
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

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={pingResults.success ? "text-green-600" : "text-red-600"}>{pingResults.status}</span>
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

                {pingResults.success && pingResults.reward > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reward:</span>
                    <span className="text-yellow-600">{pingResults.reward} coins</span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setPingResults(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Validator Dialog */}
      {selectedValidator && (
        <Dialog open={!!selectedValidator} onOpenChange={(open) => !open && setSelectedValidator(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Manage Validator: {selectedValidator.name}</DialogTitle>
              <DialogDescription>Assign websites to this validator or update its information.</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="websites" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="websites">Websites</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="websites" className="py-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Assigned Websites</h4>
                  {availableWebsites.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No websites available. Add websites first.</p>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {availableWebsites.map((website) => {
                        const isAssigned =
                          selectedValidator.websites && selectedValidator.websites.some((w) => w.id === website.id)

                        return (
                          <div key={website.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`manage-website-${website.id}`}
                                checked={isAssigned}
                                onChange={async () => {
                                  try {
                                    if (isAssigned) {
                                      // Remove website
                                      await api.validatorAPI.delete(`/${selectedValidator.id}/websites/${website.id}`)
                                    } else {
                                      // Assign website
                                      await api.validatorAPI.post(`/${selectedValidator.id}/websites`, {
                                        website_id: website.id,
                                      })
                                    }
                                    // Refresh validators
                                    await fetchValidators()
                                    toast({
                                      title: "Success",
                                      description: isAssigned
                                        ? "Website removed from validator."
                                        : "Website assigned to validator.",
                                      variant: "default",
                                    })
                                  } catch (error) {
                                    console.error("Error updating validator websites:", error)
                                    toast({
                                      title: "Error",
                                      description: "Failed to update validator websites.",
                                      variant: "destructive",
                                    })
                                  }
                                }}
                                className="rounded border-gray-300 text-primary focus:ring-primary mr-3"
                              />
                              <div>
                                <label
                                  htmlFor={`manage-website-${website.id}`}
                                  className="text-sm cursor-pointer flex items-center"
                                >
                                  {website.url}
                                  {website.ownership === "public" && (
                                    <Badge className="ml-2 bg-purple-500">Public</Badge>
                                  )}
                                </label>
                                {website.ownership === "public" && website.owner && (
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {website.owner.username}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={getStatusColor(website.status)}>{getStatusText(website.status)}</Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="settings" className="py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">
                      Name
                    </Label>
                    <Input id="edit-name" defaultValue={selectedValidator.name} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-location" className="text-right">
                      Location
                    </Label>
                    <Input id="edit-location" defaultValue={selectedValidator.location} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-ip" className="text-right">
                      IP Address
                    </Label>
                    <Input id="edit-ip" defaultValue={selectedValidator.ip} className="col-span-3" />
                  </div>
                  <div className="flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ValidatorsPage
