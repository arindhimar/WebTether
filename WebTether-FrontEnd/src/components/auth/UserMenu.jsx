"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Dialog, DialogContent } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../hooks/use-toast"
import { api } from "../../services/api"
import {
  User,
  Settings,
  LogOut,
  Save,
  Globe,
  Activity,
  Zap,
  Wallet,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"

export function UserMenu({ onNavigate, currentView }) {
  const { user, logout, refreshUserData } = useAuth()
  const { toast } = useToast()
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const validateProfileData = () => {
    const newErrors = {}

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!profileData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const handleProfileSave = async () => {
    if (!validateProfileData()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await api.updateUser(user.id, {
        name: profileData.name.trim(),
        email: profileData.email.toLowerCase(),
      })

      await refreshUserData()

      toast({
        title: "Profile Updated Successfully",
        description: "Your profile information has been saved.",
        action: <CheckCircle2 className="h-4 w-4" />,
      })

      setProfileOpen(false)
    } catch (error) {
      const errorMessage = error.message || "Failed to update profile. Please try again."
      setErrors({ general: errorMessage })
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const menuItems = [
    {
      key: "overview",
      label: "Dashboard Overview",
      icon: BarChart3,
      description: "View earnings and statistics",
      show: !user?.isVisitor,
    },
    {
      key: "websites",
      label: "My Websites",
      icon: Globe,
      description: "Manage your listed websites",
      show: !user?.isVisitor,
    },
    {
      key: "available-sites",
      label: "Available Sites",
      icon: Zap,
      description: "Sites available for validation",
      show: true,
    },
    {
      key: "activity",
      label: user?.isVisitor ? "My Activity" : "Ping Queue",
      icon: Activity,
      description: user?.isVisitor ? "Your validation history" : "Recent ping activity",
      show: true,
    },
    {
      key: "wallet",
      label: "Wallet Management",
      icon: Wallet,
      description: "View balance and transactions",
      show: true,
    },
    {
      key: "settings",
      label: "Account Settings",
      icon: Settings,
      description: "Manage your account",
      show: true,
    },
  ]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full border-2 border-blue-200 dark:border-blue-800 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-semibold">
                {getInitials(user?.name || user?.email || "U")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-80 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-100"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800">
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-semibold">
                    {getInitials(user?.name || user?.email || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-none truncate text-slate-900 dark:text-slate-100">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300"
                >
                  {user?.isVisitor ? "Validator" : "Owner"}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-blue-200 dark:bg-blue-800" />

          {/* Navigation Items */}
          {menuItems
            .filter((item) => item.show)
            .map((item) => (
              <DropdownMenuItem
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`cursor-pointer p-3 transition-colors text-slate-900 dark:text-slate-100 ${
                  currentView === item.key
                    ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300"
                    : "hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-300"
                }`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                </div>
              </DropdownMenuItem>
            ))}

          <DropdownMenuSeparator className="bg-blue-200 dark:bg-blue-800" />

          {/* Profile & Logout */}
          <DropdownMenuItem
            onClick={() => setProfileOpen(true)}
            className="cursor-pointer p-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-300 text-slate-900 dark:text-slate-100"
          >
            <User className="mr-3 h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium text-sm">Edit Profile</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Update your account details</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 p-3"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800">
          <Card className="border-0 shadow-none bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/20">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Edit Profile</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Update your account information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.general && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 dark:text-red-200">{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Full Name
                  </Label>
                  <Input
                    id="profile-name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={isLoading}
                    className={`h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-blue-200 dark:border-blue-800 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Email Address
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isLoading}
                    className={`h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-blue-200 dark:border-blue-800 placeholder:text-slate-500 dark:placeholder:text-slate-400 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-200 dark:border-blue-800">
                <Button
                  variant="outline"
                  onClick={() => setProfileOpen(false)}
                  disabled={isLoading}
                  className="bg-transparent border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProfileSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}
