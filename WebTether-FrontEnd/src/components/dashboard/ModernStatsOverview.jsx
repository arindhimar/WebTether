"use client"

import { useTheme } from "../../contexts/ThemeContext"

const ModernStatsOverview = ({ data, loading, refreshing, onRefresh }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const calculateStats = () => {
    if (loading && !data.lastFetch) {
      return [
        { title: "Total Websites", value: "...", change: "Loading...", icon: "🌐" },
        { title: "Active Sites", value: "...", subtitle: "Loading...", icon: "✅" },
        { title: "Total Pings", value: "...", subtitle: "Loading...", icon: "📊" },
        { title: "Earnings", value: "...", subtitle: "Loading...", icon: "💰" },
        { title: "Uptime", value: "...", subtitle: "Loading...", icon: "📈" },
        { title: "Response Time", value: "...", subtitle: "Loading...", icon: "⚡" },
      ]
    }

    const { websites = [], pings = [], balance } = data

    // Calculate active sites (assuming sites with recent pings are active)
    const recentPings = pings.filter((ping) => {
      const pingDate = new Date(ping.timestamp || ping.created_at)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return pingDate > dayAgo
    })

    const activeSiteIds = new Set(recentPings.map((ping) => ping.wid))
    const activeSites = activeSiteIds.size
    const onlineSites = recentPings.filter((ping) => ping.is_up).length

    // Calculate total pings in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentPingsCount = pings.filter((ping) => {
      const pingDate = new Date(ping.timestamp || ping.created_at)
      return pingDate > thirtyDaysAgo
    }).length

    // Calculate earnings from balance
    const totalSpent = balance?.total_spent ? Number.parseFloat(balance.total_spent) : 0
    const earnings = totalSpent * 0.1 // Assuming 10% commission on spent amounts

    // Calculate uptime percentage
    const totalPings = pings.length
    const successfulPings = pings.filter((ping) => ping.is_up).length
    const uptimePercentage = totalPings > 0 ? ((successfulPings / totalPings) * 100).toFixed(1) : "100"

    // Calculate average response time
    const pingsWithLatency = pings.filter((ping) => ping.latency_ms && ping.latency_ms > 0)
    const avgResponseTime =
      pingsWithLatency.length > 0
        ? Math.round(pingsWithLatency.reduce((sum, ping) => sum + ping.latency_ms, 0) / pingsWithLatency.length)
        : 0

    return [
      {
        title: "Total Websites",
        value: websites.length.toString(),
        change: `+${Math.max(0, websites.length - 1)} this week`,
        icon: "🌐",
      },
      {
        title: "Active Sites",
        value: activeSites.toString(),
        subtitle: `${onlineSites} online`,
        icon: "✅",
      },
      {
        title: "Total Pings",
        value: recentPingsCount.toString(),
        subtitle: "Last 30 days",
        icon: "📊",
      },
      {
        title: "Earnings",
        value: `$${earnings.toFixed(2)}`,
        subtitle: "Total earned",
        icon: "💰",
      },
      {
        title: "Uptime",
        value: `${uptimePercentage}%`,
        subtitle: "Average",
        icon: "📈",
      },
      {
        title: "Response Time",
        value: `${avgResponseTime}ms`,
        subtitle: "Average",
        icon: "⚡",
      },
    ]
  }

  const stats = calculateStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div className="md:col-span-2 lg:col-span-3 flex justify-between items-center mb-4">
        <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Overview Statistics</h2>
        <button
          onClick={onRefresh}
          disabled={loading || refreshing}
          className={`px-4 py-2 rounded-lg transition-all ${
            loading || refreshing ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
          } ${isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {refreshing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Refreshing...</span>
            </div>
          ) : loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </div>
          )}
        </button>
      </div>

      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-6 rounded-2xl backdrop-blur-sm border transition-all hover:scale-105 ${
            isDark ? "bg-slate-800/30 border-blue-800/30" : "bg-white/50 border-blue-200/50"
          } ${loading && !data.lastFetch ? "animate-pulse" : ""}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">{stat.icon}</div>
          </div>

          <div className="space-y-2">
            <h3 className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{stat.title}</h3>
            <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{stat.value}</div>
            {(stat.change || stat.subtitle) && (
              <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-600"}`}>{stat.change || stat.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ModernStatsOverview
