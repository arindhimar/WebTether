"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Globe,
  ArrowRight,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useBackendAuthContext } from "../../context/backend-auth-context"
import { websiteAPI } from "../../services/api"
import { useToast } from "../../components/ui/use-toast"
// Import the AnimatedCard component
import { AnimatedCard } from "../../components/ui/animated-card"
import { motion } from "framer-motion"

// Add animation variants
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

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([])
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("")
  const [isAddingWebsite, setIsAddingWebsite] = useState(false)
  const [editingWebsite, setEditingWebsite] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [websiteToDelete, setWebsiteToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { backendUser } = useBackendAuthContext()
  const { toast } = useToast()

  // Fetch websites from API
  useEffect(() => {
    const fetchWebsites = async () => {
      if (!backendUser) return

      try {
        setIsLoading(true)
        const { data } = await websiteAPI.getAllWebsites()

        // If we have real data, use it
        if (data && Array.isArray(data)) {
          setWebsites(data.map(website => ({
            ...website,
            // Convert string uptime percentage to number for charts
            uptimeValue: Number.parseFloat(website.uptime.replace('%', '')),
            // Generate history data for charts if not provided by API
            history: website.history || generateMockHistory(website.latency, website.status)
          })))
        } else {
          // Fallback to mock data
          setWebsites([
            {
              id: 1,
              url: "https://example.com",
              status: "up",
              latency: 120,
              uptime: "99.95%",
              uptimeValue: 99.95,
              lastChecked: "2 mins ago",
              history: generateMockHistory(120, "up"),
            },
            {
              id: 2,
              url: "https://test.org",
              status: "down",
              latency: 0,
              uptime: "95.20%",
              uptimeValue: 95.20,
              lastChecked: "5 mins ago",
              history: generateMockHistory(0, "down"),
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching websites:", error)
        toast({
          title: "Error",
          description: "Failed to load websites. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWebsites()
  }, [backendUser, toast])

  // Helper function to generate mock history data for charts
  const generateMockHistory = (baseLatency, status) => {
    if (status === "down") {
      return [
        { time: "12:00", latency: baseLatency || 150 },
        { time: "12:05", latency: baseLatency || 160 },
        { time: "12:10", latency: baseLatency || 200 },
        { time: "12:15", latency: 0 },
        { time: "12:20", latency: 0 },
        { time: "12:25", latency: 0 },
        { time: "12:30", latency: 0 },
      ]
    }

    return [
      { time: "12:00", latency: (baseLatency || 100) - Math.random() * 20 },
      { time: "12:05", latency: (baseLatency || 100) + Math.random() * 20 },
      { time: "12:10", latency: (baseLatency || 100) - Math.random() * 10 },
      { time: "12:15", latency: (baseLatency || 100) + Math.random() * 15 },
      { time: "12:20", latency: (baseLatency || 100) - Math.random() * 5 },
      { time: "12:25", latency: (baseLatency || 100) + Math.random() * 10 },
      { time: "12:30", latency: baseLatency || 100 },
    ]
  }

  // Update the addWebsite function to match backend API
  const addWebsite = async () => {
    if (!newWebsiteUrl) return

    try {
      // Create website in backend
      const { data } = await websiteAPI.createWebsite({
        url: newWebsiteUrl,
        description: "",
        monitoring_frequency: "5 minutes",
        alerts_enabled: true
      })

      if (data && data.website) {
        // Add to local state with history data for UI
        const newWebsite = {
          ...data.website,
          uptimeValue: Number.parseFloat(data.website.uptime.replace('%', '')),
          history: generateMockHistory(data.website.latency, data.website.status),
          lastChecked: data.website.last_checked ? new Date(data.website.last_checked).toLocaleTimeString() : "just now"
        }

        setWebsites([...websites, newWebsite])
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

  // Update the updateWebsite function to match backend API
  const updateWebsite = async () => {
    if (!editingWebsite) return

    try {
      // Update website in backend
      const { data } = await websiteAPI.updateWebsite(editingWebsite.id, {
        url: editingWebsite.url,
        description: editingWebsite.description || "",
        monitoring_frequency: editingWebsite.monitoring_frequency || "5 minutes",
        alerts_enabled: editingWebsite.alerts_enabled !== undefined ? editingWebsite.alerts_enabled : true
      })

      if (data && data.website) {
        // Update local state
        setWebsites(websites.map((website) =>
          website.id === editingWebsite.id ? {
            ...data.website,
            uptimeValue: Number.parseFloat(data.website.uptime.replace('%', '')),
            history: website.history, // Keep existing history data
            lastChecked: data.website.last_checked ? new Date(data.website.last_checked).toLocaleTimeString() : website.lastChecked
          } : website
        ))
      } else {
        // Fallback if API doesn't return updated website
        setWebsites(websites.map((website) =>
          website.id === editingWebsite.id ? editingWebsite : website
        ))
      }

      setIsEditing(false)
      setEditingWebsite(null)

      toast({
        title: "Website Updated",
        description: `${editingWebsite.url} has been updated.`,
      })
    } catch (error) {
      console.error("Error updating website:", error)
      toast({
        title: "Error",
        description: "Failed to update website. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteWebsite = async () => {
    if (!websiteToDelete) return

    try {
      // Delete website from backend
      await websiteAPI.deleteWebsite(websiteToDelete.id)

      // Update local state
      setWebsites(websites.filter((website) => website.id !== websiteToDelete.id))
      setIsDeleting(false)
      setWebsiteToDelete(null)

      toast({
        title: "Website Deleted",
        description: `${websiteToDelete.url} has been removed from your monitoring list.`,
      })
    } catch (error) {
      console.error("Error deleting website:", error)
      toast({
        title: "Error",
        description: "Failed to delete website. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Rest of the component remains the same
  // Update the getStatusIcon and getStatusBadge functions to handle backend status values
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "up":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "timeout":
      case "unknown":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "up":
        return <Badge className="bg-green-500">Up</Badge>
      case "down":
        return <Badge className="bg-red-500">Down</Badge>
      case "degraded":
        return <Badge className="bg-yellow-500">Degraded</Badge>
      case "timeout":
        return <Badge className="bg-yellow-500">Timeout</Badge>
      case "unknown":
        return <Badge className="bg-gray-500">Unknown</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-lg font-medium">Loading websites...</p>
        </div>
      </div>
    )
  }

  // Wrap the main content in motion.div
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Website Management</h2>
        <Dialog open={isAddingWebsite} onOpenChange={setIsAddingWebsite}>
          <DialogContent>
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingWebsite(false)}>
                Cancel
              </Button>
              <Button onClick={addWebsite}>Add Website</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {websites.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Alert>
            <AlertTitle>No websites found</AlertTitle>
            <AlertDescription>
              You haven't added any websites to monitor yet. Click the "Add Website" button to get started.
            </AlertDescription>
          </Alert>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="all">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Websites</TabsTrigger>
                <TabsTrigger value="up">Up</TabsTrigger>
                <TabsTrigger value="down">Down</TabsTrigger>
                <TabsTrigger value="timeout">Timeout</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh All
              </Button>
            </div>

            <TabsContent value="all" className="mt-6">
              <motion.div className="grid gap-6" variants={containerVariants}>
                {websites.map((website, index) => (
                  <motion.div key={website.id} variants={itemVariants}>
                    <AnimatedCard>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                          <CardTitle className="flex items-center gap-2 gradient-text">
                            {website.url}
                            {getStatusIcon(website.status)}
                          </CardTitle>
                          <CardDescription>Last checked: {website.lastChecked}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingWebsite(website)
                                setIsEditing(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => {
                                setWebsiteToDelete(website)
                                setIsDeleting(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">Status: {getStatusBadge(website.status)}</div>
                          <div>
                            {website.status === "up" && (
                              <span className="text-sm text-muted-foreground">Latency: {website.latency}ms</span>
                            )}
                          </div>
                        </div>
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={website.history}
                              margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="latency"
                                stroke={
                                  website.status === "up" ? "#10b981" : website.status === "down" ? "#ef4444" : "#f59e0b"
                                }
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" className="animate-in-button group">
                          <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin-slow" />
                          Ping Now
                        </Button>
                        <Button variant="ghost" size="sm" className="animate-in-button group">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </AnimatedCard>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Other tab contents remain the same */}
            <TabsContent value="up" className="mt-6">
              <motion.div className="grid gap-6" variants={containerVariants}>
                {websites
                  .filter((w) => w.status === "up")
                  .map((website) => (
                    <motion.div key={website.id} variants={itemVariants}>
                      <AnimatedCard>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                          <div>
                            <CardTitle className="flex items-center gap-2 gradient-text">
                              {website.url}
                              {getStatusIcon(website.status)}
                            </CardTitle>
                            <CardDescription>Last checked: {website.lastChecked}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingWebsite(website)
                                  setIsEditing(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={() => {
                                  setWebsiteToDelete(website)
                                  setIsDeleting(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">Status: {getStatusBadge(website.status)}</div>
                            <div>
                              <span className="text-sm text-muted-foreground">Latency: {website.latency}ms</span>
                            </div>
                          </div>
                          <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={website.history}
                                margin={{
                                  top: 5,
                                  right: 10,
                                  left: 10,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" className="animate-in-button group">
                            <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin-slow" />
                            Ping Now
                          </Button>
                          <Button variant="ghost" size="sm" className="animate-in-button group">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardFooter>
                      </AnimatedCard>
                    </motion.div>
                  ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="down" className="mt-6">
              <motion.div className="grid gap-6" variants={containerVariants}>
                {websites
                  .filter((w) => w.status === "down")
                  .map((website) => (
                    <motion.div key={website.id} variants={itemVariants}>
                      <AnimatedCard>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                          <div>
                            <CardTitle className="flex items-center gap-2 gradient-text">
                              {website.url}
                              {getStatusIcon(website.status)}
                            </CardTitle>
                            <CardDescription>Last checked: {website.lastChecked}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingWebsite(website)
                                  setIsEditing(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={() => {
                                  setWebsiteToDelete(website)
                                  setIsDeleting(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">Status: {getStatusBadge(website.status)}</div>
                          </div>
                          <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={website.history}
                                margin={{
                                  top: 5,
                                  right: 10,
                                  left: 10,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" className="animate-in-button group">
                            <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin-slow" />
                            Ping Now
                          </Button>
                          <Button variant="ghost" size="sm" className="animate-in-button group">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardFooter>
                      </AnimatedCard>
                    </motion.div>
                  ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="timeout" className="mt-6">
              <motion.div className="grid gap-6" variants={containerVariants}>
                {websites
                  .filter((w) => w.status === "timeout")
                  .map((website) => (
                    <motion.div key={website.id} variants={itemVariants}>
                      <AnimatedCard>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                          <div>
                            <CardTitle className="flex items-center gap-2 gradient-text">
                              {website.url}
                              {getStatusIcon(website.status)}
                            </CardTitle>
                            <CardDescription>Last checked: {website.lastChecked}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingWebsite(website)
                                  setIsEditing(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={() => {
                                  setWebsiteToDelete(website)
                                  setIsDeleting(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">Status: {getStatusBadge(website.status)}</div>
                          </div>
                          <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={website.history}
                                margin={{
                                  top: 5,
                                  right: 10,
                                  left: 10,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" className="animate-in-button group">
                            <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin-slow" />
                            Ping Now
                          </Button>
                          <Button variant="ghost" size="sm" className="animate-in-button group">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardFooter>
                      </AnimatedCard>
                    </motion.div>
                  ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* Edit Website Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Website</DialogTitle>
            <DialogDescription>Update the URL of the website you want to monitor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-url">Website URL</Label>
              <Input
                id="edit-url"
                placeholder="https://example.com"
                value={editingWebsite?.url || ""}
                onChange={(e) => setEditingWebsite({ ...editingWebsite, url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={updateWebsite}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Website Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Website</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this website? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{websiteToDelete?.url}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteWebsite}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

