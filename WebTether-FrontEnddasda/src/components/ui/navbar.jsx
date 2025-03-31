"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../theme-provider"
import { Button } from "./button"
import { Menu, X, Sun, Moon, User, LogOut, SettingsIcon } from "lucide-react"

export function Navbar({ isLoggedIn = false }) {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const location = useLocation()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary">WebTether</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isLoggedIn && (
                <>
                  <Link
                    to="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive("/dashboard")
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/validators"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive("/validators")
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    Validators
                  </Link>
                  <Link
                    to="/reports"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive("/reports")
                        ? "border-primary text-primary"
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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isLoggedIn ? (
              <div className="relative">
                <button onClick={toggleProfile} className="flex text-sm rounded-full focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-card ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <Link to="/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">
                      <div className="flex items-center">
                        <SettingsIcon size={16} className="mr-2" />
                        Settings
                      </div>
                    </Link>
                    <button className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent">
                      <div className="flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none mr-2"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive("/dashboard")
                      ? "border-primary text-primary bg-primary/10"
                      : "border-transparent text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/validators"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive("/validators")
                      ? "border-primary text-primary bg-primary/10"
                      : "border-transparent text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Validators
                </Link>
                <Link
                  to="/reports"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive("/reports")
                      ? "border-primary text-primary bg-primary/10"
                      : "border-transparent text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Reports
                </Link>
                <Link
                  to="/settings"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive("/settings")
                      ? "border-primary text-primary bg-primary/10"
                      : "border-transparent text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Settings
                </Link>
                <button className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-accent">
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
        </div>
      )}
    </nav>
  )
}

