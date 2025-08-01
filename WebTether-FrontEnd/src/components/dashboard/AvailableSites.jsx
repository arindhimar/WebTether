"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { isCloudflareWorkerConfigured } from "../../utils/cloudflareAgent"
import { Globe, Zap, Clock, MapPin, Cloud, Coins } from "lucide-react"

export default function AvailableSites() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [pingingStates, setPingingStates] = useState({})

  useEffect(() => {
    fetchAvailableSites()
  }, [])

  const fetchAvailableSites = async () => {
    try {
      const data = await api.getAvailableSites()
      setSites(data)
    } catch (error) {
      console.error("Failed to fetch available sites:", error)
      toast({
        title: "Error",
        description: "Failed to load available sites",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePing = async (site) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to ping websites",
        variant: "destructive",
      })
      return
    }

    if (!isCloudflareWorkerConfigured(user)) {
      toast({
        title: "Worker Not Configured",
        description: "Please configure your Cloudflare Worker in settings first",
        variant: "destructive",
      })
      return
    }

    setPingingStates((prev) => ({ ...prev, [site.wid]: true }))

    try {
      const result = await api.manualPing(site.wid, user.id, site.url)

      if (result.status === "recorded" && result.result) {
        const { is_up, latency_ms, region } = result.result

        toast({
          title: is_up ? "Site is UP! 🟢" : "Site is DOWN 🔴",
          description: (
            <div className="space-y-1">
              <p>
                <strong>URL:</strong> {site.url}
              </p>
              <p>
                <strong>Latency:</strong> {latency_ms}ms
              </p>
              <p>
                <strong>Region:</strong> {region}
              </p>
              <p>
                <strong>Reward:</strong> +5 points earned!
              </p>
            </div>
          ),
          variant: is_up ? "default" : "destructive",
        })
      } else {
        toast({
          title: "Ping Completed",
          description: "Ping result recorded successfully",
        })
      }
    } catch (error) {
      console.error("Ping failed:", error)
      toast({
        title: "Ping Failed",
        description: error.message || "Failed to ping the website",
        variant: "destructive",
      })
    } finally {
      setPingingStates((prev) => ({ ...prev, [site.wid]: false }))
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Available Sites to Ping
          </CardTitle>
          <CardDescription>Loading available websites...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isCloudflareWorkerConfigured(user)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Available Sites to Ping
          </CardTitle>
          <CardDescription>Configure your Cloudflare Worker to start pinging websites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Cloud className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cloudflare Worker Required</h3>
            <p className="text-muted-foreground mb-4">
              You need to configure your Cloudflare Worker to ping websites and earn rewards.
            </p>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => (window.location.href = "/dashboard?tab=settings")}
            >
              <Cloud className="h-4 w-4 mr-2" />
              Configure Worker
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Available Sites to Ping
        </CardTitle>
        <CardDescription>Ping websites using your Cloudflare Worker and earn rewards</CardDescription>
      </CardHeader>
      <CardContent>
        {sites.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sites Available</h3>
            <p className="text-muted-foreground">No websites are currently available for pinging. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sites.map((site) => (
              <div
                key={site.wid}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{site.url}</span>
                    {site.category && (
                      <Badge variant="secondary" className="text-xs">
                        {site.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Ping from your location
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      +5 points reward
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePing(site)}
                  disabled={pingingStates[site.wid]}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {pingingStates[site.wid] ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Pinging...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Ping
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-start gap-2">
            <Cloud className="h-4 w-4 text-orange-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">Using your Cloudflare Worker</p>
              <p className="text-orange-700">
                Pings are executed from your configured Cloudflare Worker:
                <code className="bg-orange-100 px-1 rounded ml-1">{user?.agent_url}</code>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
