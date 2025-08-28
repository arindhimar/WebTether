"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../hooks/use-toast"
import { LoadingSpinner } from "./LoadingSpinner"
import {
  Save,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Code,
  Server,
  Globe,
  ChevronRight,
  Play,
} from "lucide-react"
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
  const [showCode, setShowCode] = useState(false)

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

    if (field === "agentUrl") {
      const validation = validateCloudflareWorkerUrl(value)
      setUrlValidation(validation)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)

      const validation = validateCloudflareWorkerUrl(settings.agentUrl)
      if (!validation.isValid) {
        toast({
          title: "Invalid URL",
          description: validation.error,
          variant: "destructive",
        })
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

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

  const cloudflareWorkerCode = `// Cloudflare Worker for WebTether
export default {
  async fetch(request, env, ctx) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Validator Settings</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Configure your Cloudflare Worker to start earning ETH
          </p>
        </div>

        {/* Status Card */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            {isConfigured ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm sm:text-base">
                    Validator Active
                  </h3>
                  <p className="text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
                    Your worker is configured and earning ETH
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm sm:text-base">
                    Setup Required
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
                    Configure your worker to start earning
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Form */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-slate-900 dark:text-white">
              <Server className="h-5 w-5 text-blue-600" />
              Worker Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="agentUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Worker URL *
              </Label>
              <Input
                id="agentUrl"
                value={settings.agentUrl}
                onChange={(e) => handleInputChange("agentUrl", e.target.value)}
                placeholder="https://your-worker.workers.dev"
                className={`h-12 text-base ${!urlValidation.isValid ? "border-red-500" : ""}`}
              />
              {!urlValidation.isValid && <p className="text-sm text-red-600">{urlValidation.error}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="agentName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Worker Name
                </Label>
                <Input
                  id="agentName"
                  value={settings.agentName}
                  onChange={(e) => handleInputChange("agentName", e.target.value)}
                  placeholder="My Validator"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="agentDescription" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </Label>
                <Input
                  id="agentDescription"
                  value={settings.agentDescription}
                  onChange={(e) => handleInputChange("agentDescription", e.target.value)}
                  placeholder="US-East validator"
                  className="h-12 text-base"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={isSaving || !urlValidation.isValid}
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
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

        {/* Quick Setup Steps */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-slate-900 dark:text-white">
              <Play className="h-5 w-5 text-emerald-600" />
              Quick Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  title: "Create Worker",
                  desc: "Go to Cloudflare Dashboard → Workers & Pages",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  step: "2",
                  title: "Deploy Code",
                  desc: "Copy the worker code below",
                  color: "from-emerald-500 to-emerald-600",
                },
                {
                  step: "3",
                  title: "Configure URL",
                  desc: "Paste your worker URL above",
                  color: "from-violet-500 to-violet-600",
                },
                {
                  step: "4",
                  title: "Start Earning",
                  desc: "Receive ping requests automatically",
                  color: "from-amber-500 to-amber-600",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                  >
                    {item.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">{item.title}</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => setShowCode(!showCode)}
                variant="outline"
                className="flex-1 h-11 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <Code className="h-4 w-4 mr-2" />
                {showCode ? "Hide Code" : "Show Code"}
              </Button>
              <Button
                onClick={() => window.open("https://dash.cloudflare.com/", "_blank")}
                variant="outline"
                className="flex-1 h-11 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Cloudflare
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Worker Code (Collapsible) */}
        {showCode && (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-slate-900 dark:text-white">
                <Globe className="h-5 w-5 text-emerald-600" />
                Worker Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm max-h-64 sm:max-h-80 overflow-y-auto">
                  <code>{cloudflareWorkerCode}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(cloudflareWorkerCode)}
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-slate-700 hover:bg-slate-600"
                  variant="secondary"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => copyToClipboard(cloudflareWorkerCode)}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Worker Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Benefits Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: "💰",
              title: "Earn ETH",
              desc: "Get paid for validations",
              color:
                "from-emerald-50 to-emerald-50 dark:from-emerald-950/20 dark:to-emerald-950/20 border-emerald-200 dark:border-emerald-800",
            },
            {
              icon: "🌍",
              title: "Global Network",
              desc: "Join worldwide validators",
              color:
                "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800",
            },
            {
              icon: "⚡",
              title: "Low Maintenance",
              desc: "Set once, earn passively",
              color:
                "from-violet-50 to-violet-50 dark:from-violet-950/20 dark:to-violet-950/20 border-violet-200 dark:border-violet-800",
            },
            {
              icon: "🚀",
              title: "Fast & Reliable",
              desc: "Cloudflare edge network",
              color:
                "from-amber-50 to-amber-50 dark:from-amber-950/20 dark:to-amber-950/20 border-amber-200 dark:border-amber-800",
            },
          ].map((benefit, index) => (
            <Card key={index} className={`border ${benefit.color} shadow-sm`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{benefit.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{benefit.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
