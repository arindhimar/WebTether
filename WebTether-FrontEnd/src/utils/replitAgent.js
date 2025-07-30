// Utility functions for Replit agent status checking

export const hasValidReplitAgent = (user) => {
  if (!user) return false

  // Check if user has both URL and token configured
  const hasUrl = user.replit_agent_url && user.replit_agent_url.trim() !== ""
  const hasToken = user.replit_agent_token && user.replit_agent_token.trim() !== ""

  return hasUrl && hasToken
}

export const getReplitAgentStatus = (user) => {
  if (!user) {
    return {
      configured: false,
      message: "User not found",
      missingFields: ["user"],
    }
  }

  const missingFields = []

  if (!user.replit_agent_url || user.replit_agent_url.trim() === "") {
    missingFields.push("URL")
  }

  if (!user.replit_agent_token || user.replit_agent_token.trim() === "") {
    missingFields.push("Token")
  }

  if (missingFields.length === 0) {
    return {
      configured: true,
      message: "Replit agent is properly configured",
      missingFields: [],
    }
  }

  return {
    configured: false,
    message: `Missing: ${missingFields.join(", ")}`,
    missingFields,
  }
}

export const debugReplitAgent = (user) => {
  console.log("=== Replit Agent Debug Info ===")
  console.log("User object:", user)
  console.log("Agent URL:", user?.replit_agent_url)
  console.log("Agent Token:", user?.replit_agent_token ? "Present" : "Missing")
  console.log("Has valid agent:", hasValidReplitAgent(user))
  console.log("Status:", getReplitAgentStatus(user))
  console.log("===============================")
}
