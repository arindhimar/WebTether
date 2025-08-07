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
import { Loader2, Globe, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * Add Website Dialog Component
 * 
 * This component provides a modal dialog for website owners to add new websites
 * for monitoring. It handles form validation, URL verification, and API communication.
 * 
 * Features:
 * - URL validation and formatting
 * - Category selection (optional)
 * - Real-time form validation
 * - Error handling with user-friendly messages
 * - Loading states and feedback
 * 
 * @author Web-Tether Team
 * @version 1.0.0
 */

export function AddWebsiteDialog({ open, onOpenChange, onWebsiteAdded }) {
  // ==================== STATE MANAGEMENT ====================
  
  const [formData, setFormData] = useState({
    url: "",
    category: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [urlError, setUrlError] = useState("")
  
  // ==================== HOOKS ====================
  
  const { user } = useAuth()
  const { toast } = useToast()

  // ==================== VALIDATION FUNCTIONS ====================

  /**
   * Validate and format URL input
   * @param {string} url - Raw URL input
   * @returns {Object} Validation result with isValid flag and formatted URL
   */
  const validateAndFormatUrl = (url) => {
    if (!url || url.trim().length === 0) {
      return { isValid: false, error: "URL is required", formattedUrl: "" };
    }

    let formattedUrl = url.trim();
    
    // Add protocol if missing
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      const urlObj = new URL(formattedUrl);
      
      // Basic validation checks
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return { isValid: false, error: "Invalid domain name", formattedUrl };
      }

      if (!urlObj.hostname.includes('.')) {
        return { isValid: false, error: "Domain must include a top-level domain (e.g., .com)", formattedUrl };
      }

      return { isValid: true, error: "", formattedUrl };
    } catch (error) {
      return { isValid: false, error: "Please enter a valid URL (e.g., https://example.com)", formattedUrl };
    }
  }

  /**
   * Validate category input
   * @param {string} category - Category input
   * @returns {Object} Validation result
   */
  const validateCategory = (category) => {
    if (!category) return { isValid: true, error: "" }; // Optional field
    
    if (category.length > 50) {
      return { isValid: false, error: "Category must be less than 50 characters" };
    }

    return { isValid: true, error: "" };
  }

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle URL input change with real-time validation
   * @param {Event} e - Input change event
   */
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setFormData(prev => ({ ...prev, url: newUrl }));
    
    // Clear previous error
    setUrlError("");
    
    // Validate if user has typed something
    if (newUrl.trim().length > 0) {
      const validation = validateAndFormatUrl(newUrl);
      if (!validation.isValid) {
        setUrlError(validation.error);
      }
    }
  }

  /**
   * Handle category input change
   * @param {Event} e - Input change event
   */
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFormData(prev => ({ ...prev, category: newCategory }));
  }

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const urlValidation = validateAndFormatUrl(formData.url);
    const categoryValidation = validateCategory(formData.category);

    if (!urlValidation.isValid) {
      setUrlError(urlValidation.error);
      toast({
        title: "Invalid URL",
        description: urlValidation.error,
        variant: "destructive",
      });
      return;
    }

    if (!categoryValidation.isValid) {
      toast({
        title: "Invalid Category",
        description: categoryValidation.error,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create website using the formatted URL
      const response = await websiteAPI.createWebsite(
        urlValidation.formattedUrl,
        user.id,
        formData.category || null
      );

      // Success feedback
      toast({
        title: "Website Added Successfully!",
        description: (
          <div className="space-y-1">
            <p><strong>URL:</strong> {urlValidation.formattedUrl}</p>
            {formData.category && <p><strong>Category:</strong> {formData.category}</p>}
            <p>Your website is now being monitored by our validator network!</p>
          </div>
        ),
      });

      // Reset form and close dialog
      setFormData({ url: "", category: "" });
      setUrlError("");
      onOpenChange(false);

      // Trigger refresh of dashboard data
      if (onWebsiteAdded) {
        onWebsiteAdded();
      }

    } catch (error) {
      console.error("Error adding website:", error);
      
      // Show user-friendly error message
      toast({
        title: "Failed to Add Website",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle dialog close - reset form state
   */
  const handleDialogClose = (open) => {
    if (!open && !isLoading) {
      setFormData({ url: "", category: "" });
      setUrlError("");
    }
    onOpenChange(open);
  }

  // ==================== RENDER ====================

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Add New Website
          </DialogTitle>
          <DialogDescription>
            Add a website to monitor its uptime with our validator network. 
            Validators will earn rewards for checking your site 24/7.
          </DialogDescription>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* How It Works Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">How Website Monitoring Works</p>
                <p className="text-blue-700">
                  Add your website and our global validator network will monitor it 24/7. 
                  You'll receive detailed uptime reports and instant alerts.
                </p>
              </div>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">Website URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={handleUrlChange}
              required
              disabled={isLoading}
              className={urlError ? "border-red-500 focus:border-red-500" : ""}
            />
            {urlError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{urlError}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the full URL including https:// (we'll add it if missing)
            </p>
          </div>

          {/* Category Input */}
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              placeholder="e.g., E-commerce, Blog, API, Portfolio"
              value={formData.category}
              onChange={handleCategoryChange}
              disabled={isLoading}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Help organize your websites by category (max 50 characters)
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={isLoading || !!urlError}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Website...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Add Website for Monitoring
              </>
            )}
          </Button>

          {/* Educational Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">What happens next:</p>
                <ul className="text-green-700 text-xs mt-1 space-y-1">
                  <li>• Your website will be added to our monitoring network</li>
                  <li>• Validators will start checking your site every few minutes</li>
                  <li>• You'll see real-time uptime data in your dashboard</li>
                  <li>• You can delete your website anytime to stop monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
