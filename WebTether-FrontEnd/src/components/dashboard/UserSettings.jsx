"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { validateCloudflareWorkerUrl } from "../../utils/cloudflareAgent"
import {
  Cloud,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Settings,
  User,
  Shield,
  Loader2,
  Save,
  Info,
  Globe,
  Zap,
} from "lucide-react"

export default function UserSettings() {
  const { user, refreshUserData } = useAuth()
  const { toast } = useToast()
  const [agentUrl, setAgentUrl] = useState(user?.agent_url || "")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSaveAgent = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "User session expired. Please log in again.",
        variant: "destructive",
      })
      return
    }

    // Validate URL if provided
    if (agentUrl.trim()) {
      const validation = validateCloudflareWorkerUrl(agentUrl)
      if (!validation.isValid) {
        setErrors({ agentUrl: validation.error })
        toast({
          title: "Invalid Worker URL",
          description: validation.error,
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)
    setErrors({})

    try {
      await api.updateUser(user.id, { agent_url: agentUrl.trim() })
      await refreshUserData()

      toast({
        title: "Settings Saved Successfully! ✅",
        description: agentUrl.trim()
          ? "Your Cloudflare Worker URL has been updated."
          : "Cloudflare Worker URL has been removed.",
        action: <CheckCircle className="h-4 w-4" />,
      })
    } catch (error) {
      console.error("Failed to save agent URL:", error)
      const errorMessage = error.message || "Failed to save settings. Please try again."
      setErrors({ general: errorMessage })
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value) => {
    setAgentUrl(value)
    if (errors.agentUrl) {
      setErrors((prev) => ({ ...prev, agentUrl: null }))
    }
  }

  const isConfigured = user?.agent_url && user.agent_url.trim() !== ""

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          Account Settings
        </h1>
        <p className="text-muted-foreground">Manage your account preferences and validator configuration</p>
      </div>

      {/* General Errors */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Cloudflare Worker Configuration */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-orange-50/30">
        <CardHeader className="pb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-orange-100">
              <Cloud className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2">
                Cloudflare Worker Configuration
                {isConfigured && <Badge className="bg-green-100 text-green-800">Active</Badge>}
              </CardTitle>
              <CardDescription className="mt-1">
                Configure your personal Cloudflare Worker to ping websites from your location and earn rewards
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="agent-url" className="text-sm font-medium">
              Cloudflare Worker URL
            </Label>
            <div className="relative">
              <Input
                id="agent-url"
                type="url"
                placeholder="https://your-worker.your-subdomain.workers.dev"
                value={agentUrl}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`font-mono text-sm h-11 pl-10 ${errors.agentUrl ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                disabled={isLoading}
              />
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.agentUrl && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.agentUrl}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter the URL of your deployed Cloudflare Worker that will handle ping requests
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
            <div className="flex items-center gap-3">
              {isConfigured ? (
                <>
                  <div className="p-2 rounded-full bg-green-100">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-green-700">Worker Configured</span>
                    <p className="text-xs text-muted-foreground">Ready to earn rewards</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-full bg-orange-100">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-orange-700">Worker Not Configured</span>
                    <p className="text-xs text-muted-foreground">Setup required to start earning</p>
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={handleSaveAgent}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>

          {isConfigured && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Your Cloudflare Worker is active!</strong>
                <br />
                Current URL: <code className="bg-green-100 px-1 rounded text-xs font-mono">{user.agent_url}</code>
              </AlertDescription>
            </Alert>
          )}

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Need help setting up?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Deploy your own Cloudflare Worker to start pinging websites from your location and earning rewards.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 hover:bg-blue-100 bg-transparent"
                    onClick={() => window.open("https://developers.cloudflare.com/workers/", "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Setup Guide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-blue-50/30">
        <CardHeader className="pb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Account Information</CardTitle>
              <CardDescription className="mt-1">Your account details and current status</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
              <div className="p-3 bg-background/60 rounded-lg border">
                <p className="text-sm font-semibold">{user?.name || "Not set"}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
              <div className="p-3 bg-background/60 rounded-lg border">
                <p className="text-sm font-mono">{user?.email || "Not set"}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
              <div className="p-3 bg-background/60 rounded-lg border">
                <Badge
                  variant={user?.isVisitor ? "default" : "secondary"}
                  className={`text-sm ${user?.isVisitor ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.isVisitor ? "Validator Account" : "Website Owner"}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
              <div className="p-3 bg-background/60 rounded-lg border">
                <p className="text-sm font-semibold">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Account Capabilities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-background/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Website Monitoring</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Ping Validation</span>
                    </div>
                    <Badge
                      variant={isConfigured ? "default" : "secondary"}
                      className={`text-xs ${isConfigured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                    >
                      {isConfigured ? "Active" : "Setup Required"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Wallet Integration</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Earnings Tracking</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {!isConfigured && user?.isVisitor && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Action Required:</strong> Configure your Cloudflare Worker above to start earning rewards by
                validating websites. Without this setup, you won't be able to participate in the validation network.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
