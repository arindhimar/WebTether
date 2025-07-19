"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { AddWebsiteDialog } from "./AddWebsiteDialog"
import { Globe, Plus, MoreVertical, Trash2, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { websiteAPI } from "../../services/api"
import { useToast } from "../../hooks/use-toast"

export function WebsiteList({ websites, setWebsites, onWebsiteAdded, onWebsiteDeleted }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(null)
  const { toast } = useToast()

  const getStatusColor = (status) => {
    switch (status) {
      case "up":
        return "bg-green-500"
      case "down":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleDeleteWebsite = async (website) => {
    setIsDeleting(website.wid)

    try {
      await websiteAPI.deleteWebsite(website.wid)

      toast({
        title: "Website Deleted",
        description: `${website.name} has been removed from monitoring.`,
      })

      // Update local state
      setWebsites((prev) => prev.filter((site) => site.wid !== website.wid))

      // Trigger refresh if callback provided
      if (onWebsiteDeleted) {
        onWebsiteDeleted()
      }
    } catch (error) {
      console.error("Error deleting website:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const formatLastCheck = (dateString) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Websites</CardTitle>
            <CardDescription>Monitor and manage your website uptime</CardDescription>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        </CardHeader>
        <CardContent>
          {websites.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No websites added yet</h3>
              <p className="text-muted-foreground mb-4">
                Start monitoring your websites by adding them to your dashboard.
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Website
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {websites.map((website, index) => (
                <motion.div
                  key={website.wid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(website.status)}`} />
                    <div>
                      <h4 className="font-semibold">{website.name}</h4>
                      <p className="text-sm text-muted-foreground">{website.url}</p>
                      <p className="text-xs text-muted-foreground">
                        Last checked: {formatLastCheck(website.lastCheck)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge variant={website.status === "up" ? "default" : "destructive"}>
                        {website.status.toUpperCase()}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{website.uptime}% uptime</p>
                      {website.responseTime && (
                        <p className="text-xs text-muted-foreground">{website.responseTime}ms</p>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isDeleting === website.wid}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteWebsite(website)}
                          className="text-red-600"
                          disabled={isDeleting === website.wid}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting === website.wid ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddWebsiteDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onWebsiteAdded={onWebsiteAdded} />
    </>
  )
}
