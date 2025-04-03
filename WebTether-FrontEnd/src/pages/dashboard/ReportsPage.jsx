"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, Plus, XCircle, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { useToast } from "../../hooks/use-toast"
import { reportAPI, validatorAPI, websiteAPI } from "../../services/api"
import { useBackendAuthContext } from "../../context/backend-auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
// Import the AnimatedCard component and motion
import { AnimatedCard } from "../../components/ui/animated-card"
import { motion } from "framer-motion"

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [validators, setValidators] = useState([])
  const [websites, setWebsites] = useState([])
  const [isCreatingReport, setIsCreatingReport] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newReport, setNewReport] = useState({
    validator_id: "",
    website_id: "",
    reason: "",
  })
  const { toast } = useToast()
  const { backendUser } = useBackendAuthContext()

  // Fetch reports, validators, and websites data
  useEffect(() => {
    const fetchData = async () => {
      if (!backendUser) return

      try {
        setIsLoading(true)

        // Fetch reports
        const reportsResponse = await reportAPI.getAllReports()
        if (reportsResponse.data && Array.isArray(reportsResponse.data)) {
          setReports(reportsResponse.data)
        } else {
          // Fallback to mock data
          setReports([
            {
              id: 1,
              validator: "validator123",
              website: "https://example.com",
              reason: "False reporting of website status",
              status: "pending",
              date: "2023-05-15",
            },
            {
              id: 2,
              validator: "webchecker42",
              website: "https://test.org",
              reason: "Manipulating ping data",
              status: "resolved",
              date: "2023-05-10",
            },
            {
              id: 3,
              validator: "pingmaster",
              website: "https://demo.net",
              reason: "Multiple false reports",
              status: "rejected",
              date: "2023-05-05",
            },
          ])
        }

        // Fetch validators for dropdown
        const validatorsResponse = await validatorAPI.getAllValidators()
        if (validatorsResponse.data && Array.isArray(validatorsResponse.data)) {
          setValidators(validatorsResponse.data)
        }

        // Fetch websites for dropdown
        const websitesResponse = await websiteAPI.getAllWebsites()
        if (websitesResponse.data && Array.isArray(websitesResponse.data)) {
          setWebsites(websitesResponse.data)
        }
      } catch (error) {
        console.error("Error fetching reports data:", error)
        toast({
          title: "Error",
          description: "Failed to load reports data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [backendUser, toast])

  const createReport = async () => {
    try {
      // Validate inputs
      if (!newReport.reason) {
        toast({
          title: "Missing Information",
          description: "Please provide a reason for the report.",
          variant: "destructive",
        })
        return
      }

      // Create report in backend
      const response = await reportAPI.createReport(newReport)

      if (response.data && response.data.report) {
        // Add new report to state
        setReports([response.data.report, ...reports])

        // Reset form
        setNewReport({
          validator_id: "",
          website_id: "",
          reason: "",
        })
        setIsCreatingReport(false)

        toast({
          title: "Report Submitted",
          description: "Your report has been submitted and will be reviewed by our team.",
        })
      }
    } catch (error) {
      console.error("Error creating report:", error)
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "resolved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-lg font-medium">Loading reports...</p>
        </div>
      </div>
    )
  }

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

  // Wrap the main content in motion.div
  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Reports</h2>
        <Dialog open={isCreatingReport} onOpenChange={setIsCreatingReport}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report a Validator or Website</DialogTitle>
            </DialogHeader>
            {validators.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="validator-select">Validator (Optional)</Label>
                <Select
                  value={newReport.validator_id}
                  onValueChange={(value) => setNewReport((prev) => ({ ...prev, validator_id: value }))}
                >
                  <SelectTrigger id="validator-select">
                    <SelectValue placeholder="Select a validator" />
                  </SelectTrigger>
                  <SelectContent>
                    {validators.map((validator) => (
                      <SelectItem key={validator.id} value={validator.id}>
                        {validator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {websites.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="website-select">Website (Optional)</Label>
                <Select
                  value={newReport.website_id}
                  onValueChange={(value) => setNewReport((prev) => ({ ...prev, website_id: value }))}
                >
                  <SelectTrigger id="website-select">
                    <SelectValue placeholder="Select a website" />
                  </SelectTrigger>
                  <SelectContent>
                    {websites.map((website) => (
                      <SelectItem key={website.id} value={website.id}>
                        {website.url}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Report</Label>
              <Textarea
                id="reason"
                value={newReport.reason}
                onChange={(e) => setNewReport({ ...newReport, reason: e.target.value })}
                placeholder="Describe the issue in detail..."
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button onClick={createReport}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div className="grid gap-4" variants={containerVariants}>
        {reports.map((report) => (
          <motion.div key={report.id} variants={itemVariants}>
            <AnimatedCard>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="gradient-text">{report.website || "N/A"}</span>
                  {getStatusIcon(report.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Validator</p>
                    <p className="font-medium">{report.validator || "N/A"}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">
                      {report.created_at ? new Date(report.created_at).toLocaleDateString() : report.date}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Reason</p>
                  <p>{report.reason}</p>
                </div>

                {report.response && (
                  <div className="bg-primary/10 p-3 rounded-md">
                    <p className="text-sm font-medium text-primary mb-1">Response</p>
                    <p>{report.response}</p>
                  </div>
                )}
              </CardContent>
              <div className="p-4 flex items-center justify-between">
                {getStatusBadge(report.status)}
                <Button variant="ghost" size="sm" className="animate-in-button group">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </AnimatedCard>
          </motion.div>
        ))}

        {reports.length === 0 && (
          <motion.div variants={itemVariants}>
            <AnimatedCard>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-4">No reports found.</p>
                <Button onClick={() => setIsCreatingReport(true)} className="animate-in-button">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Report
                </Button>
              </CardContent>
            </AnimatedCard>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

