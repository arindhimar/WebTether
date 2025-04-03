"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Coins, RefreshCw, Shield, UserPlus } from "lucide-react"
import { Button } from "../../components/ui/button"
import { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Progress } from "../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useToast } from "../../components/ui/use-toast"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { validatorAPI, websiteAPI } from "../../services/api"
import { useBackendAuthContext } from "../../context/backend-auth-context"
import { AnimatedCard } from "../../components/ui/animated-card"
import { motion } from "framer-motion"

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

export default function ValidatorsPage() {
  const [isValidator, setIsValidator] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [websitesToValidate, setWebsitesToValidate] = useState([])
  const [validatorStats, setValidatorStats] = useState({
    totalPings: 0,
    successfulPings: 0,
    totalRewards: 0,
    level: 1,
    progress: 30,
  })
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  })
  const { toast } = useToast()
  const { backendUser } = useBackendAuthContext()

  // Fetch validators and websites data
  useEffect(() => {
    const fetchData = async () => {
      if (!backendUser) return

      try {
        setIsLoading(true)

        // Check if user is already a validator
        const validatorsResponse = await validatorAPI.getAllValidators()

        if (validatorsResponse.data && validatorsResponse.data.length > 0) {
          setIsValidator(true)

          // Get validator stats
          try {
            const statsResponse = await validatorAPI.getValidatorStats()
            if (statsResponse.data) {
              // Update stats with dynamic data
              setValidatorStats((prev) => ({
                ...prev,
                totalPings: statsResponse.data.totalValidators * 10 || 42, // Simulated total pings
                successfulPings: Math.floor(statsResponse.data.activeValidators * 10 * 0.9) || 38, // 90% success rate
                totalRewards: statsResponse.data.totalValidators * 50 || 215, // 50 coins per validator
              }))
            }
          } catch (error) {
            console.error("Error fetching validator stats:", error)
          }
        }

        // Get websites to validate
        const websitesResponse = await websiteAPI.getAllWebsites()
        if (websitesResponse.data && Array.isArray(websitesResponse.data)) {
          setWebsitesToValidate(
            websitesResponse.data.map((website) => ({
              id: website.id,
              url: website.url,
              lastValidated: website.last_checked ? new Date(website.last_checked).toLocaleTimeString() : "Never",
              reward: Math.floor(Math.random() * 10) + 5, // Random reward between 5-15
            })),
          )
        }
      } catch (error) {
        console.error("Error initializing validators page:", error)
        toast({
          title: "Error",
          description: "Failed to load validator data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [backendUser, toast])

  const registerAsValidator = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.location) {
        toast({
          title: "Missing Information",
          description: "Please provide both a name and location for your validator.",
          variant: "destructive",
        })
        return
      }

      // Create validator in backend
      const response = await validatorAPI.createValidator({
        name: formData.name,
        location: formData.location,
        // IP is auto-generated on the backend
      })

      if (response.data && response.data.validator) {
        setIsValidator(true)
        setIsRegistering(false)

        toast({
          title: "Registration Successful",
          description: "You are now registered as a validator. Start pinging websites to earn rewards!",
        })
      }
    } catch (error) {
      console.error("Error registering as validator:", error)
      toast({
        title: "Registration Failed",
        description: "Unable to register you as a validator. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const pingWebsite = async (websiteId) => {
    // In a real implementation, this would call an API to validate the website
    // Here we simulate the process
    try {
      // Simulate pinging a website
      const randomStatus = Math.random() > 0.2 ? "up" : Math.random() > 0.5 ? "down" : "timeout"
      const reward = websitesToValidate.find((w) => w.id === websiteId).reward

      // Update validator stats
      setValidatorStats({
        ...validatorStats,
        totalPings: validatorStats.totalPings + 1,
        successfulPings: randomStatus === "up" ? validatorStats.successfulPings + 1 : validatorStats.successfulPings,
        totalRewards: randomStatus === "up" ? validatorStats.totalRewards + reward : validatorStats.totalRewards,
        progress: (validatorStats.progress + 5) % 100,
      })

      // Update website last validated time
      setWebsitesToValidate(
        websitesToValidate.map((website) =>
          website.id === websiteId ? { ...website, lastValidated: "just now" } : website,
        ),
      )

      // Show toast notification
      toast({
        title: `Website ${randomStatus === "up" ? "is up" : randomStatus === "down" ? "is down" : "timed out"}`,
        description:
          randomStatus === "up"
            ? `You earned ${reward} coins for validating this website!`
            : "No rewards earned for this validation.",
        variant: randomStatus === "up" ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error pinging website:", error)
      toast({
        title: "Ping Failed",
        description: "Unable to ping the website. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-lg font-medium">Loading validator data...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Validators</h2>
        {!isValidator && (
          <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Become a Validator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Become a Validator</DialogTitle>
                <DialogDescription>
                  As a validator, you can ping websites to verify their status and earn rewards.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Validator Benefits:</h3>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Earn coins for each successful validation</li>
                    <li>Level up as you validate more websites</li>
                    <li>Gain access to premium features</li>
                    <li>Help maintain the integrity of the platform</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Validator Responsibilities:</h3>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Honestly report website status</li>
                    <li>Regularly validate websites</li>
                    <li>Maintain a high accuracy rate</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validator-name">Validator Name</Label>
                  <Input
                    id="validator-name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a name for your validator"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validator-location">Location</Label>
                  <Input
                    id="validator-location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., New York, USA"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRegistering(false)}>
                  Cancel
                </Button>
                <Button onClick={registerAsValidator}>Register as Validator</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {!isValidator ? (
        <motion.div variants={itemVariants}>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Not a Validator</AlertTitle>
            <AlertDescription>
              You are not registered as a validator. Register to start validating websites and earning rewards.
            </AlertDescription>
          </Alert>
        </motion.div>
      ) : (
        <>
          <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <AnimatedCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pings</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold gradient-text">{validatorStats.totalPings}</div>
                  <p className="text-xs text-muted-foreground">{validatorStats.successfulPings} successful</p>
                </CardContent>
              </AnimatedCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <AnimatedCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold gradient-text">
                    {validatorStats.totalPings > 0
                      ? Math.round((validatorStats.successfulPings / validatorStats.totalPings) * 100)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Overall success rate</p>
                </CardContent>
              </AnimatedCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <AnimatedCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold gradient-text">{validatorStats.totalRewards} coins</div>
                  <p className="text-xs text-muted-foreground">Earned from validations</p>
                </CardContent>
              </AnimatedCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <AnimatedCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Validator Level</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold gradient-text">Level {validatorStats.level}</div>
                  <div className="mt-2">
                    <Progress value={validatorStats.progress} className="h-2" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {validatorStats.progress}% to Level {validatorStats.level + 1}
                  </p>
                </CardContent>
              </AnimatedCard>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="available">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="available">Available to Validate</TabsTrigger>
                  <TabsTrigger value="recent">Recently Validated</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm" className="animate-in-button group">
                  <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin-slow" />
                  Refresh List
                </Button>
              </div>

              <TabsContent value="available" className="mt-6">
                <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={containerVariants}>
                  {websitesToValidate.map((website, index) => (
                    <motion.div key={website.id} variants={itemVariants}>
                      <AnimatedCard>
                        <CardHeader>
                          <CardTitle className="line-clamp-1 gradient-text">{website.url}</CardTitle>
                          <CardDescription>Last validated: {website.lastValidated}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              {website.reward} coins
                            </Badge>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full animate-in-button" onClick={() => pingWebsite(website.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Ping Website
                          </Button>
                        </CardFooter>
                      </AnimatedCard>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="recent" className="mt-6">
                <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={containerVariants}>
                  {websitesToValidate
                    .filter((w) => w.lastValidated === "just now")
                    .map((website) => (
                      <motion.div key={website.id} variants={itemVariants}>
                        <AnimatedCard>
                          <CardHeader>
                            <CardTitle className="line-clamp-1 gradient-text">{website.url}</CardTitle>
                            <CardDescription>Last validated: {website.lastValidated}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Coins className="h-3 w-3" />
                                {website.reward} coins
                              </Badge>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button
                              className="w-full animate-in-button"
                              variant="outline"
                              onClick={() => pingWebsite(website.id)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Ping Again
                            </Button>
                          </CardFooter>
                        </AnimatedCard>
                      </motion.div>
                    ))}
                  {websitesToValidate.filter((w) => w.lastValidated === "just now").length === 0 && (
                    <div className="col-span-full">
                      <Alert>
                        <AlertTitle>No Recent Validations</AlertTitle>
                        <AlertDescription>
                          You haven't validated any websites recently. Go to the "Available to Validate" tab to start
                          validating.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

