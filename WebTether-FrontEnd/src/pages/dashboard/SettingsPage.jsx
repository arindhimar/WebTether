"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Switch } from "../components/ui/switch"
import { Separator } from "../components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useToast } from "../components/ui/use-toast"
import { Bell, Lock, User, Globe, Shield, Mail, Phone, Clock } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Form states
  const [profile, setProfile] = useState({
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 123-4567",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    websiteDown: true,
    websiteUp: false,
    validatorActivity: true,
    reports: true,
    marketing: false,
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
  })

  // Animation effect when component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handleNotificationsSubmit = (e) => {
    e.preventDefault()
    toast({
      title: "Notification Preferences Saved",
      description: "Your notification settings have been updated.",
    })
  }

  const handleSecuritySubmit = (e) => {
    e.preventDefault()
    toast({
      title: "Security Settings Updated",
      description: "Your security preferences have been saved.",
    })
  }

  return (
    <div className={`container max-w-4xl py-6 space-y-8 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-text">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="animate-in-button">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="animate-in-button">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="animate-in-button">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-card-appear">
          <Card>
            <form onSubmit={handleProfileSubmit}>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="focus-visible:ring-primary"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="focus-visible:ring-primary"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium">Profile Picture</h3>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" className="animate-in-button">
                        Upload New Picture
                      </Button>
                      <Button variant="ghost" className="animate-in-button">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="gradient" className="animate-in-button">
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="animate-card-appear">
          <Card>
            <form onSubmit={handleNotificationsSubmit}>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you want to receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Channels</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Event Types</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-red-500" />
                      <Label htmlFor="website-down">Website Down Alerts</Label>
                    </div>
                    <Switch
                      id="website-down"
                      checked={notifications.websiteDown}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, websiteDown: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <Label htmlFor="website-up">Website Recovery Alerts</Label>
                    </div>
                    <Switch
                      id="website-up"
                      checked={notifications.websiteUp}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, websiteUp: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="validator-activity">Validator Activity</Label>
                    </div>
                    <Switch
                      id="validator-activity"
                      checked={notifications.validatorActivity}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, validatorActivity: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="marketing">Marketing & Updates</Label>
                    </div>
                    <Switch
                      id="marketing"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="gradient" className="animate-in-button">
                  Save Preferences
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-card-appear">
          <Card>
            <form onSubmit={handleSecuritySubmit}>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and authentication options.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => setSecurity({ ...security, twoFactor: checked })}
                    />
                  </div>

                  {security.twoFactor && (
                    <div className="rounded-md bg-muted p-4">
                      <h4 className="font-medium">Set Up Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use an authenticator app like Google Authenticator or Authy to generate verification codes.
                      </p>
                      <Button variant="outline" className="mt-4 animate-in-button">
                        Configure 2FA
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Session Management</h3>
                    <p className="text-sm text-muted-foreground">Control how long you stay signed in.</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={security.sessionTimeout}
                        onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}
                      >
                        <SelectTrigger className="w-full focus-visible:ring-primary">
                          <SelectValue placeholder="Select timeout duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="0">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-muted-foreground">Change your password or reset it if forgotten.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="animate-in-button">
                      Change Password
                    </Button>
                    <Button variant="ghost" className="animate-in-button">
                      Reset Password
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="gradient" className="animate-in-button">
                  Save Security Settings
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

