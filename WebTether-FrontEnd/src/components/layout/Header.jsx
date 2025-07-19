"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { ThemeToggle } from "../ui/theme-toggle"
import { LoginDialog } from "../auth/LoginDialog"
import { SignupDialog } from "../auth/SignupDialog"
import { UserMenu } from "../auth/UserMenu"
import { useAuth } from "../../contexts/AuthContext"
import { Wifi, Github, Menu, X } from "lucide-react"
import { Separator } from "../ui/separator"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const { user, isLoading } = useAuth()

  const handleSwitchToSignup = () => {
    setLoginOpen(false)
    setSignupOpen(true)
  }

  const handleSwitchToLogin = () => {
    setSignupOpen(false)
    setLoginOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Wifi className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Web-Tether
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </a>
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </a>
            <a
              href="https://github.com/web-tether"
              className="text-sm font-medium hover:text-primary transition-colors flex items-center"
            >
              <Github className="h-4 w-4 mr-1" />
              GitHub
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => (window.location.href = "/dashboard")}
                    >
                      Dashboard
                    </Button>
                    <UserMenu />
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)}>
                      Login
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => setSignupOpen(true)}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="container px-4 py-4 space-y-3">
              <a href="#home" className="block text-sm font-medium hover:text-primary transition-colors">
                Home
              </a>
              <a href="#features" className="block text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="block text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </a>
              <a
                href="https://github.com/web-tether"
                className="block text-sm font-medium hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <Separator />
              {!isLoading && (
                <>
                  {user ? (
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                        onClick={() => (window.location.href = "/dashboard")}
                      >
                        Dashboard
                      </Button>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Signed in as {user.name}</span>
                        <UserMenu />
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => setLoginOpen(true)}>
                        Login
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                        onClick={() => setSignupOpen(true)}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Dialogs */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onSwitchToSignup={handleSwitchToSignup} />
      <SignupDialog open={signupOpen} onOpenChange={setSignupOpen} onSwitchToLogin={handleSwitchToLogin} />
    </>
  )
}
