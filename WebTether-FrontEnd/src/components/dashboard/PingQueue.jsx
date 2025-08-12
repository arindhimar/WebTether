"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { ScrollArea } from "../ui/scroll-area"
import { Play, Pause, Square, RotateCcw, Clock, Zap, CheckCircle, XCircle, Activity } from "lucide-react"

const mockWebsites = [
  "https://google.com",
  "https://github.com",
  "https://stackoverflow.com",
  "https://reddit.com",
  "https://youtube.com",
  "https://twitter.com",
  "https://facebook.com",
  "https://linkedin.com",
]

export function PingQueue() {
  const [queue, setQueue] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState([])
  const intervalRef = useRef(null)

  // Initialize queue
  useEffect(() => {
    if (queue.length === 0) {
      initializeQueue()
    }
  }, [])

  // Auto-ping when running
  useEffect(() => {
    if (isRunning && currentIndex < queue.length) {
      intervalRef.current = setTimeout(() => {
        executePing(currentIndex)
      }, 2000) // 2 second intervals
    } else if (currentIndex >= queue.length) {
      setIsRunning(false)
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isRunning, currentIndex, queue.length])

  const initializeQueue = () => {
    const queueItems = mockWebsites.map((url, index) => ({
      id: index,
      url,
      status: "pending",
      responseTime: null,
      earnings: 0,
      txHash: null,
    }))
    setQueue(queueItems)
    setCurrentIndex(0)
    setResults([])
  }

  const executePing = async (index) => {
    if (index >= queue.length) return

    // Update current item to "pinging"
    setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, status: "pinging" } : item)))

    // Simulate ping delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate result
    const success = Math.random() > 0.1 // 90% success rate
    const responseTime = Math.floor(Math.random() * 500) + 50
    const earnings = success ? 0.0001 : 0
    const txHash = `PING-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 3).toUpperCase()}`

    const result = {
      id: index,
      url: queue[index].url,
      success,
      responseTime,
      earnings,
      txHash,
      timestamp: new Date().toISOString(),
    }

    // Update queue item
    setQueue((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              status: success ? "success" : "failed",
              responseTime,
              earnings,
              txHash,
            }
          : item,
      ),
    )

    // Add to results
    setResults((prev) => [...prev, result])

    // Save to ping history
    const pingHistory = JSON.parse(localStorage.getItem("pingHistory") || "[]")
    pingHistory.unshift(result)
    localStorage.setItem("pingHistory", JSON.stringify(pingHistory.slice(0, 100)))

    // Move to next
    setCurrentIndex((prev) => prev + 1)
  }

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    setCurrentIndex(0)
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
    }
    // Reset all pending items
    setQueue((prev) => prev.map((item) => (item.status === "pinging" ? { ...item, status: "pending" } : item)))
  }

  const handleReset = () => {
    handleStop()
    initializeQueue()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-500" />
      case "pinging":
        return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "pinging":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">Pinging</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">Success</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const progress = queue.length > 0 ? (currentIndex / queue.length) * 100 : 0
  const totalEarnings = results.reduce((sum, result) => sum + result.earnings, 0)
  const successCount = results.filter((r) => r.success).length

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Ping Queue
            </CardTitle>
            <CardDescription className="text-muted-foreground">Automated website pinging queue</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isRunning ? handlePause : handleStart}
              disabled={currentIndex >= queue.length}
              className="bg-transparent border-border text-foreground hover:bg-accent"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              disabled={!isRunning && currentIndex === 0}
              className="bg-transparent border-border text-foreground hover:bg-accent"
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="bg-transparent border-border text-foreground hover:bg-accent"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-card-foreground font-medium">
              {currentIndex} / {queue.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-card-foreground">{totalEarnings.toFixed(4)}</div>
            <div className="text-xs text-muted-foreground">ETH Earned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-card-foreground">{successCount}</div>
            <div className="text-xs text-muted-foreground">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-card-foreground">{results.length - successCount}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>

        {/* Queue List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {queue.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  index === currentIndex && isRunning
                    ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                    : "bg-background border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">{getStatusIcon(item.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-card-foreground truncate">{item.url}</div>
                    {item.responseTime && (
                      <div className="text-sm text-muted-foreground">Response: {item.responseTime}ms</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(item.status)}
                  <div className="text-right">
                    <div className="text-sm font-medium text-card-foreground">
                      {item.earnings > 0 ? `+${item.earnings.toFixed(4)} ETH` : "0 ETH"}
                    </div>
                    {item.txHash && <div className="text-xs text-muted-foreground font-mono">{item.txHash}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
