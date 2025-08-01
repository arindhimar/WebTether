"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { validateCloudflareWorkerUrl } from "../../utils/cloudflareAgent"
import { Cloud, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"

export default function UserSettings() {
  const { user, refreshUserData } = useAuth()
  const { toast } = useToast()
  const [agentUrl, setAgentUrl] = useState(user?.agent_url || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveAgent = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    // Validate URL
    const validation = validateCloudflareWorkerUrl(agentUrl)
    if (!validation.isValid) {
      toast({
        title: "Invalid URL",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await api.updateUser(user.id, { agent_url: agentUrl })

      // Refresh user data to get the updated information
      await refreshUserData()

      toast({
        title: "Success",
        description: "Cloudflare Worker URL saved successfully!",
      })
    } catch (error) {
      console.error("Failed to save agent URL:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save Cloudflare Worker URL",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isConfigured = user?.agent_url && user.agent_url.trim() !== ""

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-orange-500" />
            Cloudflare Worker Configuration
          </CardTitle>
          <CardDescription>
            Configure your personal Cloudflare Worker to ping websites from your location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-url">Cloudflare Worker URL</Label>
            <Input
              id="agent-url"
              type="url"
              placeholder="https://your-worker.your-subdomain.workers.dev"
              value={agentUrl}
              onChange={(e) => setAgentUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Enter the URL of your deployed Cloudflare Worker that will handle ping requests.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Worker configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-600">Worker not configured</span>
                </>
              )}
            </div>
            <Button onClick={handleSaveAgent} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? "Saving..." : "Save Worker"}
            </Button>
          </div>

          {isConfigured && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-800">Your Cloudflare Worker is configured</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Current URL: <code className="bg-green-100 px-1 rounded">{user.agent_url}</code>
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Need help setting up?</h4>
            <p className="text-sm text-blue-700 mb-2">
              Deploy your own Cloudflare Worker to start pinging websites from your location.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-100 bg-transparent"
              onClick={() => window.open("https://developers.cloudflare.com/workers/", "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Setup Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="text-sm font-medium">{user?.name || "Not set"}</p>
            </div>
            <div>
              <Label>Account Type</Label>
              <p className="text-sm font-medium">{user?.isVisitor ? "Visitor" : "Regular User"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
