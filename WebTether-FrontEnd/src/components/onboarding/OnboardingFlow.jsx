"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import { ReplitAgentSetup } from "./ReplitAgentSetup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { CheckCircle, Zap, Globe, ArrowRight } from "lucide-react"

export function OnboardingFlow({ onComplete }) {
  const [currentStep, setCurrentStep] = useState("welcome")
  const { user } = useAuth()

  const handleAgentSetupComplete = () => {
    setCurrentStep("success")
  }

  const handleSkipAgent = () => {
    setCurrentStep("success")
  }

  const handleFinishOnboarding = () => {
    onComplete()
  }

  return (
    <AnimatePresence mode="wait">
      {currentStep === "welcome" && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen bg-background flex items-center justify-center p-4"
        >
          <Card className="w-full max-w-2xl border-2">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl">Welcome to Web-Tether, {user?.name}! 🎉</CardTitle>
              <CardDescription className="text-lg">
                Your account has been created successfully. Let's get you set up!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4">What happens next?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-sm">You're logged in and ready to use Web-Tether</span>
                  </div>
                  {user?.isVisitor && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-600 rounded-full" />
                      <span className="text-sm">As a validator, you can earn rewards by pinging websites</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <span className="text-sm">
                      Access your dashboard to {user?.isVisitor ? "start validating" : "monitor websites"}
                    </span>
                  </div>
                </div>
              </div>

              {user?.isVisitor && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Boost Your Earnings!</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set up your Replit agent to ping websites from your location and earn more rewards.
                  </p>
                  <Button
                    onClick={() => setCurrentStep("agent-setup")}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Set Up Replit Agent
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-4">
                {user?.isVisitor && (
                  <Button variant="outline" onClick={() => setCurrentStep("agent-setup")} className="flex-1">
                    <Zap className="mr-2 h-4 w-4" />
                    Set Up Agent
                  </Button>
                )}
                <Button
                  onClick={handleFinishOnboarding}
                  className={`${user?.isVisitor ? "flex-1" : "w-full"} bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700`}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {currentStep === "agent-setup" && (
        <motion.div
          key="agent-setup"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
        >
          <ReplitAgentSetup onComplete={handleAgentSetupComplete} onSkip={handleSkipAgent} />
        </motion.div>
      )}

      {currentStep === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="min-h-screen bg-background flex items-center justify-center p-4"
        >
          <Card className="w-full max-w-2xl border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl text-green-800 dark:text-green-200">You're All Set! 🚀</CardTitle>
              <CardDescription className="text-lg text-green-700 dark:text-green-300">
                Welcome to the Web-Tether community. Start monitoring and earning rewards!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white dark:bg-green-900 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold mb-4 text-green-800 dark:text-green-200">What you can do now:</h3>
                <div className="space-y-3">
                  {user?.isVisitor ? (
                    <>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Accept ping requests and earn coins</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Monitor websites from your location</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Track your validator performance</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Add websites to monitor</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">View uptime statistics</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Get alerts when sites go down</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={handleFinishOnboarding}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
                <Globe className="mr-2 h-5 w-5" />
                Enter Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
