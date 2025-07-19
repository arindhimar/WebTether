"use client"

import { Button } from "../ui/button"
import { ThemeToggle } from "../ui/theme-toggle"
import { UserMenu } from "../auth/UserMenu"
import { useAuth } from "../../contexts/AuthContext"
import { Wifi, ArrowLeft } from "lucide-react"

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo & Back */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Wifi className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Web-Tether
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{user?.isVisitor ? "Website Owner" : "Validator"}</span>
            <div className="h-4 w-px bg-border" />
          </div>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
