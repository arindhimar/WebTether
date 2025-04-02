"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { UserButton, useAuth } from "@clerk/clerk-react"
import {
  Activity,
  BarChart3,
  Flag,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Bell,
  Search,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { useTheme } from "../components/theme-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setTheme, theme } = useTheme()
  const { signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Animation effect when component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: location.pathname === "/dashboard",
    },
    {
      href: "/dashboard/websites",
      label: "Websites",
      icon: Activity,
      active: location.pathname === "/dashboard/websites",
    },
    {
      href: "/dashboard/validators",
      label: "Validators",
      icon: BarChart3,
      active: location.pathname === "/dashboard/validators",
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: Flag,
      active: location.pathname === "/dashboard/reports",
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
      active: location.pathname === "/dashboard/profile",
    },
  ]

  const handleSignOut = () => {
    signOut()
    navigate("/")
  }

  // Mock notifications
  const notifications = [
    { id: 1, title: "Website Down", message: "example.com is currently down", time: "5 min ago" },
    { id: 2, title: "New Validator", message: "You've been approved as a validator", time: "1 hour ago" },
    { id: 3, title: "Reward Earned", message: "You earned 10 coins for validation", time: "3 hours ago" },
  ]

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen ${mounted ? "animate-fade-in" : "opacity-0"}`}>
        <Sidebar className="border-r border-border">
          <SidebarHeader className="flex h-16 items-center border-b px-4">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <div className="rounded-full bg-gradient-to-r from-primary to-blue-400 p-1.5">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Web-Tether</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="w-full bg-muted pl-9 focus-visible:ring-primary" />
              </div>
            </div>
            <SidebarMenu className="px-2">
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton asChild isActive={route.active} className="animate-in-menu-item">
                    <Link to={route.href}>
                      <route.icon className={`h-5 w-5 ${route.active ? "text-primary" : ""}`} />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Jane Smith</span>
                  <span className="text-xs text-muted-foreground">Premium User</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="animate-hover-bounce"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="animate-hover-bounce">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="animate-hover-bounce" />
              <h1 className="text-xl font-semibold gradient-text">
                {routes.find((route) => route.active)?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative animate-hover-bounce">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                      {notifications.length}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-2">
                    <span className="font-medium">Notifications</span>
                    <Badge variant="outline" className="text-xs">
                      {notifications.length} new
                    </Badge>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 focus:bg-accent">
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">{notification.message}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{notification.time}</div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <div className="border-t p-2">
                    <Button variant="ghost" size="sm" className="w-full justify-center">
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 animate-hover-bounce",
                  },
                }}
              />
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4 animate-hover-spin" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
          <div className="w-full px-4 py-6 animate-page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

