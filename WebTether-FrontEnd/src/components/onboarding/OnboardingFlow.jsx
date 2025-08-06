"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { useAuth } from "../../contexts/AuthContext"
import CloudflareWorkerSetup from "./CloudflareWorkerSetup"
import { CheckCircle, Cloud, Globe, Zap } from 'lucide-react'

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to WebTether",
    description: "Get started as a validator and earn rewards",
  },
  {
    id: "cloudflare-worker",
    title: "Setup Cloudflare Worker",
    description: "Configure your personal worker for pinging websites",
  },
  {
    id: "complete",
    title: "Setup Complete",
    description: "You're ready to start validating websites!",
  },
]

export default function OnboardingFlow({ onComplete }) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  const renderStepContent = () => {
    switch (ONBOARDING_STEPS[currentStep].id) {
      case "welcome":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to WebTether, Validator!</h2>
              <p className="text-muted-foreground">
                As a validator, you'll earn rewards for monitoring websites using your own Cloudflare Worker.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Cloud className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Deploy Worker</h3>
                <p className="text-sm text-muted-foreground">Set up your Cloudflare Worker to ping websites</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">Get 5 points for every successful website ping</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Globe className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Global Impact</h3>
                <p className="text-sm text-muted-foreground">Help monitor websites from your location</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleNext} className="flex-1">
                Setup Cloudflare Worker
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                Skip Setup
              </Button>
            </div>
          </div>
        )

      case "cloudflare-worker":
        return <CloudflareWorkerSetup onComplete={handleNext} />

      case "complete":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
              <p className="text-muted-foreground">
                Your validator account is ready. Start earning rewards by pinging websites!
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Browse available websites to ping</li>
                  <li>• Earn 5 points for each successful ping</li>
                  <li>• View your validation statistics</li>
                  <li>• Configure additional settings if needed</li>
                </ul>
              </div>

              {user?.agent_url && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Your Cloudflare Worker</h3>
                  <p className="text-sm text-blue-700">
                    <code className="bg-blue-100 px-1 rounded">{user.agent_url}</code>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Ready to ping websites and earn rewards!</p>
                </div>
              )}
            </div>

            <Button onClick={onComplete} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>{ONBOARDING_STEPS[currentStep].title}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} of {ONBOARDING_STEPS.length}
                </span>
              </div>
              <CardDescription>{ONBOARDING_STEPS[currentStep].description}</CardDescription>
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
