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
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

export default function WebsiteList({ websites = [], setWebsites, onWebsiteAdded, onWebsiteDeleted, compact = false }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingIds, setDeletingIds] = useState(new Set())
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Ensure websites is always an array
  const websitesArray = Array.isArray(websites) ? websites : []

  useEffect(() => {
    if (user) {
      fetchWebsites()
    }
  }, [user])

  // Listen for custom event to open add dialog (from FAB)
  useEffect(() => {
    const handleOpenDialog = () => setShowAddDialog(true)
    window.addEventListener("openAddWebsiteDialog", handleOpenDialog)
    return () => window.removeEventListener("openAddWebsiteDialog", handleOpenDialog)
  }, [])

  const fetchWebsites = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const userWebsites = await websiteAPI.getUserWebsites(user.id)
      setWebsites(userWebsites || [])
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
      case "active":
        return <CheckCircle className="h-3 w-3 text-emerald-500" />
      case "inactive":
      case "down":
        return <XCircle className="h-3 w-3 text-red-500" />
      default:
        return <AlertCircle className="h-3 w-3 text-amber-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500"
      case "inactive":
      case "down":
        return "bg-red-500"
      default:
        return "bg-amber-500"
    }
  }

  const getWebsiteDisplayName = (website) => {
    // If website has a name, use it; otherwise use the URL
    if (website.name && website.name.trim()) {
      return website.name
    }

    // Clean up URL for display
    return website.url.replace(/^https?:\/\//, "").replace(/\/$/, "")
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown"

    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    return `${Math.floor(diffInSeconds / 86400)}d`
  }

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
          <Card key={i} className="bg-white/60 dark:bg-slate-800/40 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-32 bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-24 bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <Skeleton className="h-4 sm:h-5 w-8 sm:w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
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
          <Button
            onClick={fetchWebsites}
            variant="outline"
            size="sm"
            className="ml-2 bg-transparent h-7 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Only show when there are websites */}
      {websitesArray.length > 0 && (
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Websites</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">{websitesArray.length} sites</p>
            </div>
          </div>

          <Button
            onClick={() => setShowAddDialog(true)}
            disabled={showAddDialog}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm flex-shrink-0"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
            <span className="hidden sm:inline">Add Site</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      )}

      {/* Website List */}
      <AnimatePresence mode="wait">
        {websitesArray.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center mb-3 sm:mb-4">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 text-slate-900 dark:text-white">No sites added yet</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 max-w-sm mx-auto px-4">
              Start monitoring your first website to track uptime and earn from validator pings.
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              disabled={showAddDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 sm:px-6 h-9 sm:h-10 text-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Your First Site
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3 sm:space-y-4"
          >
            {websitesArray.slice(0, compact ? 3 : websitesArray.length).map((website, index) => (
              <motion.div
                key={website.wid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-white/60 dark:bg-slate-800/40 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl shadow-lg group hover:shadow-xl transition-all duration-200">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Status Indicator */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(website.status)}`} />
                          <div
                            className={`absolute inset-0 w-2 h-2 rounded-full ${getStatusColor(website.status)} animate-ping opacity-75`}
                          />
                        </div>

                        {/* Website Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                              {getWebsiteDisplayName(website)}
                            </h3>
                            <Badge
                              className={`text-xs px-1.5 py-0.5 ${
                                website.status === "active"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                  : website.status === "inactive" || website.status === "down"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                              }`}
                            >
                              {website.status === "active"
                                ? "Active"
                                : website.status === "inactive"
                                  ? "Inactive"
                                  : website.status === "down"
                                    ? "Down"
                                    : "Unknown"}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate font-mono mb-1.5">{website.url}</p>

                          {/* Stats - Mobile responsive */}
                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-0.5">
                              <Globe className="h-2.5 w-2.5 text-blue-500" />
                              <span>{website.category}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5 text-blue-500" />
                              <span>{formatTimeAgo(website.created_at)}</span>
                            </div>
                            {website.reward_per_ping && (
                              <div className="flex items-center gap-0.5 hidden sm:flex">
                                <Zap className="h-2.5 w-2.5 text-amber-500" />
                                <span>{Number.parseFloat(website.reward_per_ping).toFixed(4)} ETH</span>
                              </div>
                            )}
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
                            className="opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity h-6 w-6 rounded disabled:opacity-30 flex-shrink-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                          <DropdownMenuItem asChild>
                            <a
                              href={website.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-xs text-slate-700 dark:text-slate-300"
                            >
                              <ExternalLink className="h-3 w-3 mr-1.5" />
                              Visit Site
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteWebsite(website.wid)}
                            disabled={deletingIds.has(website.wid) || showAddDialog}
                            className="text-red-600 focus:text-red-600 text-xs"
                          >
                            {deletingIds.has(website.wid) ? (
                              <>
                                <LoadingSpinner size="sm" className="mr-1.5" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3 mr-1.5" />
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

            {compact && websitesArray.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  className="rounded-lg bg-transparent w-full sm:w-auto text-xs h-8 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  View All {websitesArray.length} Sites
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