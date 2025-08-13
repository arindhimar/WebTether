"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Plus, Globe, Coins, RefreshCw, Copy, Check } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { api } from "../../services/api"

const WEBSITE_CATEGORIES = [
  { value: "ecommerce", label: "E-commerce", icon: "🛒" },
  { value: "blog", label: "Blog/News", icon: "📰" },
  { value: "portfolio", label: "Portfolio", icon: "💼" },
  { value: "business", label: "Business", icon: "🏢" },
  { value: "social", label: "Social Media", icon: "📱" },
  { value: "education", label: "Education", icon: "🎓" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "other", label: "Other", icon: "🌐" },
]

const generateTransactionCode = () => {
  const prefix = "TX"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function AddWebsiteDialog({ open, onOpenChange, onWebsiteAdded }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    url: "",
    category: "",
    txHash: "",
    feePaid: "0.001",
  })
  const [availableTxCodes, setAvailableTxCodes] = useState([])
  const [copiedCode, setCopiedCode] = useState("")
  const { toast } = useToast()

  // Load saved transaction codes from localStorage
  useEffect(() => {
    const savedCodes = JSON.parse(localStorage.getItem("transactionCodes") || "[]")
    if (savedCodes.length === 0) {
      // Generate initial codes if none exist
      const initialCodes = Array.from({ length: 3 }, () => generateTransactionCode())
      setAvailableTxCodes(initialCodes)
      localStorage.setItem("transactionCodes", JSON.stringify(initialCodes))
    } else {
      setAvailableTxCodes(savedCodes)
    }
  }, [])

  const handleGenerateNewCode = () => {
    const newCode = generateTransactionCode()
    const updatedCodes = [...availableTxCodes, newCode]
    setAvailableTxCodes(updatedCodes)
    localStorage.setItem("transactionCodes", JSON.stringify(updatedCodes))
    setFormData({ ...formData, txHash: newCode })
    toast({
      title: "Success",
      description: "New transaction code generated!",
    })
  }

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast({
        title: "Copied",
        description: "Transaction code copied to clipboard!",
      })
      setTimeout(() => setCopiedCode(""), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      })
    }
  }

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive",
      })
      return
    }

    if (!validateUrl(formData.url)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    if (!formData.category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

    if (!formData.txHash) {
      toast({
        title: "Error",
        description: "Please select a transaction code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const websiteData = {
        url: formData.url.startsWith("http") ? formData.url : `https://${formData.url}`,
        category: formData.category,
        tx_hash: formData.txHash,
        fee_paid_numeric: Number.parseFloat(formData.feePaid),
      }

      const response = await api.createWebsite(websiteData)

      toast({
        title: "Success! 🎉",
        description: "Website added successfully!",
      })

      if (onWebsiteAdded) {
        onWebsiteAdded(response)
      }

      // Reset form
      setFormData({
        url: "",
        category: "",
        txHash: "",
        feePaid: "0.001",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error adding website:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add website",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = WEBSITE_CATEGORIES.find((cat) => cat.value === formData.category)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md modern-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Globe className="h-5 w-5 text-white" />
            </div>
            Add Website
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a website to start monitoring its uptime and earn rewards
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium text-foreground">
              Website URL
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm">
                <SelectValue placeholder="Select category">
                  {selectedCategory && (
                    <div className="flex items-center gap-2">
                      <span>{selectedCategory.icon}</span>
                      <span>{selectedCategory.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="modern-card border-border/50">
                {WEBSITE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Code Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Transaction Code</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateNewCode}
                className="text-xs h-8 rounded-lg btn-secondary bg-transparent"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Generate
              </Button>
            </div>
            <Select value={formData.txHash} onValueChange={(value) => setFormData({ ...formData, txHash: value })}>
              <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm">
                <SelectValue placeholder="Select transaction code" />
              </SelectTrigger>
              <SelectContent className="modern-card border-border/50">
                {availableTxCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-sm">{code}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyCode(code)
                        }}
                        className="ml-2 h-6 w-6 p-0"
                      >
                        {copiedCode === code ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fee Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Registration Fee</Label>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/30">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="font-mono text-sm text-muted-foreground">{formData.feePaid} ETH</span>
              <Badge className="status-info ml-auto">One-time</Badge>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl btn-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-11 rounded-xl btn-primary">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Website
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
