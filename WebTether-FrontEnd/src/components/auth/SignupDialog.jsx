"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Dialog, DialogContent } from "../ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Alert, AlertDescription } from "../ui/alert"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Shield } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function SignupDialog({ open, onOpenChange, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isVisitor: false,
    wallet_address: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { signup } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const isDark = theme === "dark"

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    return strength
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (formData.wallet_address && !/^0x[a-fA-F0-9]{40}$/.test(formData.wallet_address)) {
      newErrors.wallet_address = "Please enter a valid Ethereum wallet address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }

    // Calculate password strength
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value))
    }
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
      const signupData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        ...(formData.wallet_address && { wallet_address: formData.wallet_address }),
        isVisitor: formData.isVisitor,
      }

      const result = await signup(signupData)

      if (result.success) {
        const userName = result.user?.name || formData.name
        const userRole = result.user?.isVisitor || result.user?.role === "validator" ? "validator" : "website owner"

        toast.success("🎉 Welcome to WebTether!", {
          description: `Account created successfully! Welcome ${userName}, you're now registered as a ${userRole}.`,
          duration: 4000,
        })

        onOpenChange(false)
        resetForm()

        setTimeout(() => {
          navigate("/dashboard")
        }, 1000)
      } else {
        const errorMessage = result.error || "Account creation failed. Please try again."
        setErrors({ general: errorMessage })
        toast.error("Signup Failed", {
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
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isVisitor: false,
      wallet_address: "",
    })
    setErrors({})
    setPasswordStrength(0)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500"
    if (passwordStrength < 50) return "bg-orange-500"
    if (passwordStrength < 75) return "bg-blue-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak"
    if (passwordStrength < 50) return "Fair"
    if (passwordStrength < 75) return "Good"
    return "Strong"
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`sm:max-w-[580px] max-h-[90vh] overflow-y-auto ${isDark ? "bg-slate-800 border-blue-800/30" : "bg-white border-blue-200/50"}`}
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-1 pb-6 text-center">
            <div
              className={`flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${isDark ? "bg-blue-600" : "bg-blue-600"}`}
            >
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Join WebTether
            </CardTitle>
            <CardDescription className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Create your account to start monitoring websites with our validator network
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`h-11 ${isDark ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"} ${errors.name ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-blue-500"}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
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
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
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
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>Password strength:</span>
                      <span
                        className={`font-medium ${passwordStrength >= 75 ? "text-green-600" : passwordStrength >= 50 ? "text-blue-600" : "text-red-600"}`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDark ? "bg-slate-600" : "bg-slate-200"}`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`h-11 pr-10 ${isDark ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"} ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-blue-500"}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-800"}`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="wallet_address"
                  className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  Wallet Address (Optional)
                </Label>
                <Input
                  id="wallet_address"
                  name="wallet_address"
                  type="text"
                  placeholder="0x... (optional - leave empty for default)"
                  value={formData.wallet_address}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-11 font-mono text-sm ${isDark ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"} ${errors.wallet_address ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-blue-500"}`}
                />
                {errors.wallet_address && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.wallet_address}
                  </p>
                )}
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Leave empty to use default wallet address. You can update this later.
                </p>
              </div>

              <Card className={`${isDark ? "bg-slate-700/30 border-slate-600" : "bg-blue-50/50 border-blue-200"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="isVisitor"
                      checked={formData.isVisitor}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isVisitor: checked }))}
                      disabled={isLoading}
                      className="border-blue-500 data-[state=checked]:bg-blue-600"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="isVisitor"
                        className={`text-sm font-medium cursor-pointer flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}
                      >
                        <Shield className="h-4 w-4 text-blue-600" />I want to be a validator
                      </Label>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Earn rewards for monitoring websites and helping secure the network
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {formData.isVisitor && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Excellent choice!</strong> After creating your account, we'll guide you through setting up
                    your Cloudflare Worker to start earning rewards by validating websites.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create My Account
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className={`w-full ${isDark ? "bg-slate-600" : "bg-slate-200"}`} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={`px-2 ${isDark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-500"}`}>
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className={`p-0 h-auto font-semibold ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                  onClick={onSwitchToLogin}
                  disabled={isLoading}
                >
                  Sign in to your dashboard →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
