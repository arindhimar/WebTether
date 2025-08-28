"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Dialog, DialogContent } from "../ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Alert, AlertDescription } from "../ui/alert"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff, LogIn, Shield, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function LoginDialog({ open, onOpenChange, onSwitchToSignup }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const isDark = theme === "dark"

  const validateForm = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors below and try again.",
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const result = await login(email, password)

      if (result.success) {
        const userName = result.user?.name || "User"
        const userRole = result.user?.isVisitor || result.user?.role === "validator" ? "validator" : "website owner"

        toast.success(`Welcome back, ${userName}! 🎉`, {
          description: `Successfully logged in as a ${userRole}. Redirecting to dashboard...`,
          duration: 3000,
        })

        onOpenChange(false)
        setEmail("")
        setPassword("")

        setTimeout(() => {
          navigate("/dashboard")
        }, 1000)
      } else {
        const errorMessage = result.error || "Invalid email or password. Please try again."
        setErrors({ general: errorMessage })
        toast.error("Login Failed", {
          description: errorMessage,
          duration: 4000,
        })
      }
    } catch (error) {
      const errorMessage = error.message || "Unable to connect to the server."
      setErrors({ general: errorMessage })
      toast.error("Connection Error", {
        description: "Please check your internet connection and try again.",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setErrors({})
    setShowPassword(false)
  }

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`sm:max-w-[480px] ${isDark ? "bg-slate-800 border-blue-800/30" : "bg-white border-blue-200/50"}`}
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-1 pb-6 text-center">
            <div className={`flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 bg-blue-600`}>
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <CardTitle className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Welcome Back
            </CardTitle>
            <CardDescription className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Sign in to your WebTether account to continue monitoring your websites
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errors.general && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: null }))
                    }
                  }}
                  disabled={isLoading}
                  className={`h-11 ${isDark ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"} ${errors.email ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-blue-500"}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: null }))
                      }
                    }}
                    disabled={isLoading}
                    className={`h-11 pr-10 ${isDark ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"} ${errors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-blue-500"}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-800"}`}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In to Dashboard
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className={`w-full ${isDark ? "bg-slate-600" : "bg-slate-200"}`} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={`px-2 ${isDark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-500"}`}>
                    New to WebTether?
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className={`p-0 h-auto font-semibold ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                  onClick={onSwitchToSignup}
                  disabled={isLoading}
                >
                  Create your account here →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
