"use client"

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "../components/ui/navbar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
  MapPin,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react"
import { formatDateTime } from "../lib/utils"

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
const mockWebsite = {
  id: 3,
  url: "https://api.example.com",
  status: "down",
  uptime: "98.76%",
  latency: 0,
  lastChecked: new Date(),
  description: "Main API endpoint for the application",
  created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
  monitoringFrequency: "1 minute",
  alertsEnabled: true,
}

const mockPings = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: "down",
    latency: 0,
    validator: "Validator 1",
    location: "New York, USA",
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 6 * 60 * 1000),
    status: "down",
    latency: 0,
    validator: "Validator 2",
    location: "London, UK",
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 7 * 60 * 1000),
    status: "down",
    latency: 0,
    validator: "Validator 3",
    location: "Tokyo, Japan",
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: "up",
    latency: 124,
    validator: "Validator 1",
    location: "New York, USA",
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 11 * 60 * 1000),
    status: "up",
    latency: 156,
    validator: "Validator 2",
    location: "London, UK",
  },
  {
    id: 6,
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    status: "up",
    latency: 189,
    validator: "Validator 3",
    location: "Tokyo, Japan",
  },
  {
    id: 7,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: "up",
    latency: 118,
    validator: "Validator 1",
    location: "New York, USA",
  },
  {
    id: 8,
    timestamp: new Date(Date.now() - 16 * 60 * 1000),
    status: "up",
    latency: 142,
    validator: "Validator 2",
    location: "London, UK",
  },
  {
    id: 9,
    timestamp: new Date(Date.now() - 17 * 60 * 1000),
    status: "up",
    latency: 176,
    validator: "Validator 3",
    location: "Tokyo, Japan",
  },
]

const mockIncidents = [
  {
    id: 1,
    startTime: new Date(Date.now() - 20 * 60 * 1000),
    endTime: null,
    status: "ongoing",
    type: "downtime",
    description: "Website is not responding to requests",
  },
  {
    id: 2,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
    status: "resolved",
    type: "high-latency",
    description: "Website experienced high latency",
  },
  {
    id: 3,
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 6.9 * 24 * 60 * 60 * 1000),
    status: "resolved",
    type: "downtime",
    description: "Website was down for maintenance",
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

const UptimeChart = () => {
  // This is a simplified chart component
  // In a real app, you would use a library like recharts or chart.js

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const data = [99.9, 100, 100, 98.2, 99.8, 100, 95.5]

  return (
    <div className="pt-4">
      <div className="flex items-end h-24 gap-1">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full rounded-t-sm ${
                value < 99 ? "bg-red-500" : value < 99.9 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ height: `${(value / 100) * 80}%` }}
            ></div>
            <div className="text-xs text-muted-foreground mt-1">{days[index]}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <div>Last 7 days</div>
        <div>Average: 99.1%</div>
      </div>
    </div>
  )
}

const LatencyChart = () => {
  // This is a simplified chart component
  // In a real app, you would use a library like recharts or chart.js

  const hours = ["1h", "2h", "3h", "4h", "5h", "6h", "Now"]
  const data = [124, 118, 132, 145, 128, 0, 0]

  return (
    <div className="pt-4">
      <div className="flex items-end h-24 gap-1">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full rounded-t-sm ${
                value === 0 ? "bg-red-500" : value > 140 ? "bg-yellow-500" : "bg-blue-500"
              }`}
              style={{ height: value === 0 ? "5%" : `${(value / 200) * 80}%` }}
            ></div>
            <div className="text-xs text-muted-foreground mt-1">{hours[index]}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <div>Last 6 hours</div>
        <div>Average: 92ms</div>
      </div>
    </div>
  )
}

export default function WebsiteDetails() {
  const { id } = useParams()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // In a real app, you would fetch the website data based on the ID
  const website = mockWebsite

  // Calculate pagination
  const totalPages = Math.ceil(mockPings.length / itemsPerPage)
  const currentPings = mockPings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isLoggedIn={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{website.url}</h1>
              <StatusBadge status={website.status} />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              <Button>Check Now</Button>
            </div>
          </div>

          <p className="text-muted-foreground mt-2">{website.description}</p>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold capitalize">{website.status}</div>
                  <div
                    className={`p-2 rounded-full ${
                      website.status === "up"
                        ? "bg-green-500/10 text-green-500"
                        : website.status === "down"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    {website.status === "up" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : website.status === "down" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{website.uptime}</div>
                  <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{website.status === "down" ? "-" : `${website.latency}ms`}</div>
                  <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{website.monitoringFrequency}</div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Uptime (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <UptimeChart />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Latency (Last 6 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <LatencyChart />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeIn}>
          <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {mockIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      incident.status === "ongoing"
                        ? "bg-red-500/10 border-red-500/20"
                        : incident.type === "high-latency"
                          ? "bg-yellow-500/10 border-yellow-500/20"
                          : "bg-muted border-border"
                    }`}
                  >
                    <div className="mt-0.5">
                      {incident.status === "ongoing" ? (
                        <AlertTriangle
                          className={`h-5 w-5 ${incident.type === "downtime" ? "text-red-500" : "text-yellow-500"}`}
                        />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h4 className="text-sm font-medium">
                          {incident.type === "downtime" ? "Downtime Incident" : "High Latency Incident"}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            incident.status === "ongoing"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-green-500/10 text-green-500 border border-green-500/20"
                          }`}
                        >
                          {incident.status === "ongoing" ? "Ongoing" : "Resolved"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{incident.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Started: {formatDateTime(incident.startTime)}</span>
                        {incident.endTime && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>Ended: {formatDateTime(incident.endTime)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              Duration: {Math.round((incident.endTime - incident.startTime) / (1000 * 60))} minutes
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {mockIncidents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No incidents reported</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <h2 className="text-xl font-semibold mb-4">Recent Pings</h2>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Latency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Validator
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentPings.map((ping) => (
                    <tr key={ping.id} className="bg-card hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDateTime(ping.timestamp)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={ping.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {ping.status === "down" ? "-" : `${ping.latency}ms`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{ping.validator}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                          {ping.location}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, mockPings.length)}</span> of{" "}
                  <span className="font-medium">{mockPings.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

