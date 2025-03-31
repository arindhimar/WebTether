"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Loader2,
} from "lucide-react"
import { websiteAPI } from "../services/api"
import { useToast } from "../hooks/use-toast"

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

export default function WebsiteDetails() {
  const { id } = useParams()
  const [website, setWebsite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  // Fetch website details
  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await websiteAPI.getWebsiteById(id)
        setWebsite(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching website:", err)
        setError("Failed to load website details")
        setLoading(false)
        toast({
          title: "Error",
          description: "Failed to load website details. Please try again later.",
          type: "error",
        })
      }
    }

    fetchWebsite()
  }, [id, toast])

  // Handle check now button
  const handleCheckNow = async () => {
    toast({
      title: "Checking website",
      description: "Initiating a check for this website...",
    })

    try {
      // In a real app, you would call an API endpoint to trigger a check
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        toast({
          title: "Check complete",
          description: "Website check completed successfully.",
          type: "success",
        })
      }, 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to check website. Please try again.",
        type: "error",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading website details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Failed to load website details</p>
            <p className="text-muted-foreground mb-4">There was an error loading the website information.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  // Add a null check for website data
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{website?.url || "Loading..."}</h1>
              {website && <StatusBadge status={website.status} />}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              <Button onClick={handleCheckNow}>Check Now</Button>
            </div>
          </div>

          <p className="text-muted-foreground mt-2">{website?.description || ""}</p>
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
                  <div className="text-2xl font-bold">{website.monitoring_frequency}</div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

