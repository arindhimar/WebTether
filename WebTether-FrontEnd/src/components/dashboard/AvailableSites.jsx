import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../services/api"
import { useToast } from "../../hooks/use-toast"
import { isCloudflareWorkerConfigured } from "../../utils/cloudflareAgent"
import { SimulatedPingButton } from "../SimulatedPingButton"
import { WalletBalance } from '../WalletBalance'
import { Globe, MapPin, Cloud, Coins, Server, TestTube } from 'lucide-react'

export default function AvailableSites({ onPingAccepted }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)

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

  const handlePingComplete = () => {
    // Refresh data after successful ping
    if (onPingAccepted) {
      onPingAccepted()
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
              onClick={() => window.location.href = "/dashboard?view=settings"}
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance - Left Column */}
        <div className="lg:col-span-1">
          <WalletBalance />
        </div>

        {/* Available Sites - Right Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Test Environment Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Environment
              </CardTitle>
              <CardDescription>Simulated blockchain transactions for development and testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-2">
                  <TestTube className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Educational Demo Mode</p>
                    <p className="text-green-700">
                      This is a simulated transaction environment. No real cryptocurrency or MetaMask connection is required.
                      Select from 20 fake transaction codes (TX-001 to TX-020) to simulate blockchain payments.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backend Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Backend Connection
              </CardTitle>
              <CardDescription>Connected to Hardhat backend at http://127.0.0.1:5000</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Local Development Setup</p>
                    <p className="text-blue-700">
                      The backend processes simulated transactions using Hardhat and records all ping results.
                      Each ping simulation earns you points and provides real website status data.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Sites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Available Sites to Ping
              </CardTitle>
              <CardDescription>Select a website and simulate a ping transaction</CardDescription>
            </CardHeader>
            <CardContent>
              {sites.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Sites Available</h3>
                  <p className="text-muted-foreground">No websites are currently available for pinging. Check back later!</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-1">
                  {sites.map((site) => (
                    <div
                      key={site.wid}
                      className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-lg">{site.url}</span>
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
                            <span className="flex items-center gap-1">
                              <TestTube className="h-3 w-3" />
                              Simulated transaction
                            </span>
                          </div>
                        </div>

                        <SimulatedPingButton 
                          wid={site.wid} 
                          url={site.url} 
                          toast={toast}
                          onPingComplete={handlePingComplete}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-md">
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
        </div>
      </div>
    </div>
  )
}
