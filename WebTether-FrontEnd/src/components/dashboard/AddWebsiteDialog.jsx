"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { useToast } from "../../hooks/use-toast"
import { useAuth } from "../../contexts/AuthContext"
import { websiteAPI } from "../../services/api"
import { Loader2, Globe } from "lucide-react"

export function AddWebsiteDialog({ open, onOpenChange, onWebsiteAdded }) {
  const [formData, setFormData] = useState({
    url: "",
    category: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateUrl(formData.url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await websiteAPI.createWebsite(formData.url, user.id, formData.category || null)

      toast({
        title: "Website Added!",
        description: `${formData.url} is now being monitored.`,
      })

      setFormData({ url: "", category: "" })
      onOpenChange(false)

      // Trigger refresh of dashboard data
      if (onWebsiteAdded) {
        onWebsiteAdded()
      }
    } catch (error) {
      console.error("Error adding website:", error)
      toast({
        title: "Failed to Add Website",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Add New Website
          </DialogTitle>
          <DialogDescription>Add a website to monitor its uptime with our validator network.</DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <Label htmlFor="url">Website URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              placeholder="e.g., E-commerce, Blog, API"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Website...
              </>
            ) : (
              "Add Website"
            )}
          </Button>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
