"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ThemeToggle } from "../ui/theme-toggle"
import { UserMenu } from "../auth/UserMenu"
import { useAuth } from "../../contexts/AuthContext"
import { Globe, Activity, Wallet, Settings, Menu, X, Zap, TrendingUp, Shield } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"

export function DashboardHeader({ currentView, onNavigate }) {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: TrendingUp,
      description: "Dashboard overview and stats",
      available: true,
    },
    {
      id: "websites",
      label: "My Websites",
      icon: Globe,
      description: "Manage your monitored websites",
      available: !user?.isVisitor,
    },
    {
      id: "available-sites",
      label: "Validate Sites",
      icon: Shield,
      description: "Earn ETH by validating websites",
      available: user?.isVisitor,
    },
    {
      id: "activity",
      label: user?.isVisitor ? "My Validations" : "Ping Queue",
      icon: Activity,
      description: user?.isVisitor ? "Your validation history" : "Pending ping requests",
      available: true,
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: Wallet,
      description: "View balance and transactions",
      available: true,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Account and preferences",
      available: true,
    },
  ]

  const availableItems = navigationItems.filter((item) => item.available)

  const NavButton = ({ item, isMobile = false }) => {
    const Icon = item.icon
    const isActive = currentView === item.id

    return (
      <Button
        variant={isActive ? "default" : "ghost"}
        size={isMobile ? "default" : "sm"}
        onClick={() => {
          onNavigate(item.id)
          if (isMobile) setMobileMenuOpen(false)
        }}
        className={`${isMobile ? "w-full justify-start" : ""} ${
          isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`}
      >
        <Icon className={`h-4 w-4 ${isMobile ? "mr-3" : "mr-2"}`} />
        {item.label}
        {isActive && !isMobile && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-primary rounded-md -z-10"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Button>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WebTether
                </h1>
              </div>
            </div>

            {/* User Role Badge */}
            {user && (
              <Badge
                variant="secondary"
                className={
                  user.isVisitor
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }
              >
                {user.isVisitor ? "Validator" : "Website Owner"}
              </Badge>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {availableItems.map((item) => (
              <NavButton key={item.id} item={item} />
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-semibold">WebTether</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="mb-6 p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {(user.username || user.email || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.username || user.email}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            user.isVisitor
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {user.isVisitor ? "Validator" : "Website Owner"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation */}
                <nav className="space-y-2">
                  {availableItems.map((item) => (
                    <div key={item.id}>
                      <NavButton item={item} isMobile />
                      <p className="text-xs text-muted-foreground ml-10 mt-1 mb-3">{item.description}</p>
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
