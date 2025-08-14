"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import { Alert, AlertDescription } from "./ui/alert"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../hooks/use-toast"
import { Wallet, TrendingUp, DollarSign, RefreshCw, AlertCircle, Eye, EyeOff } from "lucide-react"
import { api } from "../services/api"

export default function WalletBalance() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [balance, setBalance] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    if (user) {
      loadWalletBalance()
    }
  }, [user])

  const loadWalletBalance = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Loading wallet balance...")
      const response = await api.getWalletBalance()
      console.log("Wallet balance response:", response)

      if (response) {
        setBalance({
          total: Number.parseFloat(response.eth_balance || 0),
          available: Number.parseFloat(response.eth_balance || 0),
          pending: 0,
          usdValue: Number.parseFloat(response.usd_value || 0),
          walletAddress: response.wallet_address,
          totalSpent: Number.parseFloat(response.total_spent || 0),
          totalPings: response.total_pings || 0,
        })
      } else {
        // Default values if no response
        setBalance({
          total: 0,
          available: 0,
          pending: 0,
          usdValue: 0,
          walletAddress: null,
          totalSpent: 0,
          totalPings: 0,
        })
      }
    } catch (error) {
      console.error("Error loading wallet balance:", error)
      setError(error.message || "Failed to load wallet balance")

      // Set default values on error
      setBalance({
        total: 0,
        available: 0,
        pending: 0,
        usdValue: 0,
        walletAddress: null,
        totalSpent: 0,
        totalPings: 0,
      })

      toast({
        title: "Error",
        description: "Failed to load wallet balance. Showing default values.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatAddress = (address) => {
    if (!address) return "Not connected"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatCurrency = (amount, currency = "ETH") => {
    if (amount === null || amount === undefined) return "0.000000"
    return `${Number.parseFloat(amount).toFixed(6)} ${currency}`
  }

  if (isLoading) {
    return (
      <Card className="floating-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">Wallet Balance</CardTitle>
            </div>
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 loading-shimmer" />
            <Skeleton className="h-4 w-24 loading-shimmer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 loading-shimmer" />
              <Skeleton className="h-5 w-20 loading-shimmer" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 loading-shimmer" />
              <Skeleton className="h-5 w-20 loading-shimmer" />
            </div>
          </div>
          <Skeleton className="h-8 w-full loading-shimmer rounded" />
        </CardContent>
      </Card>
    )
  }

  if (error && !balance) {
    return (
      <Card className="floating-card">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadWalletBalance} className="ml-4 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="floating-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <CardTitle className="text-base sm:text-lg">Wallet Balance</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)} className="h-6 w-6 p-0">
              {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={loadWalletBalance} disabled={isLoading} className="h-6 w-6 p-0">
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Balance */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {showBalance ? formatCurrency(balance?.total) : "••••••"}
            </span>
            {balance?.total > 0 && (
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-2.5 w-2.5 mr-1" />
                Active
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {showBalance ? `≈ $${balance?.usdValue?.toFixed(2) || "0.00"} USD` : "≈ $••••"}
          </p>
        </div>

        {/* Balance Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Available</p>
            <p className="font-semibold">{showBalance ? formatCurrency(balance?.available) : "••••••"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Spent</p>
            <p className="font-semibold">{showBalance ? formatCurrency(balance?.totalSpent) : "••••••"}</p>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Wallet</span>
            <span className="font-mono">{formatAddress(balance?.walletAddress)}</span>
          </div>
        </div>

        {/* Stats */}
        {balance?.totalPings > 0 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>{balance.totalPings} transactions</span>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Debug: Balance loaded: {balance ? "Yes" : "No"}, Error: {error || "None"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
