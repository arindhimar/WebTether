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
    <header className="sticky top-0 z-50 w-full border-b border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo and Brand - Always WebTether */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                WebTether
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Network Monitor</p>
            </div>
            <Badge variant="secondary" className="hidden md:flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3" />
              {user?.isVisitor ? "Validator" : "Owner"}
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : "hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden xl:inline">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Button>
              )
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle - Hidden on mobile */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Desktop User Menu */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm truncate">{user?.name || user?.email}</p>
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
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <div className="flex flex-col gap-6 py-6">
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user?.name || user?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.isVisitor ? "Validator Account" : "Website Owner"}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        {user?.isVisitor ? "Validator" : "Owner"}
                      </Badge>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = currentView === item.id
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "default" : "ghost"}
                          size="lg"
                          onClick={() => handleNavClick(item.id)}
                          className={`justify-start h-12 text-base ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                              : "hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </Button>
                      )
                    })}
                  </nav>

                  {/* Mobile Theme Toggle */}
                  <div className="px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Mobile User Actions */}
                  <div className="border-t pt-4 space-y-2">
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => handleNavClick("settings")}
                      className="w-full justify-start h-12 text-base"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={handleLogout}
                      className="w-full justify-start h-12 text-base text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
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
