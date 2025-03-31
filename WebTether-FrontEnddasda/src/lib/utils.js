export function cn(...classes) {
    return classes.filter(Boolean).join(" ")
  }
  
  export function formatNumber(number) {
    return new Intl.NumberFormat().format(number)
  }
  
  export function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }
  
  export function formatTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }).format(new Date(date))
  }
  
  export function formatDateTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }).format(new Date(date))
  }
  
  export function getStatusColor(status) {
    switch (status.toLowerCase()) {
      case "up":
      case "online":
      case "active":
        return "text-green-500"
      case "down":
      case "offline":
      case "inactive":
        return "text-red-500"
      case "degraded":
      case "slow":
        return "text-yellow-500"
      default:
        return "text-muted-foreground"
    }
  }
  
  export function getStatusBgColor(status) {
    switch (status.toLowerCase()) {
      case "up":
      case "online":
      case "active":
        return "bg-green-500/10"
      case "down":
      case "offline":
      case "inactive":
        return "bg-red-500/10"
      case "degraded":
      case "slow":
        return "bg-yellow-500/10"
      default:
        return "bg-muted"
    }
  }
  
  