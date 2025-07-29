"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { useAuth } from "../../contexts/AuthContext"
import { userAPI } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { Settings, Zap, Save, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"

export function UserSettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    replit_agent_url: user?.replit_agent_url || "",
    replit_agent_token: user?.replit_agent_token || "",
  })

  const hasReplitAgent = user?.replit_agent_url && user?.replit_agent_token

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await userAPI.updateUser(user.id, {
        replit_agent_url: formData.replit_agent_url || null,
        replit_agent_token: formData.replit_agent_token || null,
      })

      toast({
        title: "Settings Updated",
        description: "Your Replit agent configuration has been saved successfully.",
      })

      // Update local user data
      const updatedUser = { ...user, ...formData }
      localStorage.setItem("web-tether-user", JSON.stringify(updatedUser))
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
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Replit Agent Configuration
              {hasReplitAgent ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </CardTitle>
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
                <Label htmlFor="replit_agent_token">Replit Agent Token</Label>
                <Input
                  id="replit_agent_token"
                  name="replit_agent_token"
                  type="password"
                  placeholder="Your agent authentication token"
                  value={formData.replit_agent_token}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Authentication token for secure communication with your agent
                </p>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
