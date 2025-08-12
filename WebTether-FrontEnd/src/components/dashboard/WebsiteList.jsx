"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { Alert, AlertDescription } from "../ui/alert"
import { AddWebsiteDialog } from "./AddWebsiteDialog"
import { useToast } from "../../hooks/use-toast"
import { websiteAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import {
  Globe,
  TrendingUp,
  Clock,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

export default function WebsiteList({ websites = [], setWebsites, onWebsiteAdded, onWebsiteDeleted, compact = false }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingIds, setDeletingIds] = useState(new Set())
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWebsites()
    }
  }, [user])

  const fetchWebsites = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const allWebsites = await websiteAPI.getAllWebsites()
      const userWebsites = allWebsites.filter((website) => website.uid === user.id)

      setWebsites(userWebsites)
    } catch (err) {
      console.error("Error fetching websites:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load websites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWebsite = async (wid) => {
    try {
      setDeletingIds((prev) => new Set([...prev, wid]))

      await websiteAPI.deleteWebsite(wid)

      setWebsites((prev) => prev.filter((website) => website.wid !== wid))

      toast({
        title: "Website Deleted",
        description: "Website has been successfully removed.",
      })

      if (onWebsiteDeleted) {
        onWebsiteDeleted()
      }
    } catch (err) {
      console.error("Error deleting website:", err)
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(wid)
        return newSet
      })
    }
  }

  const handleWebsiteAdded = (newWebsite) => {
    setWebsites((prev) => [...prev, newWebsite])
    if (onWebsiteAdded) {
      onWebsiteAdded()
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "up":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "down":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "up":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Online</Badge>
      case "down":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Offline</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Unknown</Badge>
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              My Websites
            </CardTitle>
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            My Websites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
              <Button onClick={fetchWebsites} variant="outline" size="sm" className="ml-2 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              My Websites
              <Badge variant="secondary">{websites.length}</Badge>
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Website
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {websites.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No Websites Added</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first website to start monitoring its uptime and earning from validator pings.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Website
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {websites.slice(0, compact ? 3 : websites.length).map((website, index) => (
                <motion.div
                  key={website.wid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(website.status)}
                        <h3 className="font-medium truncate">
                          {website.name || website.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </h3>
                        {getStatusBadge(website.status)}
                      </div>

                      <p className="text-sm text-muted-foreground truncate mb-2">{website.url}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{website.uptime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Last check: {formatTimeAgo(website.lastCheck)}</span>
                        </div>
                        {website.responseTime && (
                          <div className="flex items-center gap-1">
                            <span>{website.responseTime}ms</span>
                          </div>
                        )}
                        {website.category && (
                          <Badge variant="outline" className="text-xs">
                            {website.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={website.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Website
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteWebsite(website.wid)}
                          disabled={deletingIds.has(website.wid)}
                          className="text-red-600 focus:text-red-600"
                        >
                          {deletingIds.has(website.wid) ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Website
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}

              {compact && websites.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View All {websites.length} Websites
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddWebsiteDialog open={showAddDialog} onOpenChange={setShowAddDialog} onWebsiteAdded={handleWebsiteAdded} />
    </>
  )
}
