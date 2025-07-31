"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { useAuth } from "../../contexts/AuthContext"
import { userAPI } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import {
  ExternalLink,
  Copy,
  CheckCircle,
  ArrowRight,
  Cloud,
  Globe,
  Code,
  Play,
  Loader2,
} from "lucide-react"

export function CloudflareWorkerSetup({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(1)
  const getJWTToken = () => localStorage.getItem("web-tether-token") || ""
  const [agentData, setAgentData] = useState({
    url: "",
    token: getJWTToken(),
  })
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const CLOUDFLARE_WORKERS_URL = "https://workers.cloudflare.com"

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
        agent_url: agentData.url,
        replit_agent_token: agentData.token,
      })

      toast({
        title: "Worker Connected!",
        description:
          "Your Cloudflare Worker is now configured and ready to ping websites.",
      })

      const updatedUser = {
        ...user,
        agent_url: agentData.url,
        replit_agent_token: agentData.token,
      }
      localStorage.setItem("web-tether-user", JSON.stringify(updatedUser))

      onComplete()
    } catch (error) {
      console.error("Error saving agent data:", error)
      toast({
        title: "Setup Failed",
        description: "Failed to save worker configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      title: "Create Cloudflare Worker",
      description: "Set up your worker on Cloudflare",
      icon: ExternalLink,
    },
    {
      title: "Configure Worker Code",
      description: "Add the ping functionality to your worker",
      icon: Code,
    },
    {
      title: "Connect to Platform",
      description: "Link your worker to Web-Tether",
      icon: Cloud,
    },
  ]

  const workerCode = `export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const { url } = await request.json();

      if (!url || !url.startsWith("http")) {
        return new Response(JSON.stringify({ error: "Invalid URL" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const start = Date.now();
      let isUp = false;
      let latency = null;

      try {
        const res = await fetch(url, {
          method: "HEAD", // Less bandwidth than GET
        });

        isUp = res.ok;
        latency = Date.now() - start;
      } catch (err) {
        isUp = false;
      }

      const region = request.cf?.colo || "unknown";

      return new Response(
        JSON.stringify({
          is_up: isUp,
          latency_ms: latency,
          region: region,
          checked_url: url,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Malformed request or internal error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
`

  const StepIcon = ({ icon: Icon }) => {
    return <Icon className="h-5 w-5 text-orange-600" />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 to-red-600">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Set Up Your Cloudflare Worker
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Want to ping websites from your location? Deploy your Cloudflare Worker now!
          </p>
        </div>

        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep > index + 1
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === index + 1
                    ? "bg-orange-600 border-orange-600 text-white"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {currentStep > index + 1 ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${currentStep > index + 1 ? "bg-green-500" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1].icon && <StepIcon icon={steps[currentStep - 1].icon} />}
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
                    Create Your Worker
                  </h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium">Go to Cloudflare Workers</p>
                        <p className="text-muted-foreground">Click "Create Worker" below to open Cloudflare Workers</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium">Create a new worker</p>
                        <p className="text-muted-foreground">Click "Create Service" and give it a name like "web-tether-ping"</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <div>
                        <p className="font-medium">Note your worker URL</p>
                        <p className="text-muted-foreground">
                          It will be something like: <code className="bg-muted px-1 rounded">https://web-tether-ping.your-subdomain.workers.dev</code>
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => window.open(CLOUDFLARE_WORKERS_URL, "_blank")}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Create Worker
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
                    Configure Your Worker
                  </h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium">Replace the worker code</p>
                        <p className="text-muted-foreground">Copy the code below and paste it into your worker editor</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium">Deploy your worker</p>
                        <p className="text-muted-foreground">Click "Save and Deploy" to make your worker live</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Worker Code (Copy this):</Label>
                    <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(workerCode)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                  <pre className="bg-black text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                    <code>{workerCode}</code>
                  </pre>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>Previous</Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Worker is Deployed
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
                    Connect Your Worker
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Copy your worker URL from Cloudflare and paste it below:
                  </p>
                </div>

                <form onSubmit={handleAgentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-url">Worker URL</Label>
                    <Input
                      id="agent-url"
                      type="url"
                      placeholder="https://web-tether-ping.your-subdomain.workers.dev"
                      value={agentData.url}
                      onChange={(e) => setAgentData((prev) => ({ ...prev, url: e.target.value }))}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Cloudflare Worker URL (found in your Workers dashboard)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-token">Agent Token</Label>
                    <Input
                      id="agent-token"
                      type="text"
                      placeholder={getJWTToken()}
                      value={agentData.token}
                      readOnly
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Web-Tether JWT token - this authenticates your worker with our platform
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
                          Connecting Worker...
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

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground hover:text-foreground">
            Skip for now (you can set this up later in settings)
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
