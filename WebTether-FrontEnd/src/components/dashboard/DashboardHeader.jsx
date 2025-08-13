"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { ThemeToggle } from "../ui/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { LayoutDashboard, Globe, Activity, Wallet, Settings, Menu, LogOut, User, Sparkles, Zap } from "lucide-react"

export function DashboardHeader({ currentView, onNavigate }) {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = user?.isVisitor
    ? [
        { id: "available-sites", label: "Available Sites", icon: Globe },
        { id: "activity", label: "My Activity", icon: Activity },
        { id: "wallet", label: "Wallet", icon: Wallet },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    : [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "websites", label: "My Sites", icon: Globe },
        { id: "activity", label: "Activity", icon: Activity },
        { id: "wallet", label: "Wallet", icon: Wallet },
        { id: "settings", label: "Settings", icon: Settings },
      ]

  const handleNavClick = (viewId) => {
    onNavigate(viewId)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  WebTether
                </h1>
                <p className="text-xs text-muted-foreground">Network Monitor</p>
              </div>
            </div>

            <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {user?.isVisitor ? "Validator" : "Owner"}
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative ${
                    isActive ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Button>
              )
            })}
          </nav>

          {/* Right Side - Theme + User Menu */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.isVisitor ? "Validator Account" : "Website Owner"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavClick("settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavClick("wallet")}>
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 py-6">
                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = currentView === item.id
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleNavClick(item.id)}
                          className={`justify-start ${
                            isActive ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {item.label}
                        </Button>
                      )
                    })}
                  </nav>

                  {/* Mobile User Actions */}
                  <div className="border-t pt-4 space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavClick("settings")}
                      className="w-full justify-start"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
