"use client"

import { createContext, useContext } from "react"
import { useBackendAuth } from "../hooks/use-backend-auth"

// Create context
const BackendAuthContext = createContext(null)

// Provider component
export function BackendAuthProvider({ children }) {
  const auth = useBackendAuth()

  return <BackendAuthContext.Provider value={auth}>{children}</BackendAuthContext.Provider>
}

// Hook for using the auth context
export function useBackendAuthContext() {
  const context = useContext(BackendAuthContext)
  if (!context) {
    throw new Error("useBackendAuthContext must be used within a BackendAuthProvider")
  }
  return context
}

