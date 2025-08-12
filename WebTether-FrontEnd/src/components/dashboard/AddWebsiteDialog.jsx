"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
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

export function AddWebsiteDialog({ onWebsiteAdded, trigger }) {
  const [open, setOpen] = useState(false)
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

      setOpen(false)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Website
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-foreground">
            <Globe className="w-5 h-5 text-purple-600" />
            Add New Website
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a website to start monitoring its uptime and earn rewards
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-card-foreground">
              Website URL
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="bg-background border-input text-foreground"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-card-foreground">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue placeholder="Select category">
                  {selectedCategory && (
                    <div className="flex items-center gap-2">
                      <span>{selectedCategory.icon}</span>
                      <span>{selectedCategory.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {WEBSITE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-popover-foreground">
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
              <Label className="text-card-foreground">Transaction Code</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateNewCode}
                className="text-xs bg-transparent"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Generate New
              </Button>
            </div>
            <Select value={formData.txHash} onValueChange={(value) => setFormData({ ...formData, txHash: value })}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue placeholder="Select transaction code" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {availableTxCodes.map((code) => (
                  <SelectItem key={code} value={code} className="text-popover-foreground">
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
            <Label className="text-card-foreground">Registration Fee</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="font-mono text-sm text-muted-foreground">{formData.feePaid} ETH</span>
              <Badge variant="secondary" className="ml-auto">
                One-time
              </Badge>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
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
