import { useState } from "react"
import { AlertCircle, CheckCircle2, Clock, Coins, Globe, RefreshCw, Shield, UserPlus } from 'lucide-react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
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

// Mock data for websites to validate
const mockWebsitesToValidate = [
  { id: 1, url: "https://example.com", lastValidated: "2 hours ago", reward: 5 },
  { id: 2, url: "https://test.org", lastValidated: "1 day ago", reward: 10 },
  { id: 3, url: "https://demo.net", lastValidated: "3 hours ago", reward: 5 },
  { id: 4, url: "https://mysite.io", lastValidated: "12 hours ago", reward: 8 },
  { id: 5, url: "https://coolapp.dev", lastValidated: "5 hours ago", reward: 7 },
  { id: 6, url: "https://newproject.co", lastValidated: "2 days ago", reward: 12 },
]

export default function ValidatorsPage() {
  const [isValidator, setIsValidator] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [websitesToValidate, setWebsitesToValidate] = useState(mockWebsitesToValidate)
  const [validatorStats, setValidatorStats] = useState({
    totalPings: 0,
    successfulPings: 0,
    totalRewards: 0,
    level: 1,
    progress: 30,
  })
  const { toast } = useToast()

  const registerAsValidator = () => {
    setIsValidator(true)
    setIsRegistering(false)
    toast({
      title: "Registration Successful",
      description: "You are now registered as a validator. Start pinging websites to earn rewards!",
    })
  }

  const pingWebsite = (websiteId) => {
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
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "up":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "timeout":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Validators</h2>
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
      </div>

      {!isValidator ? (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Not a Validator</AlertTitle>
          <AlertDescription>
            You are not registered as a validator. Register to start validating websites and earning rewards.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pings</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{validatorStats.totalPings}</div>
                <p className="text-xs text-muted-foreground">{validatorStats.successfulPings} successful</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {validatorStats.totalPings > 0
                    ? Math.round((validatorStats.successfulPings / validatorStats.totalPings) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Overall success rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{validatorStats.totalRewards} coins</div>
                <p className="text-xs text-muted-foreground">Earned from validations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validator Level</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Level {validatorStats.level}</div>
                <div className="mt-2">
                  <Progress value={validatorStats.progress} className="h-2" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {validatorStats.progress}% to Level {validatorStats.level + 1}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="available">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="available">Available to Validate</TabsTrigger>
                <TabsTrigger value="recent">Recently Validated</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh List
              </Button>
            </div>

            <TabsContent value="available" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {websitesToValidate.map((website) => (
                  <Card key={website.id}>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{website.url}</CardTitle>
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
                      <Button className="w-full" onClick={() => pingWebsite(website.id)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Ping Website
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {websitesToValidate
                  .filter((w) => w.lastValidated === "just now")
                  .map((website) => (
                    <Card key={website.id}>
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{website.url}</CardTitle>
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
                        <Button className="w-full" variant="outline" onClick={() => pingWebsite(website.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Ping Again
                        </Button>
                      </CardFooter>
                    </Card>
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
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
