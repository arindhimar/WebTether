/**
 * Website List Component
 * 
 * This component displays and manages the list of websites owned by the current user.
 * It provides functionality to view, edit, and delete websites, along with their
 * monitoring status and statistics.
 * 
 * Features:
 * - Real-time website status display
 * - Uptime statistics and metrics
 * - Website management (add, edit, delete)
 * - Responsive grid layout
 * - Confirmation dialogs for destructive actions
 * - Error handling and user feedback
 * 
 * @author Web-Tether Team
 * @version 1.0.0
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { AddWebsiteDialog } from "./AddWebsiteDialog"
import { Globe, Plus, MoreVertical, Trash2, Settings, ExternalLink, Activity, Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { websiteAPI } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"

/**
 * WebsiteList Component
 * Displays and manages user's websites with monitoring capabilities
 */
export function WebsiteList({ websites, setWebsites, onWebsiteAdded, onWebsiteDeleted }) {
  // ==================== STATE MANAGEMENT ====================

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [websiteToDelete, setWebsiteToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(null)

  // ==================== HOOKS ====================

  const { toast } = useToast()

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get CSS class for website status indicator
   * @param {string} status - Website status (up, down, unknown)
   * @returns {string} CSS class for status color
   */
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "up":
      case "online":
        return "bg-green-500"
      case "down":
      case "offline":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  /**
   * Get status badge component for website
   * @param {string} status - Website status
   * @returns {JSX.Element} Status badge component
   */
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "up":
      case "online":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Online
          </Badge>
        )
      case "down":
      case "offline":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  /**
   * Format last check timestamp to human-readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Human-readable time difference
   */
  const formatLastCheck = (dateString) => {
    if (!dateString) return "Never"

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
      return `${Math.floor(diffMins / 1440)}d ago`
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Unknown"
    }
  }

  /**
   * Format website name from URL
   * @param {string} url - Website URL
   * @returns {string} Formatted website name
   */
  const formatWebsiteName = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle delete button click - show confirmation dialog
   * @param {Object} website - Website object to delete
   */
  const handleDeleteClick = (website) => {
    setWebsiteToDelete(website)
    setDeleteDialogOpen(true)
  }

  /**
   * Handle delete confirmation - actually delete the website
   */
  const handleDeleteConfirm = async () => {
    if (!websiteToDelete) {
      console.error("No website selected for deletion")
      return
    }

    setIsDeleting(websiteToDelete.wid)

    try {
      // Call API to delete website
      await websiteAPI.deleteWebsite(websiteToDelete.wid)

      // Show success message
      toast({
        title: "Website Deleted",
        description: `${formatWebsiteName(websiteToDelete.url)} has been removed from monitoring. No more charges will apply.`,
      })

      // Update local state to remove deleted website
      setWebsites((prev) => prev.filter((site) => site.wid !== websiteToDelete.wid))

      // Trigger refresh callback if provided
      if (onWebsiteDeleted) {
        onWebsiteDeleted()
      }

    } catch (error) {
      console.error("Error deleting website:", error)

      // Show error message to user
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete website. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Clean up state
      setIsDeleting(null)
      setDeleteDialogOpen(false)
      setWebsiteToDelete(null)
    }
  }

  /**
   * Handle visit website - open in new tab
   * @param {string} url - Website URL to visit
   */
  const handleVisitWebsite = (url) => {
    try {
      // Ensure URL has protocol
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`
      window.open(formattedUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error("Error opening website:", error)
      toast({
        title: "Cannot Open Website",
        description: "Invalid URL format. Please check the website URL.",
        variant: "destructive",
      })
    }
  }

  /**
   * Handle website added - refresh list and show success
   */
  const handleWebsiteAdded = () => {
    if (onWebsiteAdded) {
      onWebsiteAdded()
    }
  }

  // ==================== RENDER HELPERS ====================

  /**
   * Render empty state when no websites are added
   * @returns {JSX.Element} Empty state component
   */
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Globe className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No websites added yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Add your first website to start monitoring. Our global validator network will check its uptime 24/7
        and provide detailed reports.
      </p>
      <Button
        onClick={() => setAddDialogOpen(true)}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Website
      </Button>
    </div>
  )

  /**
   * Render individual website card
   * @param {Object} website - Website data
   * @param {number} index - Card index for animation delay
   * @returns {JSX.Element} Website card component
   */
  const renderWebsiteCard = (website, index) => (
    <motion.div
      key={website.wid}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Status Indicator */}
            <div className={`w-4 h-4 rounded-full ${getStatusColor(website.status)} mt-1 shadow-lg`} />

            <div className="flex-1 min-w-0">
              {/* Website Header */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h4 className="font-semibold text-lg truncate">
                  {formatWebsiteName(website.url)}
                </h4>
                {getStatusBadge(website.status)}
                <Badge variant="outline" className="text-xs">
                  Monitoring
                </Badge>
              </div>

              {/* Website URL */}
              <p className="text-sm text-muted-foreground mb-3 truncate" title={website.url}>
                {website.url}
              </p>

              {/* Website Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">{website.uptime || '99.9'}%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                </div>

                {website.responseTime && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">{website.responseTime}ms</p>
                      <p className="text-xs text-muted-foreground">Response</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="font-medium">{formatLastCheck(website.lastCheck)}</p>
                    <p className="text-xs text-muted-foreground">Last Check</p>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              {website.category && (
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">
                    {website.category}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVisitWebsite(website.url)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Visit website"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isDeleting === website.wid}
                  title="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleVisitWebsite(website.url)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings (Coming Soon)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(website)}
                  className="text-red-600 focus:text-red-600"
                  disabled={isDeleting === website.wid}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting === website.wid ? "Deleting..." : "Stop Monitoring"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Status indicator bar */}
      <div className={`h-1 w-full ${getStatusColor(website.status)}`} />
    </motion.div >
  )

  // ==================== MAIN RENDER ====================

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Your Websites
            </CardTitle>
            <CardDescription>
              Websites you're monitoring. Our validator network checks them 24/7 and you can manage them here.
            </CardDescription>
          </div>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        </CardHeader>
        <CardContent>
          {websites.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">How Website Monitoring Works</p>
                    <p className="text-blue-700">
                      Your websites are monitored by our global validator network.
                      Validators earn rewards for checking your sites and you get detailed uptime reports.
                    </p>
                  </div>
                </div>
              </div>

              {/* Website Grid */}
              <div className="grid gap-4 md:grid-cols-1">
                {websites.map((website, index) => renderWebsiteCard(website, index))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Website Dialog */}
      <AddWebsiteDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onWebsiteAdded={handleWebsiteAdded}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Stop Monitoring Website?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop monitoring{" "}
              <strong>{websiteToDelete ? formatWebsiteName(websiteToDelete.url) : ''}</strong>?
              <br /><br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove the website from validator monitoring</li>
                <li>Stop all future ping checks</li>
                <li>Delete all historical uptime data</li>
                <li>This action cannot be undone</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Stop Monitoring"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
