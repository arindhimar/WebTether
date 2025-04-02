import { useState } from "react"
import { AlertCircle, CheckCircle2, Clock, Edit, MoreHorizontal, Plus, RefreshCw, Trash2 } from 'lucide-react'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data for websites
const mockWebsites = [
  {
    id: 1,
    url: "https://example.com",
    status: "up",
    latency: 120,
    lastChecked: "2 mins ago",
    history: [
      { time: "12:00", latency: 100 },
      { time: "12:05", latency: 110 },
      { time: "12:10", latency: 90 },
      { time: "12:15", latency: 120 },
      { time: "12:20", latency: 115 },
      { time: "12:25", latency: 130 },
      { time: "12:30", latency: 120 },
    ],
  },
  {
    id: 2,
    url: "https://test.org",
    status: "down",
    latency: 0,
    lastChecked: "5 mins ago",
    history: [
      { time: "12:00", latency: 150 },
      { time: "12:05", latency: 160 },
      { time: "12:10", latency: 200 },
      { time: "12:15", latency: 0 },
      { time: "12:20", latency: 0 },
      { time: "12:25", latency: 0 },
      { time: "12:30", latency: 0 },
    ],
  },
  {
    id: 3,
    url: "https://demo.net",
    status: "up",
    latency: 89,
    lastChecked: "1 min ago",
    history: [
      { time: "12:00", latency: 95 },
      { time: "12:05", latency: 92 },
      { time: "12:10", latency: 88 },
      { time: "12:15", latency: 90 },
      { time: "12:20", latency: 85 },
      { time: "12:25", latency: 89 },
      { time: "12:30", latency: 89 },
    ],
  },
  {
    id: 4,
    url: "https://mysite.io",
    status: "timeout",
    latency: 3000,
    lastChecked: "10 mins ago",
    history: [
      { time: "12:00", latency: 200 },
      { time: "12:05", latency: 250 },
      { time: "12:10", latency: 300 },
      { time: "12:15", latency: 500 },
      { time: "12:20", latency: 1000 },
      { time: "12:25", latency: 2000 },
      { time: "12:30", latency: 3000 },
    ],
  },
]

export default function WebsitesPage() {
  const [websites, setWebsites] = useState(mockWebsites)
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("")
  const [isAddingWebsite, setIsAddingWebsite] = useState(false)
  const [editingWebsite, setEditingWebsite] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [websiteToDelete, setWebsiteToDelete] = useState(null)

  const addWebsite = () => {
    if (!newWebsiteUrl) return

    const newWebsite = {
      id: websites.length + 1,
      url: newWebsiteUrl,
      status: "up",
      latency: Math.floor(Math.random() * 200) + 50,
      lastChecked: "just now",
      history: [
        { time: "12:00", latency: 100 },
        { time: "12:05", latency: 110 },
        { time: "12:10", latency: 90 },
        { time: "12:15", latency: 120 },
        { time: "12:20", latency: 115 },
        { time: "12:25", latency: 130 },
        { time: "12:30", latency: 120 },
      ],
    }

    setWebsites([...websites, newWebsite])
    setNewWebsiteUrl("")
    setIsAddingWebsite(false)
  }

  const updateWebsite = () => {
    if (!editingWebsite) return

    setWebsites(websites.map((website) => (website.id === editingWebsite.id ? editingWebsite : website)))

    setIsEditing(false)
    setEditingWebsite(null)
  }

  const deleteWebsite = () => {
    if (!websiteToDelete) return

    setWebsites(websites.filter((website) => website.id !== websiteToDelete.id))
    setIsDeleting(false)
    setWebsiteToDelete(null)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "up":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "timeout":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "up":
        return <Badge className="bg-green-500">Up</Badge>
      case "down":
        return <Badge className="bg-red-500">Down</Badge>
      case "timeout":
        return <Badge className="bg-yellow-500">Timeout</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Website Management</h2>
        <Dialog open={isAddingWebsite} onOpenChange={setIsAddingWebsite}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Website
            </Button>
          </DialogTrigger>
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
      </div>

      {websites.length === 0 ? (
        <Alert>
          <AlertTitle>No websites found</AlertTitle>
          <AlertDescription>
            You haven't added any websites to monitor yet. Click the "Add Website" button to get started.
          </AlertDescription>
        </Alert>
      ) : (
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
            <div className="grid gap-6">
              {websites.map((website) => (
                <Card key={website.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2">
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
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Ping Now
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="up" className="mt-6">
            <div className="grid gap-6">
              {websites
                .filter((w) => w.status === "up")
                .map((website) => (
                  <Card key={website.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="flex items-center gap-2">
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
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Ping Now
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="down" className="mt-6">
            <div className="grid gap-6">
              {websites
                .filter((w) => w.status === "down")
                .map((website) => (
                  <Card key={website.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="flex items-center gap-2">
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
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Ping Now
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="timeout" className="mt-6">
            <div className="grid gap-6">
              {websites
                .filter((w) => w.status === "timeout")
                .map((website) => (
                  <Card key={website.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="flex items-center gap-2">
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
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Ping Now
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
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
    </div>
  )
}
