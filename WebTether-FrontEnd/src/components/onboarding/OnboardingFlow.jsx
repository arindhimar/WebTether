"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CloudflareWorkerSetup } from "./CloudflareWorkerSetup"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { CheckCircle, Cloud, Globe, Zap, ArrowRight } from "lucide-react"

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const { user, completeOnboarding } = useAuth()

  const handleWorkerSetupComplete = () => {
    setCurrentStep(2)
  }

  const handleWorkerSetupSkip = () => {
    setCurrentStep(2)
  }

  const handleFinishOnboarding = () => {
    completeOnboarding()
  }

  if (currentStep === 1) {
    return <CloudflareWorkerSetup onComplete={handleWorkerSetupComplete} onSkip={handleWorkerSetupSkip} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-600">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to Web-Tether!</CardTitle>
            <CardDescription className="text-lg">
              You're all set up and ready to start validating websites
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Cloud className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Cloudflare Worker</h3>
                  <p className="text-sm text-muted-foreground">{user?.agent_url ? "Configured" : "Not configured"}</p>
                </div>
                {user?.agent_url && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Validator Role</h3>
                  <p className="text-sm text-muted-foreground">Ready to ping websites</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              </div>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                What's Next?
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    1
                  </Badge>
                  <span>Browse available websites in the dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    2
                  </Badge>
                  <span>Click "Ping Site" to validate websites and earn rewards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    3
                  </Badge>
                  <span>Monitor your earnings and validator statistics</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleFinishOnboarding}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
