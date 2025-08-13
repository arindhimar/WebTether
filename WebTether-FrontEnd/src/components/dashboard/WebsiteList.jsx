"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { Alert, AlertDescription } from "../ui/alert"
import { AddWebsiteDialog } from "./AddWebsiteDialog"
import { useToast } from "../../hooks/use-toast"
import { websiteAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { LoadingSpinner } from "./LoadingSpinner"
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
  Zap,
  Activity,
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
    if (showAddDialog) return // Disable when add dialog is open

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
    setShowAddDialog(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "up":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "down":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "up":
        return "bg-emerald-500"
      case "down":
        return "bg-red-500"
      default:
        return "bg-amber-500"
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
      <div className="space-y-4">
        {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
          <Card key={i} className="floating-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-10 w-10 rounded-full loading-shimmer" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48 loading-shimmer" />
                    <Skeleton className="h-4 w-32 loading-shimmer" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 loading-shimmer rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {error}
          <Button onClick={fetchWebsites} variant="outline" size="sm" className="ml-2 btn-secondary bg-transparent">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Single Add Button - Only show when there are websites */}
      {websites.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Websites</h2>
              <p className="text-sm text-muted-foreground">{websites.length} sites monitored</p>
            </div>
          </div>

          <Button
            onClick={() => setShowAddDialog(true)}
            disabled={showAddDialog}
            className="btn-primary rounded-xl px-6 h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </div>
      )}

      {/* Website List */}
      <AnimatePresence mode="wait">
        {websites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16"
          >
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/20 dark:to-purple-950/20 flex items-center justify-center mb-6">
              <Globe className="h-10 w-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No sites added yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start monitoring your first website to track uptime and earn from validator pings.
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              disabled={showAddDialog}
              className="btn-primary rounded-xl px-8 h-12"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Site
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {websites.slice(0, compact ? 3 : websites.length).map((website, index) => (
              <motion.div
                key={website.wid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="floating-card group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Status Indicator */}
                        <div className="relative">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(website.status)}`} />
                          <div
                            className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor(website.status)} animate-ping opacity-75`}
                          />
                        </div>

                        {/* Website Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {website.name || website.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            </h3>
                            <Badge
                              className={`text-xs px-2 py-0.5 ${
                                website.status === "up"
                                  ? "status-success"
                                  : website.status === "down"
                                    ? "status-error"
                                    : "status-warning"
                              }`}
                            >
                              {website.status === "up" ? "Online" : website.status === "down" ? "Offline" : "Unknown"}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground truncate font-mono">{website.url}</p>

                          {/* Stats */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                              <span>{website.uptime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-blue-500" />
                              <span>{formatTimeAgo(website.lastCheck)}</span>
                            </div>
                            {website.responseTime && (
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3 text-amber-500" />
                                <span>{website.responseTime}ms</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3 text-purple-500" />
                              <span>{website.pingCount || 0} pings</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={showAddDialog}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg disabled:opacity-30"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="modern-card border-border/50">
                          <DropdownMenuItem asChild>
                            <a
                              href={website.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Site
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteWebsite(website.wid)}
                            disabled={deletingIds.has(website.wid) || showAddDialog}
                            className="text-red-600 focus:text-red-600"
                          >
                            {deletingIds.has(website.wid) ? (
                              <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {compact && websites.length > 3 && (
              <div className="text-center pt-4">
                <Button variant="outline" className="btn-secondary rounded-xl bg-transparent">
                  View All {websites.length} Sites
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Website Dialog */}
      <AddWebsiteDialog open={showAddDialog} onOpenChange={setShowAddDialog} onWebsiteAdded={handleWebsiteAdded} />
    </div>
  )
}
