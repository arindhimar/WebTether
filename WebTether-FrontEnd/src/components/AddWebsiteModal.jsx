"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"
import { websiteAPI } from "../services/api"
import { useToast } from "../hooks/use-toast"

export default function AddWebsiteModal({ isOpen, onClose, onWebsiteAdded }) {
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await websiteAPI.createWebsite({
        url,
        description,
        monitoring_frequency: "5 minutes",
        alerts_enabled: true,
      })

      toast({
        title: "Website added",
        description: "Your website has been added successfully.",
        type: "success",
      })

      setUrl("")
      setDescription("")
      onWebsiteAdded(response.data.website)
      onClose()
    } catch (error) {
      console.error("Error adding website:", error)
      toast({
        title: "Error",
        description: "There was an error adding your website. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg p-6 border border-border w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add Website</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-1">
              Website URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              placeholder="Describe this website"
              rows={3}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Website"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

