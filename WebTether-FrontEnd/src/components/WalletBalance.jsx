"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Alert, AlertDescription } from "./ui/alert"
import { Skeleton } from "./ui/skeleton"
import {
  Wallet,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  History,
  Coins,
  AlertCircle,
  CheckCircle,
  DollarSign,
} from "lucide-react"
import { api } from "../services/api"

export function WalletBalance() {
  const [balance, setBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [error, setError] = useState(null)

  const fetchWalletData = async (showRefreshToast = false) => {
    try {
      setIsRefreshing(true)
      setError(null)

      const [balanceData, transactionData] = await Promise.all([api.getWalletBalance(), api.getTransactionHistory()])

      setBalance(balanceData)
      setTransactions(transactionData.transactions || [])

      if (showRefreshToast) {
        console.log("Wallet data refreshed successfully")
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error)
      setError(error.message || "Failed to load wallet data")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWalletData().finally(() => setIsLoading(false))
  }, [])

  // Calculate earnings vs spending for new economic model
  const calculateEarningsVsSpending = () => {
    if (!transactions.length) return { totalEarnings: 0, totalSpending: 0, netEarnings: 0 }

    let totalEarnings = 0
    let totalSpending = 0

    transactions.forEach((tx) => {
      const amount = Number.parseFloat(tx.amount || 0)
      if (tx.type === "ping_payment") {
        totalEarnings += amount // Pings now earn money
      } else if (tx.type === "website_creation") {
        totalSpending += amount // Website creation costs money
      }
    })

    return {
      totalEarnings,
      totalSpending,
      netEarnings: totalEarnings - totalSpending,
    }
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-green-50/20">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !balance) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-red-50/20">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-semibold mb-2">Failed to Load Wallet</h3>
          <p className="text-sm text-muted-foreground mb-4">{error || "Unable to fetch wallet data"}</p>
          <Button size="sm" variant="outline" onClick={() => fetchWalletData()} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { totalEarnings, totalSpending, netEarnings } = calculateEarningsVsSpending()

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-green-50/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Earnings Wallet</CardTitle>
                <CardDescription>Earn rewards by validating websites</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchWalletData(true)} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* New Economic Model Notice */}
          <Alert className="bg-green-50 border-green-200">
            <Coins className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>💰 New Economic Model:</strong> Pay to add websites • Earn rewards for pinging • Help secure the
              network!
            </AlertDescription>
          </Alert>

          {/* Balance Display */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <div className="text-3xl font-bold text-green-700">{balance.eth_balance}</div>
                  <span className="text-lg font-semibold text-green-600">ETH</span>
                </div>
                <div className="text-sm text-muted-foreground">≈ ${balance.usd_value} USD</div>
              </CardContent>
            </Card>

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Wallet Address</label>
              <div className="font-mono text-xs bg-muted/30 p-3 rounded-lg border break-all">
                {balance.wallet_address}
              </div>
            </div>

            {/* Updated Stats Grid - Earnings vs Spending */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-green-50 border-green-200 hover:shadow-sm transition-shadow">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-2">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs font-medium">Total Earned</span>
                  </div>
                  <div className="font-bold text-sm text-green-800">+{totalEarnings.toFixed(6)} ETH</div>
                  <div className="text-xs text-green-600">From {balance.total_pings} pings</div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200 hover:shadow-sm transition-shadow">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600 mb-2">
                    <TrendingDown className="h-3 w-3" />
                    <span className="text-xs font-medium">Total Spent</span>
                  </div>
                  <div className="font-bold text-sm text-red-800">-{totalSpending.toFixed(6)} ETH</div>
                  <div className="text-xs text-red-600">Website creation</div>
                </CardContent>
              </Card>
            </div>

            {/* Net Earnings Display */}
            <Card
              className={`transition-all ${netEarnings >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`flex items-center justify-center gap-2 mb-2 ${netEarnings >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {netEarnings >= 0 ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span className="text-sm font-medium">Net Earnings</span>
                </div>
                <div className={`font-bold text-lg ${netEarnings >= 0 ? "text-green-800" : "text-red-800"}`}>
                  {netEarnings >= 0 ? "+" : ""}
                  {netEarnings.toFixed(6)} ETH
                </div>
                <div className={`text-xs mb-2 ${netEarnings >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {netEarnings >= 0 ? "You're profitable! 🎉" : "Keep pinging to earn more! 💪"}
                </div>
                <Progress
                  value={Math.min(Math.abs(netEarnings / 0.01) * 100, 100)}
                  className={`h-2 ${netEarnings >= 0 ? "bg-green-100" : "bg-red-100"}`}
                />
              </CardContent>
            </Card>

            {/* Transaction History Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransactions(!showTransactions)}
              className="w-full"
            >
              <History className="h-4 w-4 mr-2" />
              {showTransactions ? "Hide" : "Show"} Transaction History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {showTransactions && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-blue-50/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>Your earnings and spending activity</CardDescription>
          </CardHeader>

          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-sm text-muted-foreground mb-1">Start pinging websites to earn your first rewards!</p>
                <p className="text-xs text-muted-foreground">Each successful ping earns you ETH</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((tx, index) => {
                  const isEarning = tx.type === "ping_payment"
                  return (
                    <Card key={index} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs font-mono">
                                {tx.tx_hash}
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  isEarning
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-red-100 text-red-800 hover:bg-red-100"
                                }`}
                              >
                                {isEarning ? "EARNED" : "SPENT"}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-mono text-sm font-medium ${
                                isEarning ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isEarning ? "+" : "-"}
                              {tx.amount} ETH
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isEarning ? "Ping reward" : "Website creation"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
