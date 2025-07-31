"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { useAuth } from "../../contexts/AuthContext"
import { userAPI } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { Settings, Zap, Save, ExternalLink, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
// Import the utility at the top
import { hasValidReplitAgent, getReplitAgentStatus, debugReplitAgent } from "../../utils/replitAgent"
import { hasValidCloudflareAgent, getCloudflareAgentStatus, debugCloudflareAgent } from "../../utils/cloudflareAgent"

export function UserSettings() {
  const { user, setUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    replit_agent_url: user?.replit_agent_url || "",
    agent_url: user?.agent_url || "",
    replit_agent_token: localStorage.getItem("web-tether-token") || "", // Use JWT token
  })

  // Replace the hasReplitAgent check
  const hasReplitAgent = hasValidReplitAgent(user)
  const replitAgentStatus = getReplitAgentStatus(user)

  const hasCloudflareAgent = hasValidCloudflareAgent(user)
  const cloudflareAgentStatus = getCloudflareAgentStatus(user)

  // Add debug logging and status display
  useEffect(() => {
    if (user) {
      debugReplitAgent(user)
      debugCloudflareAgent(user)
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const currentJWTToken = localStorage.getItem("web-tether-token")

      await userAPI.updateUser(user.id, {
        replit_agent_url: formData.replit_agent_url || null,
        agent_url: formData.agent_url || null,
        replit_agent_token: currentJWTToken, // Always use current JWT
      })

      toast({
        title: "Settings Updated",
        description: "Your agent configuration has been saved successfully.",
      })

      // Update local user data and trigger a re-render
      const updatedUser = {
        ...user,
        replit_agent_url: formData.replit_agent_url,
        agent_url: formData.agent_url,
        replit_agent_token: currentJWTToken,
      }

      // Update the user in AuthContext
      setUser(updatedUser)
      localStorage.setItem("web-tether-user", JSON.stringify(updatedUser))

      // Force a page refresh to ensure all components get the updated user data
      window.location.reload()
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to refresh user data
  const refreshUserData = async () => {
    try {
      const latestUserData = await userAPI.getUserById(user.id)
      const updatedUser = { ...user, ...latestUserData }

      setUser(updatedUser)
      localStorage.setItem("web-tether-user", JSON.stringify(updatedUser))

      toast({
        title: "Data Refreshed",
        description: "User data has been refreshed from the database.",
      })
    } catch (error) {
      console.error("Error refreshing user data:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh user data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            User Profile
          </CardTitle>
          <CardDescription>Your account information and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Role</Label>
              <div className="flex items-center gap-2">
                <Badge variant={user?.isVisitor ? "default" : "secondary"}>
                  {user?.isVisitor ? "Validator" : "Website Owner"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replit Agent Configuration - Only for validators */}
      {user?.isVisitor && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Replit Agent Configuration
                {hasReplitAgent ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={refreshUserData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
            <CardDescription>
              Configure your Replit agent to perform website validations and earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasReplitAgent && (
              <div className="mb-6 p-4 border rounded-lg bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">Agent Required</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You need to configure your Replit agent to start accepting ping requests and earning rewards.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="replit_agent_url">Replit Agent URL</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open("https://replit.com", "_blank")}
                    className="h-auto p-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  id="replit_agent_url"
                  name="replit_agent_url"
                  type="url"
                  placeholder="https://your-replit-agent.repl.co"
                  value={formData.replit_agent_url}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  The URL of your deployed Replit agent that will perform website checks
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_url">Cloudflare Worker URL</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open("https://workers.cloudflare.com", "_blank")}
                  className="h-auto p-1"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              <Input
                id="agent_url"
                name="agent_url"
                type="url"
                placeholder="https://your-worker.your-subdomain.workers.dev"
                value={formData.agent_url}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                The URL of your deployed Cloudflare Worker that will perform website checks
              </p>

              <div className="space-y-2">
                <Label htmlFor="replit_agent_token">Agent Token (JWT)</Label>
                <Input
                  id="replit_agent_token"
                  name="replit_agent_token"
                  type="text"
                  placeholder="Your JWT authentication token"
                  value={formData.replit_agent_token}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Your Web-Tether JWT token - automatically synced with your login session
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      replit_agent_token: localStorage.getItem("web-tether-token") || "",
                    }))
                  }
                >
                  Refresh Token
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </motion.form>

            {hasReplitAgent && (
              <div className="mt-6 p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Agent Connected</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your Replit agent is configured and ready to accept ping requests.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasCloudflareAgent && (
              <div className="mt-6 p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Worker Connected</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your Cloudflare Worker is configured and ready to accept ping requests.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug section */}
      {user?.isVisitor && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs font-mono">
              <div>User ID: {user?.id}</div>
              <div>Replit Agent URL: {user?.replit_agent_url || "Not set"}</div>
              <div>Worker URL: {user?.agent_url || "Not set"}</div>
              <div>JWT Token: {user?.replit_agent_token ? "Present" : "Not set"}</div>
              <div>Replit Agent Status: {replitAgentStatus.message}</div>
              <div>Cloudflare Worker Status: {cloudflareAgentStatus.message}</div>
              <div>Replit Agent Configured: {hasReplitAgent ? "Yes" : "No"}</div>
              <div>Cloudflare Worker Configured: {hasCloudflareAgent ? "Yes" : "No"}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
