"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { CheckCircle, XCircle, RefreshCw, Wifi, ArrowRight } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import { LiveChart } from "../interactive/LiveChart"

export function InteractiveDemoSection() {
  const [url, setUrl] = useState("")
  const [pingResult, setPingResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePing = async (e) => {
    e.preventDefault()
    if (!url) {
      toast({
        title: "URL Missing",
        description: "Please enter a URL to ping.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setPingResult(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const success = Math.random() > 0.2 // 80% chance of success
    const latency = Math.floor(Math.random() * 200) + 50 // 50-250ms

    if (success) {
      setPingResult({ status: "up", latency: latency, region: "US-East" })
      toast({
        title: "Ping Successful",
        description: `Website is up! Latency: ${latency}ms from US-East`,
      })
    } else {
      setPingResult({ status: "down", latency: null, region: "US-East" })
      toast({
        title: "Ping Failed",
        description: "Website is currently unreachable or down.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="space-y-2" variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Try Web-Tether Now
              </span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Test our monitoring system with any website URL and see real-time results
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 pt-8 w-full max-w-6xl">
            {/* Interactive Ping Tool */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-blue-600/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Wifi className="h-6 w-6 text-blue-600" />
                    Instant Website Check
                  </CardTitle>
                  <CardDescription>Enter a URL to see how our validator network monitors it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handlePing} className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Ping <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {pingResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center gap-3 p-4 rounded-md border-2 ${
                        pingResult.status === "up"
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                      }`}
                    >
                      {pingResult.status === "up" ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {pingResult.status === "up" ? "Website is Online!" : "Website is Offline!"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {pingResult.latency && <span>Latency: {pingResult.latency}ms</span>}
                          <span>Region: {pingResult.region}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Live Chart */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-blue-600/20">
                <CardHeader>
                  <CardTitle>Real-time Monitoring</CardTitle>
                  <CardDescription>Live uptime data from our validator network</CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveChart />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
