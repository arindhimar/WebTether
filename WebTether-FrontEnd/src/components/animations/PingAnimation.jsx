"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "../ui/dialog"
import { Target, CheckCircle, Wifi, Globe, DollarSign } from "lucide-react"

export function PingAnimation({ open, onOpenChange, siteUrl }) {
  const [stage, setStage] = useState("idle")
  const [pingCount, setPingCount] = useState(0)
  const [responseTime, setResponseTime] = useState(0)

  useEffect(() => {
    if (!open) {
      setStage("idle")
      setPingCount(0)
      setResponseTime(0)
      return
    }

    setStage("connecting")

    const sequence = [
      { stage: "connecting", delay: 0, duration: 800 },
      { stage: "pinging", delay: 800, duration: 1200 },
      { stage: "success", delay: 2000, duration: 1500 },
    ]

    const timeouts = []

    sequence.forEach(({ stage: nextStage, delay }) => {
      const timeout = setTimeout(() => {
        setStage(nextStage)

        if (nextStage === "pinging") {
          let count = 0
          const pingInterval = setInterval(() => {
            count++
            setPingCount(count)
            setResponseTime(Math.floor(Math.random() * 150) + 50)
            if (count >= 3) clearInterval(pingInterval)
          }, 300)
        }
      }, delay)

      timeouts.push(timeout)
    })

    const closeTimeout = setTimeout(() => {
      onOpenChange(false)
    }, 4000)

    timeouts.push(closeTimeout)

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [open, onOpenChange])

  const getStageContent = () => {
    switch (stage) {
      case "connecting":
        return {
          title: "Connecting to Site",
          subtitle: "Establishing connection...",
          icon: Wifi,
          color: "from-blue-500 to-cyan-500",
        }
      case "pinging":
        return {
          title: "Pinging Website",
          subtitle: `Ping ${pingCount}/3 - ${responseTime}ms`,
          icon: Target,
          color: "from-blue-500 to-blue-600",
        }
      case "success":
        return {
          title: "Ping Successful!",
          subtitle: "Reward earned successfully",
          icon: CheckCircle,
          color: "from-green-500 to-emerald-500",
        }
      default:
        return {
          title: "Preparing...",
          subtitle: "",
          icon: Globe,
          color: "from-gray-500 to-gray-600",
        }
    }
  }

  const { title, subtitle, icon: Icon, color } = getStageContent()

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="w-[95vw] max-w-md mx-auto border-0 bg-transparent shadow-none p-0 [&>button]:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-2xl border border-slate-700"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 overflow-hidden">
                {stage === "pinging" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute border-2 border-blue-400/30 rounded-full"
                        initial={{ width: 0, height: 0, opacity: 1 }}
                        animate={{ width: 300, height: 300, opacity: 0 }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="relative z-10 text-center space-y-6">
                {/* Icon */}
                <motion.div
                  className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-xl`}
                  animate={{
                    scale: stage === "pinging" ? [1, 1.1, 1] : 1,
                    rotate: stage === "connecting" ? 360 : 0,
                  }}
                  transition={{
                    scale: {
                      duration: 0.6,
                      repeat: stage === "pinging" ? Number.POSITIVE_INFINITY : 0,
                    },
                    rotate: {
                      duration: 2,
                      ease: "linear",
                      repeat: stage === "connecting" ? Number.POSITIVE_INFINITY : 0,
                    },
                  }}
                >
                  <Icon className="h-8 w-8 text-white" />
                </motion.div>

                {/* Title and Subtitle */}
                <div className="space-y-2">
                  <motion.h2
                    key={title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold"
                  >
                    {title}
                  </motion.h2>
                  <motion.p
                    key={subtitle}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-300 text-sm"
                  >
                    {subtitle}
                  </motion.p>
                </div>

                {/* Site URL */}
                {siteUrl && (
                  <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <p className="text-xs font-mono text-slate-200 truncate">{siteUrl}</p>
                  </div>
                )}

                {/* Success Reward */}
                {stage === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 p-3 bg-green-500/20 rounded-lg border border-green-400/30"
                  >
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-green-300 font-semibold">+0.001 ETH</span>
                  </motion.div>
                )}

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${color} rounded-full`}
                    initial={{ width: "0%" }}
                    animate={{
                      width: stage === "connecting" ? "30%" : stage === "pinging" ? "70%" : "100%",
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default PingAnimation
