"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Globe, Wifi, Users, Zap, CheckCircle, MapPin, Activity } from "lucide-react"

const ANIMATION_STAGES = [
  { id: "connecting", label: "Connecting to Network", duration: 1000, icon: Wifi },
  { id: "broadcasting", label: "Broadcasting to Validators", duration: 1200, icon: Users },
  { id: "validators", label: "Validators Responding", duration: 1500, icon: MapPin },
  { id: "pinging", label: "Pinging Website", duration: 1000, icon: Zap },
  { id: "complete", label: "Website Added Successfully!", duration: 1500, icon: CheckCircle },
]

const VALIDATOR_LOCATIONS = [
  { name: "New York", x: 25, y: 35, delay: 0 },
  { name: "London", x: 50, y: 25, delay: 200 },
  { name: "Tokyo", x: 85, y: 40, delay: 400 },
  { name: "Sydney", x: 90, y: 70, delay: 600 },
  { name: "São Paulo", x: 35, y: 75, delay: 800 },
  { name: "Mumbai", x: 75, y: 50, delay: 1000 },
  { name: "Frankfurt", x: 52, y: 28, delay: 1200 },
  { name: "Singapore", x: 82, y: 55, delay: 1400 },
]

export function WebsiteAddedAnimation({ websiteUrl, onComplete }) {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [validatorCount, setValidatorCount] = useState(0)
  const [pingCount, setPingCount] = useState(0)
  const [showValidators, setShowValidators] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [particles, setParticles] = useState([])

  console.log("🎬 WebsiteAddedAnimation mounted with URL:", websiteUrl)

  useEffect(() => {
    console.log("🎬 Starting animation sequence...")

    let stageTimer
    let progressTimer
    let validatorTimer
    let pingTimer
    let completeTimer

    const runAnimation = async () => {
      for (let i = 0; i < ANIMATION_STAGES.length; i++) {
        const stage = ANIMATION_STAGES[i]
        console.log(`🎬 Stage ${i + 1}: ${stage.label}`)

        setCurrentStage(i)
        setProgress(0)

        // Stage-specific effects
        if (stage.id === "validators") {
          setShowValidators(true)
          // Animate validator count
          validatorTimer = setInterval(() => {
            setValidatorCount((prev) => {
              const next = prev + 1
              return next > 8 ? 8 : next
            })
          }, 150)
        }

        if (stage.id === "pinging") {
          // Animate ping count
          pingTimer = setInterval(() => {
            setPingCount((prev) => prev + Math.floor(Math.random() * 3) + 1)
          }, 100)
        }

        if (stage.id === "complete") {
          setShowConfetti(true)
          // Generate particles
          const newParticles = Array.from({ length: 20 }, (_, index) => ({
            id: index,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 500,
          }))
          setParticles(newParticles)
        }

        // Animate progress bar
        const progressInterval = 50
        const progressStep = 100 / (stage.duration / progressInterval)

        progressTimer = setInterval(() => {
          setProgress((prev) => {
            const next = prev + progressStep
            return next > 100 ? 100 : next
          })
        }, progressInterval)

        // Wait for stage to complete
        await new Promise((resolve) => {
          stageTimer = setTimeout(resolve, stage.duration)
        })

        clearInterval(progressTimer)
      }

      // Complete animation
      console.log("🎬 Animation sequence complete!")
      completeTimer = setTimeout(() => {
        console.log("🎬 Calling onComplete callback")
        if (onComplete) {
          onComplete()
        }
      }, 2000)
    }

    runAnimation()

    // Cleanup function
    return () => {
      console.log("🎬 Cleaning up animation timers")
      clearTimeout(stageTimer)
      clearInterval(progressTimer)
      clearInterval(validatorTimer)
      clearInterval(pingTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  const currentStageData = ANIMATION_STAGES[currentStage]
  const CurrentIcon = currentStageData?.icon || Globe

  const cleanUrl = websiteUrl ? websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : "your website"

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-2xl w-full"
        >
          <Card className="modern-card border-2 border-violet-500/20 bg-background/95 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg"
                >
                  <Globe className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Adding Website</h2>
                <p className="text-muted-foreground font-mono text-sm">{cleanUrl}</p>
              </div>

              {/* Current Stage */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div
                    key={currentStage}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/20 dark:to-purple-950/20"
                  >
                    <CurrentIcon className="h-6 w-6 text-violet-600" />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground">{currentStageData?.label}</h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      Step {currentStage + 1} of {ANIMATION_STAGES.length}
                    </Badge>
                  </div>
                </div>

                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}% complete</p>
              </div>

              {/* World Map with Validators */}
              {showValidators && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 text-blue-600 dark:text-blue-400 rounded-xl border border-border/50"
                >
                  <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-violet-600" />
                    Global Validator Network
                  </h4>

                  <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg overflow-hidden">
                    {/* World map background pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <svg viewBox="0 0 100 60" className="w-full h-full">
                        <path
                          d="M10,30 Q20,20 30,30 T50,30 Q60,25 70,30 T90,30"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          fill="none"
                          className="text-muted-foreground"
                        />
                      </svg>
                    </div>

                    {/* Validator dots */}
                    {VALIDATOR_LOCATIONS.slice(0, validatorCount).map((location, index) => (
                      <motion.div
                        key={location.name}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: location.delay / 1000 }}
                        className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${location.x}%`, top: `${location.y}%` }}
                      >
                        <div className="w-full h-full bg-violet-500 rounded-full shadow-lg" />
                        <div className="absolute inset-0 bg-violet-500 rounded-full animate-ping opacity-75" />
                      </motion.div>
                    ))}

                    {/* Connection lines */}
                    {validatorCount > 1 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {VALIDATOR_LOCATIONS.slice(0, validatorCount - 1).map((location, index) => {
                          const nextLocation = VALIDATOR_LOCATIONS[index + 1]
                          if (!nextLocation) return null

                          return (
                            <motion.line
                              key={`line-${index}`}
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 0.3 }}
                              transition={{ delay: nextLocation.delay / 1000 + 0.2, duration: 0.5 }}
                              x1={`${location.x}%`}
                              y1={`${location.y}%`}
                              x2={`${nextLocation.x}%`}
                              y2={`${nextLocation.y}%`}
                              stroke="rgb(139 92 246)"
                              strokeWidth="1"
                              strokeDasharray="2,2"
                            />
                          )
                        })}
                      </svg>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{validatorCount} validators connected</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{pingCount} pings sent</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Success Confetti */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                  {particles.map((particle) => (
                    <motion.div
                      key={particle.id}
                      initial={{
                        x: `${particle.x}%`,
                        y: `${particle.y}%`,
                        scale: 0,
                        rotate: 0,
                      }}
                      animate={{
                        y: "120%",
                        scale: [0, 1, 0],
                        rotate: 360,
                      }}
                      transition={{
                        delay: particle.delay / 1000,
                        duration: 2,
                        ease: "easeOut",
                      }}
                      className="absolute w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    />
                  ))}
                </div>
              )}

              {/* Completion Message */}
              {currentStage === ANIMATION_STAGES.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Success!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your website is now being monitored by our global validator network.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
