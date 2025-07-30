"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { useAuth } from "../../contexts/AuthContext"
import { userAPI } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { ExternalLink, Copy, CheckCircle, ArrowRight, Zap, Globe, Code, Play, Loader2 } from "lucide-react"

export function ReplitAgentSetup({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(1)
  const getJWTToken = () => {
    return localStorage.getItem("web-tether-token") || ""
  }
  const [agentData, setAgentData] = useState({
    url: "",
    token: getJWTToken(), // Pre-fill with JWT token
  })
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const REPLIT_TEMPLATE_URL = "https://replit.com/github/web-tether/ping-agent-template"

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const handleAgentSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await userAPI.updateUser(user.id, {
        replit_agent_url: agentData.url,
        replit_agent_token: agentData.token,
      })

      toast({
        title: "Agent Connected!",
        description: "Your Replit agent is now configured and ready to ping websites.",
      })

      // Update local user data
      const updatedUser = {
        ...user,
        replit_agent_url: agentData.url,
        replit_agent_token: agentData.token,
      }
      localStorage.setItem("web-tether-user", JSON.stringify(updatedUser))

      onComplete()
    } catch (error) {
      console.error("Error saving agent data:", error)
      toast({
        title: "Setup Failed",
        description: "Failed to save agent configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      title: "Deploy Agent on Replit",
      description: "Fork and run the ping agent template",
      icon: ExternalLink,
    },
    {
      title: "Configure Token",
      description: "Set up authentication in your agent",
      icon: Code,
    },
    {
      title: "Connect to Platform",
      description: "Link your agent to Web-Tether",
      icon: Zap,
    },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Set Up Your Replit Agent
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Want to ping websites from your location? Deploy your Replit Ping Agent now!
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep > index + 1
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === index + 1
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {currentStep > index + 1 ? <CheckCircle className="h-5 w-5" /> : <span>{index + 1}</span>}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${currentStep > index + 1 ? "bg-green-500" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Deploy Your Agent
                  </h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">
                        1
                      </Badge>
                      <div>
                        <p className="font-medium">Click "Deploy Agent on Replit" below</p>
                        <p className="text-muted-foreground">This will open our ping agent template</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">
                        2
                      </Badge>
                      <div>
                        <p className="font-medium">Fork the project to your account</p>
                        <p className="text-muted-foreground">Click "Fork" to create your own copy</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">
                        3
                      </Badge>
                      <div>
                        <p className="font-medium">Note your agent URL</p>
                        <p className="text-muted-foreground">
                          It will be something like:{" "}
                          <code className="bg-muted px-1 rounded">https://username.repl.co</code>
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => window.open(REPLIT_TEMPLATE_URL, "_blank")}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Deploy Agent on Replit
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Configure Your Token
                  </h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">
                        1
                      </Badge>
                      <div>
                        <p className="font-medium">
                          Create a <code className="bg-muted px-1 rounded">.env</code> file in your Replit project
                        </p>
                        <p className="text-muted-foreground">Add environment variables for authentication</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">
                        2
                      </Badge>
                      <div>
                        <p className="font-medium">Add this content to your .env file:</p>
                        <p className="text-muted-foreground mt-1">
                          This uses your Web-Tether JWT token for secure authentication
                        </p>
                        <div className="mt-2 p-3 bg-black text-green-400 rounded font-mono text-xs relative">
                          <code>AUTH_TOKEN={getJWTToken()}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 text-green-400 hover:text-green-300"
                            onClick={() => handleCopyToClipboard(`AUTH_TOKEN=${getJWTToken()}`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">
                        3
                      </Badge>
                      <div>
                        <p className="font-medium">Click "Run" to start your agent</p>
                        <p className="text-muted-foreground">
                          Your agent should now be live and ready to receive ping requests
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Agent is Running
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Connect Your Agent
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Copy your agent URL and token from Replit and paste them below:
                  </p>
                </div>

                <form onSubmit={handleAgentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-url">Agent URL</Label>
                    <Input
                      id="agent-url"
                      type="url"
                      placeholder="https://username.repl.co"
                      value={agentData.url}
                      onChange={(e) => setAgentData((prev) => ({ ...prev, url: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Replit app URL (found in the address bar when your app is running)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-token">Agent Token</Label>
                    <Input
                      id="agent-token"
                      type="text"
                      placeholder={getJWTToken()}
                      value={agentData.token}
                      onChange={(e) => setAgentData((prev) => ({ ...prev, token: e.target.value }))}
                      required
                      disabled={isLoading}
                      readOnly // Make it read-only since it's the JWT token
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Web-Tether JWT token - this authenticates your agent with our platform
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAgentData((prev) => ({ ...prev, token: getJWTToken() }))}
                    >
                      Refresh Token
                    </Button>
                    <span className="text-xs text-muted-foreground">Click if you've logged in again</span>
                  </div>

                  <Separator />

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} disabled={isLoading}>
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting Agent...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Complete Setup
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground hover:text-foreground">
            Skip for now (you can set this up later in settings)
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
