"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { useAuth } from "../contexts/AuthContext"
import { Wallet, TrendingUp, Eye, EyeOff, Sparkles } from "lucide-react"

export default function WalletBalance() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [pendingBalance, setPendingBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    if (user) {
      loadBalance()
    }
  }, [user])

  const loadBalance = async () => {
    try {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock balance based on user type
      const mockBalance = user?.isVisitor ? 0.0234 : 0.0156
      const mockPending = user?.isVisitor ? 0.0045 : 0.0023

      setBalance(mockBalance)
      setPendingBalance(mockPending)
    } catch (error) {
      console.error("Error loading balance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance)
  }

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-20 bg-white/10" />
            <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-32 bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 bg-white/10 rounded-full" />
              <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-0 shadow-2xl">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-pulse" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-2xl" />

      <CardContent className="p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-white/80 font-medium text-sm">Wallet Balance</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBalanceVisibility}
            className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
          >
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main Balance */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            {showBalance ? (
              <>
                <span className="text-3xl font-bold text-white">{balance.toFixed(4)}</span>
                <span className="text-lg font-semibold text-purple-200">ETH</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-white">••••••</span>
            )}
          </div>

          {showBalance && (
            <div className="flex items-center gap-1 text-sm text-purple-200">
              <TrendingUp className="h-3 w-3" />
              <span>≈ ${(balance * 2000).toFixed(2)} USD</span>
            </div>
          )}

          {/* Pending Balance & Status */}
          <div className="flex items-center gap-3 pt-2">
            {pendingBalance > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-200 font-medium">
                  {showBalance ? `${pendingBalance.toFixed(4)} ETH pending` : "••• pending"}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-200 font-medium">{user?.isVisitor ? "Validator" : "Owner"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
