"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Zap, Settings, RefreshCw, Copy, Check, Coins } from "lucide-react"
import { useToast } from "../hooks/use-toast"

const generateTransactionCode = () => {
  const prefix = "PING"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function SimulatedPingButton({ website, onPingComplete }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [availableTxCodes, setAvailableTxCodes] = useState([])
  const [selectedTxCode, setSelectedTxCode] = useState("")
  const [copiedCode, setCopiedCode] = useState("")
  const { toast } = useToast()

  // Load transaction codes
  useEffect(() => {
    const savedCodes = JSON.parse(localStorage.getItem("transactionCodes") || "[]")
    setAvailableTxCodes(savedCodes)
    if (savedCodes.length > 0) {
      setSelectedTxCode(savedCodes[0])
    }
  }, [])

  const handleQuickPing = async () => {
    setIsLoading(true)

    try {
      // Generate a new transaction code for this ping
      const txCode = generateTransactionCode()

      // Simulate ping delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate ping result
      const success = Math.random() > 0.1 // 90% success rate
      const responseTime = Math.floor(Math.random() * 500) + 50 // 50-550ms
      const earnings = success ? 0.0001 : 0 // Small reward for successful ping

      const result = {
        success,
        responseTime,
        timestamp: new Date().toISOString(),
        txHash: txCode,
        earnings,
        website: website?.url || "Unknown",
      }

      // Save to local storage for history
      const pingHistory = JSON.parse(localStorage.getItem("pingHistory") || "[]")
      pingHistory.unshift(result)
      localStorage.setItem("pingHistory", JSON.stringify(pingHistory.slice(0, 100))) // Keep last 100

      toast({
        title: success ? "Ping Successful! ⚡" : "Ping Failed ❌",
        description: success
          ? `Response: ${responseTime}ms • Earned: ${earnings} ETH`
          : `Failed to reach ${website?.url || "website"}`,
        variant: success ? "default" : "destructive",
      })

      if (onPingComplete) {
        onPingComplete(result)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute ping",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdvancedPing = async () => {
    if (!selectedTxCode) {
      toast({
        title: "Error",
        description: "Please select a transaction code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate ping with selected transaction code
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const success = Math.random() > 0.1
      const responseTime = Math.floor(Math.random() * 500) + 50
      const earnings = success ? 0.0001 : 0

      const result = {
        success,
        responseTime,
        timestamp: new Date().toISOString(),
        txHash: selectedTxCode,
        earnings,
        website: website?.url || "Unknown",
      }

      // Save to history
      const pingHistory = JSON.parse(localStorage.getItem("pingHistory") || "[]")
      pingHistory.unshift(result)
      localStorage.setItem("pingHistory", JSON.stringify(pingHistory.slice(0, 100)))

      toast({
        title: success ? "Advanced Ping Successful! ⚡" : "Ping Failed ❌",
        description: success
          ? `Response: ${responseTime}ms • TX: ${selectedTxCode} • Earned: ${earnings} ETH`
          : `Failed with TX: ${selectedTxCode}`,
        variant: success ? "default" : "destructive",
      })

      if (onPingComplete) {
        onPingComplete(result)
      }

      setShowAdvanced(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute advanced ping",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateNewCode = () => {
    const newCode = generateTransactionCode()
    const updatedCodes = [...availableTxCodes, newCode]
    setAvailableTxCodes(updatedCodes)
    localStorage.setItem("transactionCodes", JSON.stringify(updatedCodes))
    setSelectedTxCode(newCode)
    toast({
      title: "Generated",
      description: "New transaction code created!",
    })
  }

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast({
        title: "Copied",
        description: "Transaction code copied!",
      })
      setTimeout(() => setCopiedCode(""), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Quick Ping Button */}
      <Button
        onClick={handleQuickPing}
        disabled={isLoading}
        size="sm"
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
      >
        {isLoading ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
        {isLoading ? "Pinging..." : "Quick Ping"}
      </Button>

      {/* Advanced Ping Dialog */}
      <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="bg-transparent border-border text-foreground hover:bg-accent">
            <Settings className="w-3 h-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-card-foreground">
              <Zap className="w-5 h-5 text-green-600" />
              Advanced Ping
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a specific transaction code for this ping
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Website Info */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-card-foreground">Target Website</div>
              <div className="text-sm text-muted-foreground font-mono">{website?.url || "No website selected"}</div>
            </div>

            {/* Transaction Code Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-card-foreground">Transaction Code</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateNewCode}
                  className="text-xs bg-transparent"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Generate New
                </Button>
              </div>

              {availableTxCodes.length > 0 ? (
                <Select value={selectedTxCode} onValueChange={setSelectedTxCode}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Select transaction code" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {availableTxCodes.map((code) => (
                      <SelectItem key={code} value={code} className="text-popover-foreground">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-sm">{code}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyCode(code)
                            }}
                            className="ml-2 h-6 w-6 p-0"
                          >
                            {copiedCode === code ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-2">No transaction codes available</div>
                  <Button onClick={handleGenerateNewCode} size="sm" variant="outline">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Generate First Code
                  </Button>
                </div>
              )}
            </div>

            {/* Estimated Earnings */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-600" />
                <div className="text-sm">
                  <span className="font-medium text-blue-800 dark:text-blue-200">Estimated Earnings: </span>
                  <span className="font-mono text-blue-600">0.0001 ETH</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAdvanced(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleAdvancedPing}
                disabled={isLoading || !selectedTxCode}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Pinging...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Execute Ping
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
