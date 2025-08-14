"use client"

import { useState, useEffect } from "react"
import { Button } from "./button"
import { Badge } from "./badge"
import { cn } from "../lib/utils"
import { Home, Globe, Activity, Wallet, Settings, Target, Menu, X } from "lucide-react"

const navigationItems = {
  owner: [
    { id: "overview", label: "Overview", icon: Home },
    { id: "websites", label: "Websites", icon: Globe },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "settings", label: "Settings", icon: Settings },
  ],
  validator: [
    { id: "available-sites", label: "Validate", icon: Target },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "settings", label: "Settings", icon: Settings },
  ],
}

export function MobileNavigation({ currentView, onNavigate, user, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const items = user?.isVisitor ? navigationItems.validator : navigationItems.owner

  // Close mobile menu when view changes
  useEffect(() => {
    setIsOpen(false)
  }, [currentView])

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".mobile-nav-container")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isOpen])

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden mobile-nav-container">
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="touch-target">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-background border-l border-border shadow-xl animate-slide-in-from-right">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Navigation</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="touch-target">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <nav className="p-4 space-y-2">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start touch-target",
                      isActive && "bg-primary text-primary-foreground",
                    )}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                    {item.id === "available-sites" && user?.isVisitor && (
                      <Badge variant="secondary" className="ml-auto">
                        New
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-sm border-t border-border mobile-safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {items.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn("flex-1 flex-col gap-1 h-auto py-2 touch-target", isActive && "text-primary")}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-xs font-medium">{item.label}</span>
                {item.id === "available-sites" && user?.isVisitor && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// Add slide-in animation to globals.css
const slideInFromRightKeyframes = `
@keyframes slide-in-from-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in-from-right {
  animation: slide-in-from-right 0.3s ease-out;
}
`
