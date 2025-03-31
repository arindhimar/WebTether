/**
 * Utility function to conditionally join class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

/**
 * Format a number with commas
 */
export function formatNumber(number) {
  return new Intl.NumberFormat().format(number)
}

/**
 * Format a date
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

/**
 * Format a time
 */
export function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  }).format(new Date(date))
}

/**
 * Format a date and time
 */
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

/**
 * Get color class based on status
 */
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

/**
 * Get background color class based on status
 */
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

