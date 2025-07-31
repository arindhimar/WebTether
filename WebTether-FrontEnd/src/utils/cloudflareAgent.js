// Utility functions for Cloudflare Worker agent validation and debugging

export const hasValidCloudflareAgent = (user) => {
  if (!user) return false

  const hasUrl = user.agent_url && user.agent_url.trim() !== ""
  const hasToken = user.replit_agent_token && user.replit_agent_token.trim() !== "" // Keep using JWT token

  return hasUrl && hasToken
}

export const getCloudflareAgentStatus = (user) => {
  if (!user) {
    return { configured: false, message: "User not loaded" }
  }

  const hasUrl = user.agent_url && user.agent_url.trim() !== ""
  const hasToken = user.replit_agent_token && user.replit_agent_token.trim() !== ""

  if (!hasUrl && !hasToken) {
    return { configured: false, message: "No Cloudflare Worker URL or token configured" }
  }

  if (!hasUrl) {
    return { configured: false, message: "Cloudflare Worker URL missing" }
  }

  if (!hasToken) {
    return { configured: false, message: "JWT token missing" }
  }

  return { configured: true, message: "Cloudflare Worker agent fully configured" }
}

export const debugCloudflareAgent = (user) => {
  console.log("=== Cloudflare Worker Agent Debug ===")
  console.log("User:", user)
  console.log("Agent URL:", user?.agent_url)
  console.log("JWT Token:", user?.replit_agent_token ? "Present" : "Missing")
  console.log("Has valid agent:", hasValidCloudflareAgent(user))
  console.log("Status:", getCloudflareAgentStatus(user))
  console.log("=====================================")
}
