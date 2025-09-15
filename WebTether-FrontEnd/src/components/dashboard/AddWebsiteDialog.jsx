"use client"

import { useState } from "react"
import { useTheme } from "../../contexts/ThemeContext"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../hooks/use-toast"
import { LoadingSpinner } from "./LoadingSpinner"
import { WebsiteAddedAnimation } from "../animations/WebsiteAddedAnimation"
import { Globe, AlertCircle, CheckCircle, X } from "lucide-react"
import { api } from "../../services/api"

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
  const { theme } = useTheme()
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
  
  const isDark = theme === "dark"

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

      // Use the correct API method
      const response = await api.createWebsite(websiteData)

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
      onOpenChange(false)

      // Call the callback to update parent state
      if (onWebsiteAdded) {
        onWebsiteAdded(response)
      }

      // Show animation after a delay to ensure dialog is closed
      setTimeout(() => {
        setShowAnimation(true)
      }, 500)
    } catch (error) {
      console.error("Error adding website:", error)
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
    setShowAnimation(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent 
          className="sm:max-w-md p-0 overflow-hidden rounded-2xl border backdrop-blur-sm"
          style={{ 
            background: isDark 
              ? 'linear-gradient(to bottom right, rgba(30, 41, 59, 0.8), rgba(30, 64, 175, 0.3))' 
              : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.8), rgba(219, 234, 254, 0.5))',
            borderColor: isDark ? 'rgba(30, 64, 175, 0.3)' : 'rgba(191, 219, 254, 0.5)'
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: isDark ? 'rgba(30, 64, 175, 0.3)' : 'rgba(191, 219, 254, 0.5)' }}>
            <DialogHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Add Website
                  </DialogTitle>
                  <DialogDescription className={isDark ? "text-slate-300" : "text-slate-600"}>
                    Monitor uptime and earn from validator pings
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isSubmitting}
                className={`h-8 w-8 rounded-lg ${isDark ? "hover:bg-slate-700/50 text-slate-300" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* URL Field */}
            <div className="space-y-2">
              <Label htmlFor="url" className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Website URL *
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                disabled={isSubmitting}
                className={`
                  rounded-xl border backdrop-blur-sm
                  ${isDark 
                    ? "bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500" 
                    : "bg-white/60 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400"
                  }
                  ${errors.url ? "border-red-500 focus:border-red-500" : ""}
                `}
              />
              {errors.url && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.url}
                </div>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Website Name
                <span className="text-xs ml-1 text-slate-400">(optional)</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="My Website"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isSubmitting}
                className={`
                  rounded-xl border backdrop-blur-sm
                  ${isDark 
                    ? "bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500" 
                    : "bg-white/60 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400"
                  }
                `}
              />
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                If not provided, we'll generate a name from the URL
              </p>
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <Label htmlFor="category" className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={`
                  rounded-xl border backdrop-blur-sm
                  ${isDark 
                    ? "bg-slate-800/40 border-slate-700 text-white focus:border-blue-500" 
                    : "bg-white/60 border-slate-200 text-slate-900 focus:border-blue-400"
                  }
                  ${errors.category ? "border-red-500 focus:border-red-500" : ""}
                `}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className={`
                  rounded-xl border backdrop-blur-sm
                  ${isDark 
                    ? "bg-slate-800 border-slate-700 text-white" 
                    : "bg-white border-slate-200 text-slate-900"
                  }
                `}>
                  {CATEGORIES.map((category) => (
                    <SelectItem 
                      key={category.value} 
                      value={category.value}
                      className={`
                        ${isDark 
                          ? "focus:bg-slate-700/50" 
                          : "focus:bg-slate-100/50"
                        }
                      `}
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.category}
                </div>
              )}
            </div>

            {/* Reward Field */}
            <div className="space-y-2">
              <Label htmlFor="reward" className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
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
                className={`
                  rounded-xl border backdrop-blur-sm
                  ${isDark 
                    ? "bg-slate-800/40 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500" 
                    : "bg-white/60 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400"
                  }
                  ${errors.reward_per_ping ? "border-red-500" : ""}
                `}
              />
              {errors.reward_per_ping && (
                <div className="flex items-center gap-1 text-sm text-red-500">
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
                className={`
                  flex-1 rounded-xl border backdrop-blur-sm
                  ${isDark 
                    ? "bg-slate-800/40 border-slate-700 text-slate-200 hover:bg-slate-700/50" 
                    : "bg-white/60 border-slate-200 text-slate-700 hover:bg-slate-100/50"
                  }
                `}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.url || !formData.category}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600"
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