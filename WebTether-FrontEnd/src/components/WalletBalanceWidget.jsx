"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import { useAuth } from "../contexts/AuthContext"
import { Wallet, Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"

export default function WalletBalanceWidget() {
  const { user } = useAuth()
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    total: 0,
  })
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

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockBalance = {
        available: user?.isVisitor ? 0.0234 : 0.0156,
        pending: user?.isVisitor ? 0.0045 : 0.0023,
        total: user?.isVisitor ? 0.0279 : 0.0179,
      }

      setBalance(mockBalance)
    } catch (error) {
      console.error("Error loading balance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="floating-card bg-gradient-to-br from-slate-900 to-blue-900 border-slate-700">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 bg-slate-700" />
            <Skeleton className="h-6 w-20 bg-slate-700" />
            <Skeleton className="h-2 w-12 bg-slate-700" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="floating-card bg-gradient-to-br from-slate-900 to-blue-900 border-slate-700 shadow-xl">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3 w-3 text-slate-300" />
            <span className="text-xs font-medium text-slate-300">Balance</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="h-5 w-5 p-0 text-slate-400 hover:text-slate-200"
          >
            {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold text-white">
              {showBalance ? balance.available.toFixed(4) : "••••"}
            </span>
            <span className="text-xs font-semibold text-slate-300">ETH</span>
          </div>

          <div className="text-xs text-slate-400">
            ≈ ${showBalance ? (balance.available * 2000).toFixed(2) : "••••"}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-xs px-1.5 py-0.5">
              Owner
            </Badge>
            {balance.pending > 0 && (
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs px-1.5 py-0.5">
                {showBalance ? balance.pending.toFixed(3) : "•••"} pending
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
