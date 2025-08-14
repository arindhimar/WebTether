"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { ThemeToggle } from "../ui/theme-toggle"
import { LoginDialog } from "../auth/LoginDialog"
import { SignupDialog } from "../auth/SignupDialog"
import { UserMenu } from "../auth/UserMenu"
import { useAuth } from "../../contexts/AuthContext"
import { Menu, X, Zap } from "lucide-react"

export function Header() {
  const { user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigateTo = (path) => {
    window.history.pushState({}, "", path)
    window.location.reload()
    setMobileMenuOpen(false)
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigateTo("/")}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              WebTether
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-primary transition-colors"
            >
              How It Works
            </Button>
            <Button
              variant="ghost"
              onClick={() => scrollToSection("examples")}
              className="hover:text-primary transition-colors"
            >
              Examples
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigateTo("/dashboard")}
              className="hover:text-primary transition-colors"
            >
              Dashboard
            </Button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowLogin(true)}
                  className="hover:text-primary transition-colors"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setShowSignup(true)}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="container py-4 px-6 space-y-4">
              <Button
                variant="ghost"
                onClick={() => scrollToSection("how-it-works")}
                className="w-full justify-start hover:text-primary transition-colors"
              >
                How It Works
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("examples")}
                className="w-full justify-start hover:text-primary transition-colors"
              >
                Examples
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigateTo("/dashboard")}
                className="w-full justify-start hover:text-primary transition-colors"
              >
                Dashboard
              </Button>

              <div className="pt-4 border-t space-y-2">
                {user ? (
                  <UserMenu />
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => setShowLogin(true)}
                      className="w-full justify-start hover:text-primary transition-colors"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => setShowSignup(true)}
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Dialogs */}
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      <SignupDialog open={showSignup} onOpenChange={setShowSignup} />
    </>
  )
}
