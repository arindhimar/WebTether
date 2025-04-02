"use client"

import { useState, useEffect } from "react"
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

// Mock data for websites
const mockWebsites = [
  { id: 1, url: "https://example.com", status: "up", latency: 120, lastChecked: "2 mins ago" },
  { id: 2, url: "https://test.org", status: "down", latency: 0, lastChecked: "5 mins ago" },
  { id: 3, url: "https://demo.net", status: "up", latency: 89, lastChecked: "1 min ago" },
  { id: 4, url: "https://mysite.io", status: "timeout", latency: 3000, lastChecked: "10 mins ago" },
]

// Mock data for charts
const uptimeData = [
  { name: "Mon", value: 98 },
  { name: "Tue", value: 100 },
  { name: "Wed", value: 99 },
  { name: "Thu", value: 97 },
  { name: "Fri", value: 100 },
  { name: "Sat", value: 100 },
  { name: "Sun", value: 99 },
]

const latencyData = [
  { name: "Mon", value: 110 },
  { name: "Tue", value: 95 },
  { name: "Wed", value: 105 },
  { name: "Thu", value: 120 },
  { name: "Fri", value: 90 },
  { name: "Sat", value: 85 },
  { name: "Sun", value: 100 },
]

export default function DashboardPage() {
  const [websites, setWebsites] = useState(mockWebsites)
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("")
  const [isAddingWebsite, setIsAddingWebsite] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Animation effect when component mounts
  useEffect(() => {
    setMounted(true)

    // Animate progress bar
    const timer = setTimeout(() => {
      setProgress(66)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const addWebsite = () => {
    if (!newWebsiteUrl) return

    const newWebsite = {
      id: websites.length + 1,
      url: newWebsiteUrl,
      status: "up",
      latency: Math.floor(Math.random() * 200) + 50,
      lastChecked: "just now",
    }

    setWebsites([...websites, newWebsite])
    setNewWebsiteUrl("")
    setIsAddingWebsite(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "up":
        return <CheckCircle2 className="h-5 w-5 text-green-500 animate-pulse-subtle" />
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500 animate-pulse-subtle" />
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
      case "timeout":
        return <Badge className="bg-yellow-500 animate-pulse-subtle">Timeout</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className={`space-y-8 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-text">Welcome Back</h2>
          <p className="text-muted-foreground">Here's an overview of your website monitoring status</p>
        </div>
        <Dialog open={isAddingWebsite} onOpenChange={setIsAddingWebsite}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="animate-in-button">
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
                  className="focus-visible:ring-primary"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingWebsite(false)}>
                Cancel
              </Button>
              <Button onClick={addWebsite} variant="gradient">
                Add Website
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-card-appear" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
            <Globe className="h-4 w-4 text-primary animate-hover-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{websites.length}</div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span className="flex items-center text-green-500">
                <ArrowRight className="mr-1 h-3 w-3 rotate-45" />
                +2 this week
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-card-appear" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary animate-hover-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((websites.filter((w) => w.status === "up").length / websites.length) * 100)}%
            </div>
            <div className="mt-2">
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="animate-card-appear" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Latency</CardTitle>
            <Zap className="h-4 w-4 text-primary animate-hover-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(
                websites.filter((w) => w.status === "up").reduce((acc, site) => acc + site.latency, 0) /
                  websites.filter((w) => w.status === "up").length,
              )}
              <span className="text-lg font-normal">ms</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span className="flex items-center text-green-500">
                <ArrowRight className="mr-1 h-3 w-3 -rotate-45" />
                15ms faster than last week
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-card-appear" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validator Status</CardTitle>
            <Activity className="h-4 w-4 text-primary animate-hover-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Active</div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span className="flex items-center">Level 2 Validator • 215 coins earned</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-card-appear" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle>Uptime Overview</CardTitle>
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
        </Card>

        <Card className="animate-card-appear" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle>Latency Trends</CardTitle>
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
        </Card>
      </div>

      <div className="animate-card-appear" style={{ animationDelay: "0.7s" }}>
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="animate-in-button">
                All Websites
              </TabsTrigger>
              <TabsTrigger value="up" className="animate-in-button">
                Up
              </TabsTrigger>
              <TabsTrigger value="down" className="animate-in-button">
                Down
              </TabsTrigger>
              <TabsTrigger value="timeout" className="animate-in-button">
                Timeout
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" className="w-full sm:w-auto animate-in-button">
              <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin" />
              Refresh
            </Button>
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {websites.map((website, index) => (
                <Card
                  key={website.id}
                  className="animate-card-appear"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="line-clamp-1">{website.url}</CardTitle>
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
                    <Button variant="outline" size="sm" className="animate-in-button">
                      <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin" />
                      Ping
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="animate-in-button">
                      <Link to={`/dashboard/websites/${website.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="up" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {websites
                .filter((w) => w.status === "up")
                .map((website, index) => (
                  <Card
                    key={website.id}
                    className="animate-card-appear"
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="line-clamp-1">{website.url}</CardTitle>
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
                      <Button variant="outline" size="sm" className="animate-in-button">
                        <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin" />
                        Ping
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="animate-in-button">
                        <Link to={`/dashboard/websites/${website.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="down" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {websites
                .filter((w) => w.status === "down")
                .map((website, index) => (
                  <Card
                    key={website.id}
                    className="animate-card-appear"
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="line-clamp-1">{website.url}</CardTitle>
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
                      <Button variant="outline" size="sm" className="animate-in-button">
                        <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin" />
                        Ping
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="animate-in-button">
                        <Link to={`/dashboard/websites/${website.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="timeout" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {websites
                .filter((w) => w.status === "timeout")
                .map((website, index) => (
                  <Card
                    key={website.id}
                    className="animate-card-appear"
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="line-clamp-1">{website.url}</CardTitle>
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
                      <Button variant="outline" size="sm" className="animate-in-button">
                        <RefreshCw className="mr-2 h-4 w-4 animate-hover-spin" />
                        Ping
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="animate-in-button">
                        <Link to={`/dashboard/websites/${website.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

