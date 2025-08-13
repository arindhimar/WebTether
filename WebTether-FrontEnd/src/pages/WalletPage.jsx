"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Skeleton } from "../components/ui/skeleton"
import { ScrollArea } from "../components/ui/scroll-area"
import { Alert, AlertDescription } from "../components/ui/alert"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../hooks/use-toast"
import {
  Wallet,
  Copy,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  RefreshCw,
  Coins,
  Activity,
} from "lucide-react"

export default function WalletPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [walletData, setWalletData] = useState({
    balance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    transactions: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadWalletData()
    }
  }, [user])

  const loadWalletData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Simulate API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data based on user type
      const mockData = {
        balance: user?.isVisitor ? 0.0234 : 0.0156,
        pendingBalance: user?.isVisitor ? 0.0045 : 0.0023,
        totalEarnings: user?.isVisitor ? 0.1234 : 0.0789,
        transactions: generateMockTransactions(),
      }

      setWalletData(mockData)
    } catch (err) {
      console.error("Error loading wallet data:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load wallet data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockTransactions = () => {
    const transactions = []
    const now = new Date()

    for (let i = 0; i < 15; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000)
      transactions.push({
        id: `tx-${i}`,
        type: user?.isVisitor ? "ping_reward" : "ping_fee",
        amount: user?.isVisitor ? 0.001 : -0.0001,
        status: Math.random() > 0.1 ? "completed" : "pending",
        timestamp: date.toISOString(),
        hash: `0x${Math.random().toString(16).substr(2, 40)}`,
        description: user?.isVisitor ? "Website validation reward" : "Ping validation fee",
      })
    }

    return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard.",
    })
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const getTransactionIcon = (type, amount) => {
    if (amount > 0) {
      return <TrendingUp className="h-5 w-5 text-emerald-500" />
    } else {
      return <TrendingDown className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="status-success text-xs px-2 py-1">Completed</Badge>
      case "pending":
        return <Badge className="status-warning text-xs px-2 py-1">Pending</Badge>
      case "failed":
        return <Badge className="status-error text-xs px-2 py-1">Failed</Badge>
      default:
        return (
          <Badge variant="secondary" className="text-xs px-2 py-1">
            Unknown
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Balance Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="floating-card">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-24 loading-shimmer" />
                  <Skeleton className="h-10 w-32 loading-shimmer" />
                  <Skeleton className="h-4 w-20 loading-shimmer" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transactions */}
        <Card className="modern-card">
          <CardHeader>
            <Skeleton className="h-7 w-40 loading-shimmer" />
            <Skeleton className="h-5 w-64 loading-shimmer" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-2xl loading-shimmer" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40 loading-shimmer" />
                      <Skeleton className="h-3 w-32 loading-shimmer" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-20 loading-shimmer" />
                    <Skeleton className="h-3 w-16 loading-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {error}
          <Button onClick={loadWalletData} variant="outline" size="sm" className="ml-2 btn-secondary bg-transparent">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Wallet Dashboard</h2>
          <p className="text-muted-foreground text-lg">Manage your ETH balance and view transaction history</p>
        </div>
        <Button onClick={loadWalletData} className="btn-secondary rounded-xl px-6 h-12">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Balance
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="floating-card bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-violet-800 dark:text-violet-200 mb-2">Available Balance</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                    {walletData.balance.toFixed(4)}
                  </p>
                  <span className="text-lg font-semibold text-violet-700 dark:text-violet-300">ETH</span>
                </div>
                <p className="text-sm text-violet-600 dark:text-violet-400">
                  ≈ ${(walletData.balance * 2000).toFixed(2)} USD
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                <Wallet className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="floating-card bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">Pending Balance</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {walletData.pendingBalance.toFixed(4)}
                  </p>
                  <span className="text-lg font-semibold text-amber-700 dark:text-amber-300">ETH</span>
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Processing...</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="floating-card bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">Total Earnings</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    {walletData.totalEarnings.toFixed(4)}
                  </p>
                  <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">ETH</span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">All time earnings</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                <Coins className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="modern-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Transaction History
          </CardTitle>
          <CardDescription className="text-muted-foreground">Recent wallet transactions and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {walletData.transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950/20 dark:to-cyan-950/20 flex items-center justify-center mb-6">
                <Activity className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">No Transactions</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {user?.isVisitor
                  ? "Start validating websites to earn ETH rewards."
                  : "Add websites to start earning from validator pings."}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {walletData.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-6 rounded-2xl border border-border/50 bg-gradient-to-r from-background to-muted/20 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-muted to-muted/50">
                        {getTransactionIcon(transaction.type, transaction.amount)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground mb-1">{transaction.description}</div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{formatTimeAgo(transaction.timestamp)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(transaction.hash)}
                            className="h-auto p-0 text-xs hover:bg-transparent font-mono"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {transaction.hash.slice(0, 12)}...
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://etherscan.io/tx/${transaction.hash}`, "_blank")}
                            className="h-auto p-0 text-xs hover:bg-transparent"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-lg font-bold mb-1 ${transaction.amount > 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount.toFixed(4)} ETH
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
