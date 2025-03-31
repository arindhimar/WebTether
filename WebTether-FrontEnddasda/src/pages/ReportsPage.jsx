"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "../components/ui/navbar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  FileText,
  Plus,
  Search,
  Download,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Clock,
  Globe,
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
const mockReports = [
  {
    id: 1,
    name: "Monthly Uptime Report",
    description: "Overview of website uptime for the past month",
    dateRange: "Apr 1, 2023 - Apr 30, 2023",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    type: "uptime",
    websites: "All websites",
  },
  {
    id: 2,
    name: "API Performance Analysis",
    description: "Detailed analysis of API performance and latency",
    dateRange: "Apr 15, 2023 - Apr 30, 2023",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    type: "performance",
    websites: "api.example.com",
  },
  {
    id: 3,
    name: "Downtime Incident Report",
    description: "Analysis of recent downtime incidents",
    dateRange: "Apr 20, 2023 - Apr 25, 2023",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    type: "incident",
    websites: "store.example.com",
  },
  {
    id: 4,
    name: "Weekly Status Report",
    description: "Weekly overview of all monitored websites",
    dateRange: "Apr 24, 2023 - Apr 30, 2023",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    type: "status",
    websites: "All websites",
  },
  {
    id: 5,
    name: "Validator Performance",
    description: "Analysis of validator performance and reliability",
    dateRange: "Apr 1, 2023 - Apr 30, 2023",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    type: "validator",
    websites: "N/A",
  },
]

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredReports = mockReports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.websites.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const currentReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getReportIcon = (type) => {
    switch (type) {
      case "uptime":
        return <BarChart3 className="h-4 w-4" />
      case "performance":
        return <Clock className="h-4 w-4" />
      case "incident":
        return <FileText className="h-4 w-4" />
      case "status":
        return <Globe className="h-4 w-4" />
      case "validator":
        return <Globe className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

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
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Generate and view reports for your websites</p>
          </div>

          <Button className="md:self-end flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Generate Report</span>
          </Button>
        </motion.div>

        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold">Your Reports</h2>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </Button>

              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Date Range</span>
              </Button>
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Websites
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentReports.length > 0 ? (
                    currentReports.map((report) => (
                      <tr key={report.id} className="bg-card hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {getReportIcon(report.type)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium">{report.name}</div>
                              <div className="text-xs text-muted-foreground">{report.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{report.dateRange}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{report.websites}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDateTime(report.createdAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        {searchQuery ? (
                          <div>
                            <p>No reports found matching "{searchQuery}"</p>
                            <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                              Clear search
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p>No reports generated yet</p>
                            <Button variant="link" className="mt-2">
                              Generate your first report
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
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> of{" "}
                  <span className="font-medium">{filteredReports.length}</span> results
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

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Generate a Custom Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Create a custom report with specific parameters to analyze your website's performance.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="report-type" className="block text-sm font-medium mb-1">
                        Report Type
                      </label>
                      <select
                        id="report-type"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      >
                        <option value="uptime">Uptime Report</option>
                        <option value="performance">Performance Analysis</option>
                        <option value="incident">Incident Report</option>
                        <option value="status">Status Report</option>
                        <option value="validator">Validator Performance</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium mb-1">
                        Website
                      </label>
                      <select
                        id="website"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      >
                        <option value="all">All Websites</option>
                        <option value="api">api.example.com</option>
                        <option value="store">store.example.com</option>
                        <option value="blog">blog.example.com</option>
                        <option value="dashboard">dashboard.example.com</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="date-range" className="block text-sm font-medium mb-1">
                        Date Range
                      </label>
                      <select
                        id="date-range"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      >
                        <option value="last-7">Last 7 days</option>
                        <option value="last-30">Last 30 days</option>
                        <option value="last-90">Last 90 days</option>
                        <option value="custom">Custom range</option>
                      </select>
                    </div>
                  </div>

                  <Button className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Set up automated reports to be generated and sent to you on a schedule.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <h4 className="text-sm font-medium">Weekly Status Report</h4>
                        <p className="text-xs text-muted-foreground">Every Monday at 9:00 AM</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <h4 className="text-sm font-medium">Monthly Performance Report</h4>
                        <p className="text-xs text-muted-foreground">1st day of each month</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Add Scheduled Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

