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
import { Cloud, ExternalLink, Copy, AlertCircle, Code } from "lucide-react"

export default function CloudflareWorkerSetup({ onComplete }) {
  const { user, refreshUserData } = useAuth()
  const { toast } = useToast()
  const [agentUrl, setAgentUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const workerCode = `// Cloudflare Worker for WebTether
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { url } = await request.json()
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const startTime = Date.now()
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 10000
      })
      
      const latency = Date.now() - startTime
      const region = request.cf?.colo || 'unknown'
      
      return new Response(JSON.stringify({
        is_up: response.ok,
        latency_ms: latency,
        region: region,
        status_code: response.status
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    } catch (error) {
      const latency = Date.now() - startTime
      
      return new Response(JSON.stringify({
        is_up: false,
        latency_ms: latency,
        region: request.cf?.colo || 'unknown',
        error: error.message
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}`

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

      // Refresh user data
      await refreshUserData()

      toast({
        title: "Success",
        description: "Cloudflare Worker configured successfully!",
      })

      if (onComplete) {
        onComplete()
      }
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

  const copyWorkerCode = () => {
    navigator.clipboard.writeText(workerCode)
    toast({
      title: "Copied!",
      description: "Worker code copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            Setup Your Cloudflare Worker
          </CardTitle>
          <CardDescription>
            Deploy your own Cloudflare Worker to ping websites from your location and earn rewards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={showInstructions ? "default" : "outline"}
              onClick={() => setShowInstructions(true)}
              className="flex-1"
            >
              <Code className="h-4 w-4 mr-2" />
              Show Setup Instructions
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("https://developers.cloudflare.com/workers/", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Cloudflare Docs
            </Button>
          </div>

          {showInstructions && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Step-by-step setup:</h3>

              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Go to Cloudflare Workers</p>
                    <p className="text-gray-600">
                      Visit{" "}
                      <a
                        href="https://workers.cloudflare.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        workers.cloudflare.com
                      </a>{" "}
                      and create a new worker
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Copy the worker code</p>
                    <div className="mt-2">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-40">
                          <code>{workerCode}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 bg-transparent"
                          onClick={copyWorkerCode}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Deploy your worker</p>
                    <p className="text-gray-600">Paste the code, save, and deploy. Copy the worker URL.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <div>
                    <p className="font-medium">Enter your worker URL below</p>
                    <p className="text-gray-600">It should look like: https://your-worker.your-subdomain.workers.dev</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="agent-url">Your Cloudflare Worker URL</Label>
            <Input
              id="agent-url"
              type="url"
              placeholder="https://your-worker.your-subdomain.workers.dev"
              value={agentUrl}
              onChange={(e) => setAgentUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">Enter the URL of your deployed Cloudflare Worker</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveAgent}
              disabled={isLoading || !agentUrl.trim()}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
            >
              {isLoading ? "Configuring..." : "Configure Worker"}
            </Button>
            <Button variant="outline" onClick={() => onComplete && onComplete()}>
              Skip for now
            </Button>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Why use your own worker?</p>
                <p className="text-blue-700">
                  By running your own Cloudflare Worker, you ping websites from your location, earn rewards for
                  contributing to the network, and help provide global coverage.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
