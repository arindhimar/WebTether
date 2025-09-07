"use client"

import { useTheme } from "../../contexts/ThemeContext"

const ModernActivitySection = ({ transactions = [], pings = [], loading }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const generateActivities = () => {
    if (loading) {
      return [
        { id: 1, type: "loading", message: "Loading activities...", time: "...", loading: true },
        { id: 2, type: "loading", message: "Loading activities...", time: "...", loading: true },
        { id: 3, type: "loading", message: "Loading activities...", time: "...", loading: true },
      ]
    }

    const activities = []

    // Add ping activities
    pings.slice(0, 5).forEach((ping, index) => {
      const pingDate = new Date(ping.timestamp || ping.created_at)
      const timeAgo = getTimeAgo(pingDate)

      activities.push({
        id: `ping-${ping.pid || index}`,
        type: ping.is_up ? "validation" : "error",
        message: ping.is_up ? "Site validation successful" : "Site validation failed",
        websiteId: ping.wid?.toString() || "Unknown",
        reward: ping.fee_paid_numeric ? `+${ping.fee_paid_numeric} ETH` : "+0.0002 ETH",
        time: timeAgo,
        duration: ping.latency_ms ? `${ping.latency_ms}ms` : "N/A",
        status: ping.is_up ? "success" : "error",
      })
    })

    // Add transaction activities
    transactions.slice(0, 3).forEach((tx, index) => {
      const txDate = new Date(tx.timestamp || tx.created_at)
      const timeAgo = getTimeAgo(txDate)

      activities.push({
        id: `tx-${tx.tx_hash || index}`,
        type: "transaction",
        message: "Payment processed",
        websiteId: tx.tx_hash?.slice(0, 8) || "Unknown",
        reward: `-${tx.amount || "0.0002"} ETH`,
        time: timeAgo,
        duration: tx.type || "ping_payment",
        status: tx.status || "success",
      })
    })

    // Sort by most recent and limit to 6 items
    return activities
      .sort((a, b) => {
        if (a.loading || b.loading) return 0
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
      })
      .slice(0, 6)
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMinutes > 0) return `${diffMinutes}m ago`
    return "Just now"
  }

  const getActivityIcon = (type, status) => {
    if (type === "validation" && status === "success") {
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    }
    if (type === "error" || status === "error") {
      return (
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    }
    if (type === "transaction") {
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
      )
    }
    return (
      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    )
  }

  const activities = generateActivities()

  return (
    <div
      className={`p-6 rounded-2xl backdrop-blur-sm border transition-all ${
        isDark ? "bg-slate-800/30 border-blue-800/30" : "bg-white/50 border-blue-200/50"
      } ${loading ? "animate-pulse" : ""}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Activity</h3>
        <span className={`text-sm ${isDark ? "text-blue-300" : "text-blue-600"}`}>
          Recent updates • {activities.length} items
        </span>
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start space-x-3 p-4 rounded-xl transition-all hover:scale-[1.02] ${
                isDark ? "bg-slate-700/50" : "bg-blue-50/50"
              } ${activity.loading ? "animate-pulse" : ""}`}
            >
              {getActivityIcon(activity.type, activity.status)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                    {activity.message}
                  </p>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{activity.time}</span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div
                    className={`flex items-center space-x-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    <span>
                      {activity.type === "transaction"
                        ? `TX: ${activity.websiteId}`
                        : `Website ID: ${activity.websiteId}`}
                    </span>
                    <span>•</span>
                    <span>{activity.duration}</span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      activity.reward?.startsWith("+") ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {activity.reward}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No recent activity</p>
          </div>
        )}
      </div>

      <button
        className={`w-full mt-6 text-sm font-medium transition-all hover:scale-105 ${
          isDark ? "text-blue-300 hover:text-white" : "text-blue-600 hover:text-blue-700"
        }`}
        disabled={loading}
      >
        View all activity
      </button>
    </div>
  )
}

export default ModernActivitySection
