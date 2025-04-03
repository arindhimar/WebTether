"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { Zap, Shield, Bell, Smartphone, Laptop, Server, Clock, CheckCircle, XCircle } from "lucide-react"

export default function InteractiveFeatureSection() {
  const [activeDevice, setActiveDevice] = useState("laptop")
  const [deviceStatus, setDeviceStatus] = useState({
    laptop: "online",
    smartphone: "online",
    server: "online",
  })
  const [isSimulating, setIsSimulating] = useState(false)
  const [logs, setLogs] = useState([{ time: "12:00:00", message: "All systems operational", type: "info" }])

  // Simulate a monitoring scenario
  const startSimulation = () => {
    if (isSimulating) return

    setIsSimulating(true)
    setLogs([{ time: formatTime(new Date()), message: "Starting monitoring simulation", type: "info" }])

    // Timeline of events
    setTimeout(() => {
      addLog("Checking server status...", "info")
    }, 1000)

    setTimeout(() => {
      addLog("Server response time: 120ms", "success")
    }, 2000)

    setTimeout(() => {
      addLog("Smartphone connection degraded", "warning")
      setDeviceStatus((prev) => ({ ...prev, smartphone: "degraded" }))
    }, 3500)

    setTimeout(() => {
      addLog("Alert: Smartphone connection lost!", "error")
      setDeviceStatus((prev) => ({ ...prev, smartphone: "offline" }))
    }, 5000)

    setTimeout(() => {
      addLog("Sending notification to admin", "info")
    }, 6000)

    setTimeout(() => {
      addLog("Attempting to reconnect smartphone...", "info")
    }, 7500)

    setTimeout(() => {
      addLog("Smartphone connection restored", "success")
      setDeviceStatus((prev) => ({ ...prev, smartphone: "online" }))
    }, 9000)

    setTimeout(() => {
      addLog("Monitoring report generated", "info")
      setIsSimulating(false)
    }, 10500)
  }

  const formatTime = (date) => {
    return date.toTimeString().split(" ")[0]
  }

  const addLog = (message, type) => {
    const time = formatTime(new Date())
    setLogs((prev) => [...prev, { time, message, type }])
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "text-green-500"
      case "degraded":
        return "text-yellow-500"
      case "offline":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "degraded":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getLogIcon = (type) => {
    switch (type) {
      case "info":
        return <Bell className="h-4 w-4 text-primary" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
  }

  return (
    <div className="container px-4 md:px-6 py-12 md:py-24">
      <div className="text-center mb-12">
        <motion.h2
          className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          See WebTether in Action
        </motion.h2>
        <motion.p
          className="mt-4 text-muted-foreground md:text-xl max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Experience real-time monitoring with our interactive demo
        </motion.p>
      </div>

      <motion.div
        className="grid md:grid-cols-5 gap-8 bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Device Selection */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-bold text-lg mb-4">Monitored Devices</h3>

          <div
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${activeDevice === "laptop" ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}`}
            onClick={() => setActiveDevice("laptop")}
          >
            <Laptop className={`h-5 w-5 ${activeDevice === "laptop" ? "text-primary" : "text-muted-foreground"}`} />
            <div className="flex-1">
              <div className="font-medium">Laptop</div>
              <div className="text-xs flex items-center gap-1">
                {getStatusIcon(deviceStatus.laptop)}
                <span className={getStatusColor(deviceStatus.laptop)}>
                  {deviceStatus.laptop.charAt(0).toUpperCase() + deviceStatus.laptop.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${activeDevice === "smartphone" ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}`}
            onClick={() => setActiveDevice("smartphone")}
          >
            <Smartphone
              className={`h-5 w-5 ${activeDevice === "smartphone" ? "text-primary" : "text-muted-foreground"}`}
            />
            <div className="flex-1">
              <div className="font-medium">Smartphone</div>
              <div className="text-xs flex items-center gap-1">
                {getStatusIcon(deviceStatus.smartphone)}
                <span className={getStatusColor(deviceStatus.smartphone)}>
                  {deviceStatus.smartphone.charAt(0).toUpperCase() + deviceStatus.smartphone.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${activeDevice === "server" ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}`}
            onClick={() => setActiveDevice("server")}
          >
            <Server className={`h-5 w-5 ${activeDevice === "server" ? "text-primary" : "text-muted-foreground"}`} />
            <div className="flex-1">
              <div className="font-medium">Server</div>
              <div className="text-xs flex items-center gap-1">
                {getStatusIcon(deviceStatus.server)}
                <span className={getStatusColor(deviceStatus.server)}>
                  {deviceStatus.server.charAt(0).toUpperCase() + deviceStatus.server.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="gradient" className="w-full" onClick={startSimulation} disabled={isSimulating}>
              <Zap className="mr-2 h-4 w-4" />
              {isSimulating ? "Simulating..." : "Run Simulation"}
            </Button>
          </div>
        </div>

        {/* Device Visualization */}
        <div className="md:col-span-2 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDevice}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {activeDevice === "laptop" && (
                <div className="relative w-[300px] h-[200px] bg-background rounded-lg border-2 border-muted p-2 shadow-xl">
                  <div className="absolute top-0 left-0 right-0 h-6 bg-muted rounded-t-md flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mx-1"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mx-1"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500 mx-1"></div>
                  </div>
                  <div className="mt-6 h-[calc(100%-1.5rem)] bg-muted/30 rounded-md flex items-center justify-center">
                    <div className={`text-2xl font-bold ${getStatusColor(deviceStatus.laptop)}`}>
                      {deviceStatus.laptop === "online"
                        ? "CONNECTED"
                        : deviceStatus.laptop === "degraded"
                          ? "DEGRADED"
                          : "DISCONNECTED"}
                    </div>
                  </div>
                  <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-[100px] h-[10px] bg-muted rounded-b-lg"></div>

                  <div
                    className={`absolute top-2 right-2 h-2 w-2 rounded-full ${deviceStatus.laptop === "online" ? "bg-green-500" : deviceStatus.laptop === "degraded" ? "bg-yellow-500" : "bg-red-500"} animate-pulse`}
                  ></div>
                </div>
              )}

              {activeDevice === "smartphone" && (
                <div className="relative w-[100px] h-[180px] bg-background rounded-2xl border-2 border-muted p-2 shadow-xl">
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-muted rounded-full"></div>
                  <div className="mt-6 h-[calc(100%-1.5rem)] bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className={`text-xs font-bold ${getStatusColor(deviceStatus.smartphone)}`}>
                      {deviceStatus.smartphone === "online"
                        ? "CONNECTED"
                        : deviceStatus.smartphone === "degraded"
                          ? "DEGRADED"
                          : "DISCONNECTED"}
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-muted rounded-full"></div>

                  <div
                    className={`absolute top-2 right-2 h-2 w-2 rounded-full ${deviceStatus.smartphone === "online" ? "bg-green-500" : deviceStatus.smartphone === "degraded" ? "bg-yellow-500" : "bg-red-500"} animate-pulse`}
                  ></div>
                </div>
              )}

              {activeDevice === "server" && (
                <div className="relative w-[160px] h-[220px] bg-background rounded-md border-2 border-muted p-2 shadow-xl">
                  <div className="grid grid-rows-6 gap-2 h-full">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-muted/30 rounded-sm flex items-center justify-center">
                        <div className={`h-1 w-8 ${i === 2 ? getStatusColor(deviceStatus.server) : "bg-muted"}`}></div>
                        <div
                          className={`ml-2 h-2 w-2 rounded-full ${i === 2 ? (deviceStatus.server === "online" ? "bg-green-500" : deviceStatus.server === "degraded" ? "bg-yellow-500" : "bg-red-500") : "bg-muted"} ${i === 2 ? "animate-pulse" : ""}`}
                        ></div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`absolute top-2 right-2 h-2 w-2 rounded-full ${deviceStatus.server === "online" ? "bg-green-500" : deviceStatus.server === "degraded" ? "bg-yellow-500" : "bg-red-500"} animate-pulse`}
                  ></div>
                </div>
              )}

              {/* Connection Lines */}
              <svg
                className="absolute top-1/2 left-1/2 -z-10 transform -translate-x-1/2 -translate-y-1/2"
                width="400"
                height="300"
                viewBox="0 0 400 300"
              >
                <path
                  d="M200,150 C250,100 300,120 350,150"
                  stroke={
                    deviceStatus.laptop === "online"
                      ? "#22c55e"
                      : deviceStatus.laptop === "degraded"
                        ? "#eab308"
                        : "#ef4444"
                  }
                  strokeWidth="2"
                  strokeDasharray={deviceStatus.laptop === "degraded" ? "5,5" : "none"}
                  fill="none"
                />
                <path
                  d="M200,150 C150,200 100,180 50,150"
                  stroke={
                    deviceStatus.smartphone === "online"
                      ? "#22c55e"
                      : deviceStatus.smartphone === "degraded"
                        ? "#eab308"
                        : "#ef4444"
                  }
                  strokeWidth="2"
                  strokeDasharray={deviceStatus.smartphone === "degraded" ? "5,5" : "none"}
                  fill="none"
                />
                <path
                  d="M200,150 C200,200 200,250 200,300"
                  stroke={
                    deviceStatus.server === "online"
                      ? "#22c55e"
                      : deviceStatus.server === "degraded"
                        ? "#eab308"
                        : "#ef4444"
                  }
                  strokeWidth="2"
                  strokeDasharray={deviceStatus.server === "degraded" ? "5,5" : "none"}
                  fill="none"
                />
                <circle cx="200" cy="150" r="10" fill="#3b82f6" />
                <text x="220" y="155" fontSize="12" fill="currentColor">
                  WebTether
                </text>
              </svg>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Monitoring Logs */}
        <div className="md:col-span-2 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Monitoring Logs</h3>

          <div className="flex-1 bg-background border rounded-lg p-2 overflow-y-auto h-[300px]">
            <div className="space-y-2">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                    log.type === "error"
                      ? "bg-red-500/10"
                      : log.type === "warning"
                        ? "bg-yellow-500/10"
                        : log.type === "success"
                          ? "bg-green-500/10"
                          : "bg-muted/30"
                  }`}
                >
                  {getLogIcon(log.type)}
                  <div className="flex-1">
                    <div className="font-medium">{log.message}</div>
                    <div className="text-xs text-muted-foreground">{log.time}</div>
                  </div>
                </motion.div>
              ))}
              {isSimulating && (
                <div className="flex justify-center p-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-muted/30 p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Uptime</div>
              <div className="text-lg font-bold text-green-500">99.8%</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Latency</div>
              <div className="text-lg font-bold text-primary">124ms</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">Alerts</div>
              <div className="text-lg font-bold text-yellow-500">1</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 text-center">
        <Button variant="gradient" size="lg" className="animate-in-button shadow-glow">
          <Shield className="mr-2 h-5 w-5" />
          Start Monitoring Your Websites
        </Button>
      </div>
    </div>
  )
}

