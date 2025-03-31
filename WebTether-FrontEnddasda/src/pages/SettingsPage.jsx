"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "../components/ui/navbar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { User, Bell, Shield, Server, Mail, Phone, Save, Check, X } from "lucide-react"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john@example.com")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [latencyThreshold, setLatencyThreshold] = useState(500)
  const [downtimeThreshold, setDowntimeThreshold] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    }, 1000)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to keep your current password</p>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>

                  {saveSuccess && (
                    <div className="mt-2 text-sm flex items-center gap-1 text-green-500">
                      <Check className="w-4 h-4" />
                      <span>Changes saved successfully</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "notifications":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Notification Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>Email Notifications</span>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          emailNotifications ? "bg-primary" : "bg-muted"
                        }`}
                        onClick={() => setEmailNotifications(!emailNotifications)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                            emailNotifications ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>SMS Notifications</span>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          smsNotifications ? "bg-primary" : "bg-muted"
                        }`}
                        onClick={() => setSmsNotifications(!smsNotifications)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                            smsNotifications ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <span>Push Notifications</span>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pushNotifications ? "bg-primary" : "bg-muted"
                        }`}
                        onClick={() => setPushNotifications(!pushNotifications)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                            pushNotifications ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Alert Thresholds</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="latency" className="block text-sm mb-1">
                        Latency Threshold (ms)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="latency"
                          type="range"
                          min="100"
                          max="1000"
                          step="50"
                          value={latencyThreshold}
                          onChange={(e) => setLatencyThreshold(Number.parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{latencyThreshold}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Alert when latency exceeds this threshold</p>
                    </div>

                    <div>
                      <label htmlFor="downtime" className="block text-sm mb-1">
                        Downtime Threshold (minutes)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="downtime"
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={downtimeThreshold}
                          onChange={(e) => setDowntimeThreshold(Number.parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{downtimeThreshold}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Alert after website is down for this many minutes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>

                  {saveSuccess && (
                    <div className="mt-2 text-sm flex items-center gap-1 text-green-500">
                      <Check className="w-4 h-4" />
                      <span>Changes saved successfully</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "security":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <h4 className="text-sm font-medium">Enable 2FA</h4>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">API Keys</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <h4 className="text-sm font-medium">Manage API Keys</h4>
                      <p className="text-xs text-muted-foreground">
                        Create and manage API keys for programmatic access
                      </p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Sessions</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <h4 className="text-sm font-medium">Active Sessions</h4>
                      <p className="text-xs text-muted-foreground">View and manage your active sessions</p>
                    </div>
                    <Button variant="outline">View</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Danger Zone</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                    <div>
                      <h4 className="text-sm font-medium">Delete Account</h4>
                      <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <X className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "validator":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Validator Settings</CardTitle>
              <CardDescription>Configure your validator settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Validator Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="validator-name" className="block text-sm font-medium mb-1">
                        Validator Name
                      </label>
                      <input
                        id="validator-name"
                        type="text"
                        defaultValue="My Validator"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      />
                    </div>

                    <div>
                      <label htmlFor="validator-location" className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <select
                        id="validator-location"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="us-east">US East (New York)</option>
                        <option value="us-west">US West (San Francisco)</option>
                        <option value="eu-west">EU West (London)</option>
                        <option value="eu-central">EU Central (Frankfurt)</option>
                        <option value="ap-northeast">Asia Pacific (Tokyo)</option>
                        <option value="ap-southeast">Asia Pacific (Singapore)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="max-websites" className="block text-sm font-medium mb-1">
                        Maximum Websites to Monitor
                      </label>
                      <input
                        id="max-websites"
                        type="number"
                        defaultValue={10}
                        min={1}
                        max={50}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum number of websites this validator will monitor
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Advanced Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Auto-start on boot</h4>
                        <p className="text-xs text-muted-foreground">Automatically start validator when system boots</p>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-background translate-x-6" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Resource Limits</h4>
                        <p className="text-xs text-muted-foreground">Limit CPU and memory usage</p>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-background translate-x-6" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Debug Mode</h4>
                        <p className="text-xs text-muted-foreground">Enable detailed logging for troubleshooting</p>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-background translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>

                  {saveSuccess && (
                    <div className="mt-2 text-sm flex items-center gap-1 text-green-500">
                      <Check className="w-4 h-4" />
                      <span>Changes saved successfully</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isLoggedIn={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeIn}>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <motion.div className="md:w-64 flex-shrink-0" initial="hidden" animate="visible" variants={fadeIn}>
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <button
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === "profile"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>

                  <button
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === "notifications"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </button>

                  <button
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === "security"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setActiveTab("security")}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Security</span>
                  </button>

                  <button
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeTab === "validator"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setActiveTab("validator")}
                  >
                    <Server className="h-4 w-4" />
                    <span>Validator</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div className="flex-1" initial="hidden" animate="visible" variants={fadeIn}>
            {renderTabContent()}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

