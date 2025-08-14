"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { websiteAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../hooks/use-toast"
import { LoadingSpinner } from "./LoadingSpinner"
import { WebsiteAddedAnimation } from "../animations/WebsiteAddedAnimation"
import { Globe, AlertCircle, CheckCircle } from "lucide-react"

const CATEGORIES = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "blog", label: "Blog" },
  { value: "portfolio", label: "Portfolio" },
  { value: "business", label: "Business" },
  { value: "news", label: "News" },
  { value: "social", label: "Social Media" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
]

export function AddWebsiteDialog({ open, onOpenChange, onWebsiteAdded }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [formData, setFormData] = useState({
    url: "",
    name: "",
    category: "",
    reward_per_ping: 0.0001,
  })
  const [errors, setErrors] = useState({})

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch {
      return false
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.url.trim()) {
      newErrors.url = "Website URL is required"
    } else if (!validateUrl(formData.url)) {
      newErrors.url = "Please enter a valid URL (including http:// or https://)"
    }

    if (!formData.category) {
      newErrors.category = "Please select a category"
    }

    if (formData.reward_per_ping < 0) {
      newErrors.reward_per_ping = "Reward must be 0 or greater"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateNameFromUrl = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace(/^www\./, "")
    } catch {
      return ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    console.log("🚀 Starting website addition process...")

    try {
      setIsSubmitting(true)

      // Generate name from URL if not provided
      const websiteName = formData.name.trim() || generateNameFromUrl(formData.url)

      const websiteData = {
        url: formData.url.trim(),
        name: websiteName,
        category: formData.category,
        uid: user.id,
        reward_per_ping: Number.parseFloat(formData.reward_per_ping),
      }

      console.log("📤 Sending website data:", websiteData)

      const response = await websiteAPI.addWebsite(websiteData)
      console.log("✅ Website added successfully:", response)

      // Reset form
      setFormData({
        url: "",
        name: "",
        category: "",
        reward_per_ping: 0.0001,
      })
      setErrors({})

      toast({
        title: "Website Added!",
        description: `${websiteName} has been added successfully.`,
      })

      // Close dialog first
      console.log("🔄 Closing dialog...")
      onOpenChange(false)

      // Call the callback to update parent state
      if (onWebsiteAdded) {
        onWebsiteAdded(response)
      }

      // Show animation after a delay to ensure dialog is closed
      console.log("🎬 Starting animation in 500ms...")
      setTimeout(() => {
        console.log("🎬 Triggering animation now!")
        setShowAnimation(true)
      }, 500)
    } catch (error) {
      console.error("❌ Error adding website:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        url: "",
        name: "",
        category: "",
        reward_per_ping: 0.0001,
      })
      setErrors({})
      onOpenChange(false)
    }
  }

  const handleAnimationComplete = () => {
    console.log("🎬 Animation completed, cleaning up...")
    setShowAnimation(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md modern-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Globe className="h-4 w-4 text-white" />
              </div>
              Add Website
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new website to monitor its uptime and earn from validator pings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL Field */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium text-foreground">
                Website URL *
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                disabled={isSubmitting}
                className={`modern-input ${errors.url ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {errors.url && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.url}
                </div>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Website Name
                <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="My Website"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isSubmitting}
                className="modern-input"
              />
              <p className="text-xs text-muted-foreground">If not provided, we'll generate a name from the URL</p>
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-foreground">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={`modern-input ${errors.category ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="modern-card">
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.category}
                </div>
              )}
            </div>

            {/* Reward Field */}
            <div className="space-y-2">
              <Label htmlFor="reward" className="text-sm font-medium text-foreground">
                Reward per Ping (ETH)
              </Label>
              <Input
                id="reward"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0001"
                value={formData.reward_per_ping}
                onChange={(e) => handleInputChange("reward_per_ping", e.target.value)}
                disabled={isSubmitting}
                className={`modern-input ${errors.reward_per_ping ? "border-red-500" : ""}`}
              />
              {errors.reward_per_ping && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.reward_per_ping}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 btn-secondary bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.url || !formData.category}
                className="flex-1 btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add Website
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Website Added Animation */}
      {showAnimation && <WebsiteAddedAnimation websiteUrl={formData.url} onComplete={handleAnimationComplete} />}
    </>
  )
}
