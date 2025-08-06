"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { AddWebsiteDialog } from "./AddWebsiteDialog"
import { Globe, Plus, MoreVertical, Trash2, Settings, ExternalLink, Activity, Clock, Zap } from 'lucide-react'
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "up":
        return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>
      case "down":
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
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

  const handleVisitWebsite = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Your Websites
            </CardTitle>
            <CardDescription>Monitor and manage your website uptime with our validator network</CardDescription>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Website
          </Button>
        </CardHeader>
        <CardContent>
          {websites.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No websites added yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start monitoring your websites by adding them to your dashboard. Our global validator network will check their uptime 24/7.
              </p>
              <Button onClick={() => setAddDialogOpen(true)} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Website
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {websites.map((website, index) => (
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
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(website.status)} mt-1 shadow-lg`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg truncate">{website.name}</h4>
                            {getStatusBadge(website.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 truncate">{website.url}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-green-500" />
                              <div>
                                <p className="font-medium">{website.uptime}%</p>
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

                            {website.category && (
                              <div>
                                <Badge variant="outline" className="text-xs">
                                  {website.category}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVisitWebsite(website.url)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={isDeleting === website.wid}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleVisitWebsite(website.url)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit Website
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteWebsite(website)}
                              className="text-red-600 focus:text-red-600"
                              disabled={isDeleting === website.wid}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isDeleting === website.wid ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status indicator bar */}
                  <div className={`h-1 w-full ${getStatusColor(website.status)}`} />
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
