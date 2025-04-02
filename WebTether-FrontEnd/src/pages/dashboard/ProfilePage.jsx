import { useState } from "react"
import { AlertTriangle, Calendar, Coins, Edit, LogOut, Mail, RefreshCw, Shield, Trash2, User } from 'lucide-react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Progress } from "../../components/ui/progress"
import { Separator } from "../../components/ui/separator"
import { useToast } from "../../components/ui/use-toast"

export default function ProfilePage() {
  const [isValidator, setIsValidator] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [validatorStats, setValidatorStats] = useState({
    totalPings: 42,
    successfulPings: 38,
    totalRewards: 215,
    level: 2,
    progress: 65,
  })
  const { toast } = useToast()

  const deleteAccount = () => {
    setIsDeleting(false)
    toast({
      title: "Account Deletion Requested",
      description:
        "Your account deletion request has been submitted. You will receive an email with further instructions.",
    })
  }

  // Mock user data
  const user = {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    registeredDate: "May 10, 2023",
    websites: 4,
    avatar: "/placeholder-user.jpg",
  }

  // Mock activity data
  const recentActivity = [
    { id: 1, action: "Added website", target: "https://example.com", date: "2 days ago" },
    { id: 2, action: "Validated website", target: "https://test.org", date: "3 days ago" },
    { id: 3, action: "Reported validator", target: "validator123", date: "1 week ago" },
    { id: 4, action: "Earned reward", target: "10 coins", date: "1 week ago" },
    { id: 5, action: "Added website", target: "https://demo.net", date: "2 weeks ago" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <Button variant="outline" asChild>
          <a href="/sign-in">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </a>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Registered</span>
              <span className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {user.registeredDate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Websites</span>
              <span className="text-sm">{user.websites}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Validator Status</span>
              <Badge variant={isValidator ? "default" : "outline"}>{isValidator ? "Active" : "Inactive"}</Badge>
            </div>
            {isValidator && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Validator Level</span>
                <span className="text-sm">Level {validatorStats.level}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" asChild>
              <a href="/settings">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </a>
            </Button>
            <Button variant="destructive" className="w-full" onClick={() => setIsDeleting(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {isValidator && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Validator Statistics
                </CardTitle>
                <CardDescription>Your performance as a validator</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Total Pings</div>
                    <div className="text-2xl font-bold">{validatorStats.totalPings}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
                    <div className="text-2xl font-bold">
                      {Math.round((validatorStats.successfulPings / validatorStats.totalPings) * 100)}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Total Rewards</div>
                    <div className="text-2xl font-bold flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {validatorStats.totalRewards}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Level Progress</div>
                    <div className="space-y-1">
                      <div className="text-sm">Level {validatorStats.level}</div>
                      <Progress value={validatorStats.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {validatorStats.progress}% to Level {validatorStats.level + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  View Detailed Stats
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{activity.target}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.date}</div>
                    </div>
                    {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting your account will remove all your websites, validator status, and earned rewards.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
