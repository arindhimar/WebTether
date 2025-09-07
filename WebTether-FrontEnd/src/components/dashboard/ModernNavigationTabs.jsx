"use client"

import { useTheme } from "../../contexts/ThemeContext"

const ModernNavigationTabs = ({ activeTab = "Overview", onTabChange }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const tabs = [
    { id: "Overview", label: "Overview", icon: "📊" },
    { id: "Available Sites", label: "Available Sites", icon: "🌐" },
    { id: "Recent Activity", label: "Recent Activity", icon: "🕒" },
    { id: "Wallet", label: "Wallet", icon: "💳" },
    { id: "Settings", label: "Settings", icon: "⚙️" },
  ]

  return (
    <div className="mb-8">
      <div
        className={`p-1 rounded-2xl backdrop-blur-sm border ${
          isDark ? "bg-slate-800/30 border-blue-800/30" : "bg-white/50 border-blue-200/50"
        }`}
      >
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 rounded-xl font-medium text-sm transition-all hover:scale-105 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : isDark
                    ? "text-slate-300 hover:text-white hover:bg-blue-800/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-blue-100"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default ModernNavigationTabs
