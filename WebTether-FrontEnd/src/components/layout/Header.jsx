"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { ThemeToggle } from "../ui/theme-toggle"
import { LoginDialog } from "../auth/LoginDialog"
import { SignupDialog } from "../auth/SignupDialog"
import { UserMenu } from "../auth/UserMenu"
import { useAuth } from "../../contexts/AuthContext"
import { Menu, X, Globe } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  console.log("[v0] Header - isAuthenticated:", isAuthenticated, "user:", user)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSwitchToSignup = () => {
    setShowLogin(false)
    setShowSignup(true)
  }

  const handleSwitchToLogin = () => {
    setShowSignup(false)
    setShowLogin(true)
  }

  const handleDashboardClick = () => {
    navigate("/dashboard")
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <Globe className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block">WebTether</span>
            </a>
            <nav className="flex items-center gap-6 text-sm">
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="#features">
                Features
              </a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="#how-it-works">
                How it Works
              </a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="#pricing">
                Pricing
              </a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="#faq">
                FAQ
              </a>
              {isAuthenticated && (
                <button
                  onClick={handleDashboardClick}
                  className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
                >
                  Dashboard
                </button>
              )}
            </nav>
          </div>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <a className="mr-6 flex items-center space-x-2 md:hidden" href="/">
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-bold">WebTether</span>
              </a>
            </div>
            <nav className="flex items-center gap-2">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleDashboardClick} className="md:hidden">
                    Dashboard
                  </Button>
                  <UserMenu user={user} />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      console.log("[v0] Sign In clicked")
                      setShowLogin(true)
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      console.log("[v0] Get Started clicked")
                      setShowSignup(true)
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
        {isMenuOpen && (
          <div className="border-t md:hidden">
            <div className="container py-4">
              <nav className="flex flex-col space-y-3">
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  href="#features"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  href="#how-it-works"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How it Works
                </a>
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  href="#pricing"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                  href="#faq"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </a>
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      handleDashboardClick()
                      setIsMenuOpen(false)
                    }}
                    className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium text-left"
                  >
                    Dashboard
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      <LoginDialog
        open={showLogin}
        onOpenChange={(open) => {
          console.log("[v0] LoginDialog open state:", open)
          setShowLogin(open)
        }}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupDialog
        open={showSignup}
        onOpenChange={(open) => {
          console.log("[v0] SignupDialog open state:", open)
          setShowSignup(open)
        }}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  )
}
