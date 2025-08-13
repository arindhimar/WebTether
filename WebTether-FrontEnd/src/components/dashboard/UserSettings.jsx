"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../hooks/use-toast"
import { LoadingSpinner } from "./LoadingSpinner"
import { Save, CheckCircle, AlertTriangle, Copy, ExternalLink, Code, Server, Globe, Zap } from "lucide-react"
import { validateCloudflareWorkerUrl, isCloudflareWorkerConfigured } from "../../utils/cloudflareAgent"

export default function UserSettings() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    agentUrl: "",
    agentName: "",
    agentDescription: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [urlValidation, setUrlValidation] = useState({ isValid: true, error: "" })

  useEffect(() => {
    if (user) {
      setSettings({
        agentUrl: user.agent_url || "",
        agentName: user.agent_name || "",
        agentDescription: user.agent_description || "",
      })
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Validate URL in real-time
    if (field === "agentUrl") {
      const validation = validateCloudflareWorkerUrl(value)
      setUrlValidation(validation)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)

      // Validate URL before saving
      const validation = validateCloudflareWorkerUrl(settings.agentUrl)
      if (!validation.isValid) {
        toast({
          title: "Invalid URL",
          description: validation.error,
          variant: "destructive",
        })
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user context
      await updateUser({
        agent_url: settings.agentUrl,
        agent_name: settings.agentName,
        agent_description: settings.agentDescription,
      })

      toast({
        title: "Settings Saved! 🎉",
        description: "Your Cloudflare Worker configuration has been updated.",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard.",
    })
  }

  const isConfigured = isCloudflareWorkerConfigured(user)

  const cloudflareWorkerCode = `// Cloudflare Worker for WebTether Validation
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      const url = new URL(request.url);
      
      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          region: request.cf?.colo || 'unknown'
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Ping validation endpoint
      if (url.pathname === '/validate' && request.method === 'POST') {
        const body = await request.json();
        const { targetUrl, timeout = 5000 } = body;

        if (!targetUrl) {
          return new Response(JSON.stringify({ 
            error: 'targetUrl is required' 
          }), { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        const startTime = Date.now();
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          const response = await fetch(targetUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'User-Agent': 'WebTether-Validator/1.0'
            }
          });
          
          clearTimeout(timeoutId);
          const endTime = Date.now();
          const latency = endTime - startTime;

          return new Response(JSON.stringify({
            success: true,
            isUp: response.ok,
            statusCode: response.status,
            latency: latency,
            timestamp: new Date().toISOString(),
            region: request.cf?.colo || 'unknown',
            validatorId: env.VALIDATOR_ID || 'unknown'
          }), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });

        } catch (error) {
          const endTime = Date.now();
          const latency = endTime - startTime;

          return new Response(JSON.stringify({
            success: true,
            isUp: false,
            error: error.message,
            latency: latency,
            timestamp: new Date().toISOString(),
            region: request.cf?.colo || 'unknown',
            validatorId: env.VALIDATOR_ID || 'unknown'
          }), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }

      return new Response('Not Found', { status: 404 });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  },
};`

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="grid gap-8">
        {/* Cloudflare Worker Configuration */}
        <Card className="modern-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                <Server className="h-5 w-5 text-white" />
              </div>
              Cloudflare Worker Configuration
            </CardTitle>
            <CardDescription>
              Configure your Cloudflare Worker to validate websites and earn ETH rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Alert */}
            {isConfigured ? (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Your Cloudflare Worker is configured and ready to validate websites!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  Configure your Cloudflare Worker to start earning ETH from website validations.
                </AlertDescription>
              </Alert>
            )}

            {/* Configuration Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentUrl" className="text-sm font-medium">
                  Worker URL *
                </Label>
                <Input
                  id="agentUrl"
                  value={settings.agentUrl}
                  onChange={(e) => handleInputChange("agentUrl", e.target.value)}
                  placeholder="https://your-worker.your-subdomain.workers.dev"
                  className={`input-modern h-12 ${!urlValidation.isValid ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {!urlValidation.isValid && <p className="text-sm text-red-600">{urlValidation.error}</p>}
                <p className="text-sm text-muted-foreground">
                  Your Cloudflare Worker URL (must end with .workers.dev or .workers.cloudflare.com)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentName" className="text-sm font-medium">
                  Worker Name (Optional)
                </Label>
                <Input
                  id="agentName"
                  value={settings.agentName}
                  onChange={(e) => handleInputChange("agentName", e.target.value)}
                  placeholder="My WebTether Validator"
                  className="input-modern h-12"
                />
                <p className="text-sm text-muted-foreground">A friendly name for your validator worker</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentDescription" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Input
                  id="agentDescription"
                  value={settings.agentDescription}
                  onChange={(e) => handleInputChange("agentDescription", e.target.value)}
                  placeholder="High-performance validator in US-East region"
                  className="input-modern h-12"
                />
                <p className="text-sm text-muted-foreground">Brief description of your validator setup</p>
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={isSaving || !urlValidation.isValid}
              className="w-full btn-primary h-12 rounded-xl"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="modern-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Code className="h-5 w-5 text-white" />
              </div>
              Setup Instructions
            </CardTitle>
            <CardDescription>Follow these steps to deploy your Cloudflare Worker validator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step-by-step guide */}
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Create Cloudflare Worker</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to Cloudflare Dashboard → Workers & Pages → Create Application → Create Worker
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Deploy Worker Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Copy the code below and paste it into your Cloudflare Worker editor
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Configure URL</h4>
                  <p className="text-sm text-muted-foreground">
                    Copy your Worker URL and paste it in the configuration form above
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Start Earning</h4>
                  <p className="text-sm text-muted-foreground">
                    Your validator will automatically start receiving ping requests and earning ETH
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Worker Code */}
        <Card className="modern-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              Cloudflare Worker Code
            </CardTitle>
            <CardDescription>Copy this code and paste it into your Cloudflare Worker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm max-h-96 overflow-y-auto">
                <code>{cloudflareWorkerCode}</code>
              </pre>
              <Button
                onClick={() => copyToClipboard(cloudflareWorkerCode)}
                className="absolute top-2 right-2 h-8 w-8 p-0"
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => copyToClipboard(cloudflareWorkerCode)}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button
                onClick={() => window.open("https://dash.cloudflare.com/", "_blank")}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Cloudflare
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features & Benefits */}
        <Card className="modern-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
              <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              Validator Benefits
            </CardTitle>
            <CardDescription>Why run a WebTether validator?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Earn ETH Rewards</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Get paid in ETH for every website validation you perform
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Global Network</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Join validators worldwide providing reliable uptime monitoring
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Low Maintenance</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Set it up once and earn passively with minimal maintenance
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Fast & Reliable</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Cloudflare's edge network ensures fast, reliable validations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
