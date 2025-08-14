"use client"

import { cn } from "../lib/utils"
import { CheckCircle, XCircle, AlertCircle, Clock, Wifi, WifiOff } from "lucide-react"

const statusConfig = {
  online: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    dotColor: "bg-emerald-500",
    label: "Online",
    pulse: true,
  },
  offline: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    dotColor: "bg-red-500",
    label: "Offline",
    pulse: false,
  },
  unknown: {
    icon: AlertCircle,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    dotColor: "bg-amber-500",
    label: "Unknown",
    pulse: true,
  },
  checking: {
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    dotColor: "bg-blue-500",
    label: "Checking",
    pulse: true,
  },
}

export function StatusIndicator({
  status = "unknown",
  variant = "dot",
  size = "sm",
  showLabel = false,
  className,
  ...props
}) {
  const config = statusConfig[status] || statusConfig.unknown
  const Icon = config.icon

  const sizeClasses = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  const iconSizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  if (variant === "dot") {
    return (
      <div className={cn("flex items-center gap-2", className)} {...props}>
        <div
          className={cn("rounded-full", sizeClasses[size], config.dotColor, config.pulse && "animate-pulse")}
          style={
            config.pulse && status === "online"
              ? {
                  boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)",
                  animation: "pulse-green 2s infinite",
                }
              : undefined
          }
        />
        {showLabel && <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>}
      </div>
    )
  }

  if (variant === "icon") {
    return (
      <div className={cn("flex items-center gap-2", className)} {...props}>
        <Icon className={cn(iconSizeClasses[size], config.color)} />
        {showLabel && <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>}
      </div>
    )
  }

  if (variant === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
          config.bgColor,
          config.color,
          className,
        )}
        {...props}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full", config.dotColor, config.pulse && "animate-pulse")} />
        {config.label}
      </div>
    )
  }

  return null
}

export function NetworkStatusIndicator({ isOnline = true, className, ...props }) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
      <span className={cn("text-sm font-medium", isOnline ? "text-emerald-600" : "text-red-600")}>
        {isOnline ? "Connected" : "Disconnected"}
      </span>
    </div>
  )
}
