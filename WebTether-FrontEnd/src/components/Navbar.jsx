"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "./ThemeProvider"
import { useAuth } from "../contexts/AuthContext"
import { useUser } from "@clerk/clerk-react"
import { Button } from "./ui/button"
import { Logo } from "./Logo"
import { Menu, X, Sun, Moon, User, LogOut, Settings } from "lucide-react"
import { useToast } from "../hooks/use-toast"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { isSignedIn, userProfile, signOut } = useAuth()
  const { user } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { toast } = useToast()

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      description: `You've switched to ${newTheme} mode.`,
    })
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const handleSignOut = () => {
    signOut()
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    })
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  return (
    <motion.nav
      className={`sticky top-0 z-50 bg-background border-b border-border transition-all duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isSignedIn && (
                <>
                  <Link
                    to="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive("/dashboard")
                        ? "border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/validators"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive("/validators")
                        ? "border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    Validators
                  </Link>
                  <Link
                    to="/reports"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive("/reports")
                        ? "border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {isSignedIn ? (
              <div className="relative">
                <motion.button
                  onClick={toggleProfile}
                  className="flex text-sm rounded-full focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl || "/placeholder.svg"}
                      alt={user.fullName || "User"}
                      className="h-8 w-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={18} />
                    </div>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-card ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-border"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground">
                          {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-150"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center">
                          <Settings size={16} className="mr-2" />
                          Settings
                        </div>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-150"
                      >
                        <div className="flex items-center">
                          <LogOut size={16} className="mr-2" />
                          Sign out
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="transition-all duration-300 hover:scale-105">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-primary/50 mr-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            <motion.button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="sm:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-2 pb-3 space-y-1">
              {isSignedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                      isActive("/dashboard")
                        ? "border-blue-500 text-blue-500 bg-blue-500/10 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/validators"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                      isActive("/validators")
                        ? "border-blue-500 text-blue-500 bg-blue-500/10 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    Validators
                  </Link>
                  <Link
                    to="/reports"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                      isActive("/reports")
                        ? "border-blue-500 text-blue-500 bg-blue-500/10 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    Reports
                  </Link>
                  <Link
                    to="/settings"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                      isActive("/settings")
                        ? "border-primary text-primary bg-primary/10"
                        : "border-transparent text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-accent transition-colors duration-200"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="px-3 py-3 flex flex-col space-y-2">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

