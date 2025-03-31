"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "../components/ui/navbar"
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
} from "lucide-react"
import { formatNumber } from "../lib/utils"

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

// Mock data
const mockWebsites = [
  {
    id: 1,
    url: "https://example.com",
    status: "up",
    uptime: "99.98%",
    latency: 124,
    lastChecked: "2 minutes ago",
  },
  {
    id: 2,
    url: "https://dashboard.example.com",
    status: "up",
    uptime: "99.95%",
    latency: 156,
    lastChecked: "3 minutes ago",
  },
  {
    id: 3,
    url: "https://api.example.com",
    status: "down",
    uptime: "98.76%",
    latency: 0,
    lastChecked: "1 minute ago",
  },
  {
    id: 4,
    url: "https://blog.example.com",
    status: "up",
    uptime: "99.99%",
    latency: 89,
    lastChecked: "5 minutes ago",
  },
  {
    id: 5,
    url: "https://store.example.com",
    status: "degraded",
    uptime: "99.87%",
    latency: 312,
    lastChecked: "2 minutes ago",
  },
]

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
  const [searchQuery, setSearchQuery] = useState("")

  const filteredWebsites = mockWebsites.filter((website) =>
    website.url.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isLoggedIn={true} />

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

          <Button className="md:self-end flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Website</span>
          </Button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Websites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatNumber(5)}</div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Validators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatNumber(24)}</div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">99.92%</div>
                  <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">142ms</div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
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
                          {website.lastChecked}
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
                            <Button variant="link" className="mt-2">
                              Add your first website
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="mt-0.5">
                      <ArrowDownRight className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">api.example.com is down</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        The website has been down for 15 minutes. Validators in 3 locations reported connection
                        failures.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          View Details
                        </Button>
                        <span className="text-xs text-muted-foreground">Started 15 minutes ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="mt-0.5">
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">store.example.com is degraded</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        The website is experiencing high latency. Average response time is 312ms.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          View Details
                        </Button>
                        <span className="text-xs text-muted-foreground">Started 35 minutes ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="mt-0.5">
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">api.example.com is back up</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        The website has recovered from the outage. Total downtime was 23 minutes.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          View Details
                        </Button>
                        <span className="text-xs text-muted-foreground">Resolved 2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Active Validators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Validator {i}</h4>
                          <p className="text-xs text-muted-foreground">
                            {["New York, USA", "London, UK", "Tokyo, Japan"][i - 1]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          Online
                        </span>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Link to="/validators" className="block">
                    <Button variant="outline" className="w-full">
                      View All Validators
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

