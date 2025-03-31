"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = "dark", storageKey = "webtether-ui-theme" }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey)
      return storedTheme || defaultTheme
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    // Add a transition class before changing the theme
    root.classList.add("theme-transition")

    // Remove existing theme classes
    root.classList.remove("light", "dark")

    // Add the new theme class
    root.classList.add(theme)

    // Store the theme preference
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, theme)
    }

    // Remove the transition class after a short delay
    const transitionTimeout = setTimeout(() => {
      root.classList.remove("theme-transition")
    }, 300)

    return () => clearTimeout(transitionTimeout)
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (newTheme) => setTheme(newTheme),
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

