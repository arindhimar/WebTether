"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import { Wallet, RefreshCw, TrendingUp, AlertCircle, DollarSign, Zap } from "lucide-react"
import { api } from "../services/api"

export function WalletBalanceWidget({ className = "" }) {
  const [balance, setBalance] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchBalance = async (showRefreshToast = false) => {
    try {
      setIsRefreshing(true)
      setError(null)

      const balanceData = await api.getWalletBalance()
      setBalance(balanceData)

      if (showRefreshToast) {
        console.log("Balance refreshed successfully")
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error)
      setError(error.message || "Failed to load balance")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBalance().finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <Card className={`border-0 shadow-sm bg-green-50 ${className}`}>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    )
  }

  if (error || !balance) {
    return (
      <Card className={`border-0 shadow-sm bg-red-50 ${className}`}>
        <CardContent className="p-4 text-center">
          <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-800 mb-1">Balance Error</p>
          <p className="text-xs text-red-600 mb-2">{error || "Failed to load"}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchBalance()}
            disabled={isRefreshing}
            className="text-red-600 border-red-300 hover:bg-red-50 h-6 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-0 shadow-sm bg-green-50 hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Wallet</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchBalance(true)}
            disabled={isRefreshing}
            className="h-6 w-6 p-0 hover:bg-green-100"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""} text-green-600`} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-xl font-bold text-green-700">{balance.eth_balance}</span>
          <span className="text-sm font-semibold text-green-600">ETH</span>
        </div>

        <p className="text-xs text-muted-foreground">≈ ${balance.usd_value} USD</p>

        <div className="flex items-center justify-between pt-1 border-t border-green-200">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-muted-foreground">Pings:</span>
          </div>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300 h-5">
            <Zap className="h-3 w-3 mr-1" />
            {balance.total_pings}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
