"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  Users,
  Plus,
  Search,
  MapPin,
  Globe,
  Server,
  Clock,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
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
const mockValidators = [
  {
    id: 1,
    name: "Validator 1",
    location: "New York, USA",
    status: "online",
    websites: 5,
    uptime: "99.98%",
    lastPing: "2 minutes ago",
    ip: "192.168.1.1",
  },
  {
    id: 2,
    name: "Validator 2",
    location: "London, UK",
    status: "online",
    websites: 3,
    uptime: "99.95%",
    lastPing: "1 minute ago",
    ip: "192.168.1.2",
  },
  {
    id: 3,
    name: "Validator 3",
    location: "Tokyo, Japan",
    status: "online",
    websites: 4,
    uptime: "99.92%",
    lastPing: "3 minutes ago",
    ip: "192.168.1.3",
  },
  {
    id: 4,
    name: "Validator 4",
    location: "Sydney, Australia",
    status: "offline",
    websites: 2,
    uptime: "98.76%",
    lastPing: "1 day ago",
    ip: "192.168.1.4",
  },
  {
    id: 5,
    name: "Validator 5",
    location: "Berlin, Germany",
    status: "online",
    websites: 6,
    uptime: "99.99%",
    lastPing: "5 minutes ago",
    ip: "192.168.1.5",
  },
  {
    id: 6,
    name: "Validator 6",
    location: "Paris, France",
    status: "online",
    websites: 3,
    uptime: "99.87%",
    lastPing: "2 minutes ago",
    ip: "192.168.1.6",
  },
  {
    id: 7,
    name: "Validator 7",
    location: "Toronto, Canada",
    status: "offline",
    websites: 1,
    uptime: "97.65%",
    lastPing: "2 days ago",
    ip: "192.168.1.7",
  },
]

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "online":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "offline":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "degraded":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "online":
        return <ArrowUpRight className="w-3 h-3" />
      case "offline":
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

export default function ValidatorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredValidators = mockValidators.filter(
    (validator) =>
      validator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      validator.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredValidators.length / itemsPerPage)
  const currentValidators = filteredValidators.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
            <h1 className="text-3xl font-bold">Validators</h1>
            <p className="text-muted-foreground">Manage your network of validators</p>
          </div>

          <Button className="md:self-end flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Join as Validator</span>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Validators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatNumber(mockValidators.length)}</div>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Validators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {formatNumber(mockValidators.filter((v) => v.status === "online").length)}
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                    <Server className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {formatNumber(new Set(mockValidators.map((v) => v.location)).size)}
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monitored Websites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {formatNumber(mockValidators.reduce((acc, v) => acc + v.websites, 0))}
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold">Validator Network</h2>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search validators..."
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
                      Validator
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Websites
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Last Ping
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentValidators.length > 0 ? (
                    currentValidators.map((validator) => (
                      <tr key={validator.id} className="bg-card hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium">{validator.name}</div>
                              <div className="text-xs text-muted-foreground">{validator.ip}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                            {validator.location}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={validator.status} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{validator.websites}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{validator.uptime}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {validator.lastPing}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        {searchQuery ? (
                          <div>
                            <p>No validators found matching "{searchQuery}"</p>
                            <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                              Clear search
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p>No validators added yet</p>
                            <Button variant="link" className="mt-2">
                              Join as a validator
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredValidators.length)}</span>{" "}
                  of <span className="font-medium">{filteredValidators.length}</span> results
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

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle>Become a Validator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Join our network of validators and help monitor websites from your location. As a validator, you'll:
                </p>

                <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                  <li>Help monitor websites from your geographic location</li>
                  <li>Earn credits for each website you monitor</li>
                  <li>Contribute to a more reliable and distributed monitoring network</li>
                  <li>Get access to detailed analytics and insights</li>
                </ul>

                <div className="pt-4">
                  <Button className="w-full sm:w-auto">Join as a Validator</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

