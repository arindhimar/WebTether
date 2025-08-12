"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Alert, AlertDescription } from "../components/ui/alert"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../hooks/use-toast"
import { api } from "../services/api"
import {
  Wallet,
  Link,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Loader2,
  DollarSign,
} from "lucide-react"

// Generate 20 fake transaction codes
const FAKE_TX_CODES = Array.from({ length: 20 }, (_, i) => `TX-${String(i + 1).padStart(3, "0")}`)

export default function WalletPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [linkedWallet, setLinkedWallet] = useState(null)
  const [walletBalance, setWalletBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadWalletData()
  }, [user])

  const loadWalletData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Load wallet balance and transaction history
      const [balanceResponse, transactionsResponse] = await Promise.all([
        api.getWalletBalance(),
        api.getTransactionHistory(),
      ])

      setWalletBalance(balanceResponse)
      setTransactions(transactionsResponse.transactions || [])

      // Check if user has a linked wallet (simulated)
      const savedWallet = localStorage.getItem(`wallet_${user.id}`)
      if (savedWallet) {
        try {
          setLinkedWallet(JSON.parse(savedWallet))
        } catch (parseError) {
          console.error("Error parsing saved wallet:", parseError)
          localStorage.removeItem(`wallet_${user.id}`)
        }
      }
    } catch (error) {
      console.error("Error loading wallet data:", error)
      const errorMessage = error.message || "Failed to load wallet data"
      setError(errorMessage)
      toast({
        title: "Error Loading Wallet",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkWallet = async (txCode) => {
    setIsLinking(true)
    setError(null)

    try {
      // Simulate wallet linking process with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const walletData = {
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        txCode: txCode,
        linkedAt: new Date().toISOString(),
        network: "Hardhat Local",
      }

      // Save to localStorage (in real app, this would be saved to backend)
      localStorage.setItem(`wallet_${user.id}`, JSON.stringify(walletData))
      setLinkedWallet(walletData)

      // Dispatch events for other components
      window.dispatchEvent(new CustomEvent("walletLinked", { detail: walletData }))

      toast({
        title: "Wallet Linked Successfully! 🎉",
        description: `Your wallet has been connected with transaction code ${txCode}. You can now add websites and earn rewards!`,
        action: <CheckCircle className="h-4 w-4" />,
      })

      // Refresh wallet data
      await loadWalletData()
    } catch (error) {
      const errorMessage = error.message || "Failed to link wallet"
      setError(errorMessage)
      toast({
        title: "Linking Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLinking(false)
    }
  }

  const handleUnlinkWallet = () => {
    try {
      localStorage.removeItem(`wallet_${user.id}`)
      setLinkedWallet(null)

      window.dispatchEvent(new CustomEvent("walletUnlinked"))

      toast({
        title: "Wallet Unlinked Successfully",
        description: "Your wallet has been disconnected. You can link a new one anytime.",
      })
    } catch (error) {
      toast({
        title: "Unlink Failed",
        description: "There was an issue unlinking your wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatTransactionType = (type) => {
    switch (type) {
      case "ping_payment":
        return "Ping Reward"
      case "website_payment":
      case "website_creation":
        return "Website Fee"
      default:
        return type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            Wallet Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect your wallet to seamlessly add websites and earn rewards from validation activities.
          </p>
        </div>

        {/* General Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Wallet Status Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-blue-50/30">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${linkedWallet ? "bg-green-100" : "bg-gray-100"}`}>
                  <Wallet className={`h-6 w-6 ${linkedWallet ? "text-green-600" : "text-gray-500"}`} />
                </div>
                <div>
                  <CardTitle className="text-xl">Wallet Connection Status</CardTitle>
                  <CardDescription className="text-base">
                    {linkedWallet
                      ? "Your wallet is connected and ready for transactions"
                      : "Connect a wallet to start using the platform"}
                  </CardDescription>
                </div>
              </div>
              <Badge
                className={`text-sm px-3 py-1 ${
                  linkedWallet
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {linkedWallet ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {linkedWallet ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                    <div className="font-mono text-sm bg-muted/30 p-4 rounded-lg border">{linkedWallet.address}</div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Transaction Code</label>
                    <div className="font-mono text-sm bg-muted/30 p-4 rounded-lg border">{linkedWallet.txCode}</div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Network</label>
                    <div className="text-sm bg-muted/30 p-4 rounded-lg border">{linkedWallet.network}</div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Connected At</label>
                    <div className="text-sm bg-muted/30 p-4 rounded-lg border">
                      {new Date(linkedWallet.linkedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    onClick={handleUnlinkWallet}
                    className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Disconnect Wallet
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>🎓 Educational Demo Mode:</strong> Select a transaction code below to simulate wallet
                    connection. This connects your account to our test blockchain environment for seamless payments and
                    rewards tracking.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Select Transaction Code to Connect:</label>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                      {FAKE_TX_CODES.map((code) => (
                        <Button
                          key={code}
                          variant="outline"
                          size="sm"
                          onClick={() => handleLinkWallet(code)}
                          disabled={isLinking}
                          className="font-mono text-xs h-11 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          {code}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {isLinking && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Connecting wallet...</p>
                      <p className="text-xs text-blue-600">This may take a few seconds</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Balance Card */}
        {walletBalance && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-green-50/30">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Wallet Balance & Activity</CardTitle>
                  <CardDescription className="text-base">Your current balance and transaction summary</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-6 w-6 text-green-600" />
                      <div className="text-2xl font-bold text-green-700">{walletBalance.eth_balance}</div>
                      <span className="text-lg font-semibold text-green-600">ETH</span>
                    </div>
                    <div className="text-sm text-muted-foreground">≈ ${walletBalance.usd_value} USD</div>
                    <div className="text-xs text-muted-foreground mt-1">Current Balance</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-2">{walletBalance.total_pings}</div>
                    <div className="text-sm text-muted-foreground">Total Pings</div>
                    <div className="text-xs text-blue-600 mt-1">Validation Activities</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`text-2xl font-bold mb-2 ${
                        walletBalance.total_spent >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {walletBalance.total_spent >= 0 ? "+" : ""}
                      {walletBalance.total_spent} ETH
                    </div>
                    <div className="text-sm text-muted-foreground">Net Activity</div>
                    <div className="text-xs text-purple-600 mt-1">All Transactions</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-purple-50/30">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Transaction History</CardTitle>
                <CardDescription className="text-base">Your recent transactions and activities</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((tx, index) => (
                  <Card key={index} className="hover:shadow-md transition-all duration-200 bg-background/60">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-full ${
                              tx.type === "ping_payment" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}
                          >
                            {tx.type === "ping_payment" ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingDown className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-base">{formatTransactionType(tx.type)}</div>
                            <div className="text-sm text-muted-foreground font-mono">{tx.tx_hash}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold text-lg ${
                              tx.type === "ping_payment" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {tx.type === "ping_payment" ? "+" : "-"}
                            {tx.amount} ETH
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              tx.type === "ping_payment"
                                ? "border-green-300 text-green-700"
                                : "border-red-300 text-red-700"
                            }`}
                          >
                            {tx.type === "ping_payment" ? "EARNED" : "SPENT"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Start by adding a website or pinging sites to see your transaction activity here.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Badge variant="outline" className="text-sm">
                    Add websites to earn from pings
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Validate sites to earn rewards
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
