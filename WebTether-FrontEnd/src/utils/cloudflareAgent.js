// Utility functions for Cloudflare Worker agent management
export const isCloudflareWorkerConfigured = (user) => {
  return !!(user?.agent_url && user.agent_url.trim() !== "")
}

export const validateCloudflareWorkerUrl = (url) => {
  if (!url || url.trim() === "") {
    return { isValid: false, error: "Cloudflare Worker URL is required" }
  }

  try {
    const urlObj = new URL(url)
    if (!urlObj.hostname.includes("workers.dev") && !urlObj.hostname.includes("workers.cloudflare.com")) {
      return {
        isValid: false,
        error: "URL must be a valid Cloudflare Worker URL (*.workers.dev or *.workers.cloudflare.com)",
      }
    }
    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: "Invalid URL format" }
  }
}

export const getCloudflareWorkerStatus = (user) => {
  if (!user) return "not-configured"

  if (isCloudflareWorkerConfigured(user)) {
    return "configured"
  }

  return "not-configured"
}

export const debugCloudflareWorkerInfo = (user) => {
  console.log("=== Cloudflare Worker Debug Info ===")
  console.log("User object:", user)
  console.log("Agent URL:", user?.agent_url)
  console.log("Is configured:", isCloudflareWorkerConfigured(user))
  console.log("Status:", getCloudflareWorkerStatus(user))
  console.log("=====================================")
}
