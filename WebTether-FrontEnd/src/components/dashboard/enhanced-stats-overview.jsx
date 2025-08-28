"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { StatusIndicator } from "../ui/status-indicator"
import { EnhancedTooltip } from "../ui/enhanced-tooltip"
import { TrendingUp, TrendingDown, Globe, Zap, CheckCircle, Target, Coins, BarChart3 } from "lucide-react"

export function EnhancedStatsOverview({ websites = [], pings = [], user }) {
  const [stats, setStats] = useState({
    totalWebsites: 0,
    totalPings: 0,
    successRate: 0,
    totalEarnings: 0,
    avgResponseTime: 0,
    onlineWebsites: 0,
    weeklyGrowth: 0,
    rank: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    calculateStats()
  }, [websites, pings, user])

  const calculateStats = () => {
    setIsLoading(true)

    setTimeout(() => {
      if (user?.isVisitor) {
        // Validator stats
        const userPings = pings.filter((ping) => ping.uid === user.id)
        const successfulPings = userPings.filter((ping) => ping.is_up)
        const totalResponseTime = userPings.reduce((sum, ping) => sum + (ping.latency_ms || 0), 0)

        setStats({
          totalWebsites: 0,
          totalPings: userPings.length,
          successRate: userPings.length > 0 ? (successfulPings.length / userPings.length) * 100 : 0,
          totalEarnings: userPings.length * 0.001,
          avgResponseTime: userPings.length > 0 ? Math.round(totalResponseTime / userPings.length) : 0,
          onlineWebsites: 0,
          weeklyGrowth: Math.random() * 20 + 5, // Mock growth
          rank: Math.floor(Math.random() * 100) + 1, // Mock rank
        })
      } else {
        // Website owner stats
        const userWebsites = websites.filter((website) => website.uid === user?.id)
        const websitePings = pings.filter((ping) => userWebsites.some((w) => w.wid === ping.wid))
        const successfulPings = websitePings.filter((ping) => ping.is_up)
        const onlineWebsites = userWebsites.filter((website) => website.status === "up").length
        const totalResponseTime = websitePings.reduce((sum, ping) => sum + (ping.latency_ms || 0), 0)

        setStats({
          totalWebsites: userWebsites.length,
          totalPings: websitePings.length,
          successRate: websitePings.length > 0 ? (successfulPings.length / websitePings.length) * 100 : 0,
          totalEarnings: websitePings.length * 0.0001,
          avgResponseTime: websitePings.length > 0 ? Math.round(totalResponseTime / websitePings.length) : 0,
          onlineWebsites: onlineWebsites,
          weeklyGrowth: Math.random() * 15 + 2,
          rank: 0,
        })
      }
      setIsLoading(false)
    }, 800)
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, gradient, trend, badge, status, tooltip, delay = 0 }) => (
    <Card
      className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden animate-scale-in hover:shadow-xl transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-0">
        <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
                {status && <StatusIndicator status={status} variant="dot" size="sm" />}
              </div>
              <div className="flex items-baseline gap-2">
                <EnhancedTooltip content={tooltip}>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-help">
                    {value}
                  </p>
                </EnhancedTooltip>
                {badge && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 animate-bounce-in bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  >
                    {badge}
                  </Badge>
                )}
              </div>
              {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>}
            </div>
            <div
              className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg transform hover:scale-110 transition-transform duration-200`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          {trend && (
            <div className="flex items-center gap-2 text-sm">
              {trend.value >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {Math.abs(trend.value).toFixed(1)}% {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20 loading-shimmer" />
                    <Skeleton className="h-8 w-16 loading-shimmer" />
                    <Skeleton className="h-3 w-24 loading-shimmer" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-2xl loading-shimmer" />
                </div>
                <Skeleton className="h-4 w-32 loading-shimmer" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {user?.isVisitor ? (
        // Validator Stats
        <>
          <MetricCard
            title="Total Validations"
            value={stats.totalPings.toLocaleString()}
            subtitle="Sites validated"
            icon={Target}
            gradient="from-blue-500 to-blue-600"
            trend={{ value: stats.weeklyGrowth, label: "this week" }}
            status="online"
            tooltip={`You've successfully validated ${stats.totalPings} websites`}
            delay={0}
          />
          <MetricCard
            title="Success Rate"
            value={`${Math.round(stats.successRate)}%`}
            subtitle="Successful validations"
            icon={CheckCircle}
            gradient="from-emerald-500 to-emerald-600"
            badge={stats.successRate >= 95 ? "Excellent" : stats.successRate >= 85 ? "Good" : "Fair"}
            status={stats.successRate >= 95 ? "online" : stats.successRate >= 85 ? "checking" : "offline"}
            tooltip={`${Math.round(stats.successRate)}% of your validations were successful`}
            delay={100}
          />
          <MetricCard
            title="Total Earnings"
            value={`${stats.totalEarnings.toFixed(3)}`}
            subtitle="ETH earned"
            icon={Coins}
            gradient="from-blue-500 to-blue-600"
            trend={{ value: 12.5, label: "this month" }}
            badge={`$${(stats.totalEarnings * 2000).toFixed(2)} USD`}
            tooltip={`You've earned ${stats.totalEarnings.toFixed(4)} ETH from validations`}
            delay={200}
          />
          <MetricCard
            title="Avg Response Time"
            value={`${stats.avgResponseTime}`}
            subtitle="ms average"
            icon={Zap}
            gradient="from-cyan-500 to-cyan-600"
            badge={stats.avgResponseTime < 200 ? "Fast" : stats.avgResponseTime < 500 ? "Good" : "Slow"}
            status={stats.avgResponseTime < 200 ? "online" : stats.avgResponseTime < 500 ? "checking" : "offline"}
            tooltip={`Average response time across all your validations`}
            delay={300}
          />
        </>
      ) : (
        // Website Owner Stats
        <>
          <MetricCard
            title="Total Websites"
            value={stats.totalWebsites}
            subtitle="Being monitored"
            icon={Globe}
            gradient="from-blue-500 to-blue-600"
            trend={{ value: stats.weeklyGrowth, label: "this month" }}
            tooltip={`You have ${stats.totalWebsites} websites being monitored`}
            delay={0}
          />
          <MetricCard
            title="Online Sites"
            value={stats.onlineWebsites}
            subtitle={`${stats.totalWebsites - stats.onlineWebsites} offline`}
            icon={CheckCircle}
            gradient="from-emerald-500 to-emerald-600"
            badge={stats.onlineWebsites === stats.totalWebsites ? "Perfect" : "Healthy"}
            status={stats.onlineWebsites === stats.totalWebsites ? "online" : "checking"}
            tooltip={`${stats.onlineWebsites} out of ${stats.totalWebsites} websites are currently online`}
            delay={100}
          />
          <MetricCard
            title="Total Validations"
            value={stats.totalPings.toLocaleString()}
            subtitle="Validation checks"
            icon={BarChart3}
            gradient="from-cyan-500 to-cyan-600"
            trend={{ value: 15.6, label: "today" }}
            tooltip={`Total number of validation checks performed on your websites`}
            delay={200}
          />
          <MetricCard
            title="Overall Uptime"
            value={`${Math.round(stats.successRate)}%`}
            subtitle="Availability score"
            icon={TrendingUp}
            gradient="from-blue-500 to-blue-600"
            badge={stats.successRate >= 99 ? "Excellent" : stats.successRate >= 95 ? "Good" : "Fair"}
            status={stats.successRate >= 99 ? "online" : stats.successRate >= 95 ? "checking" : "offline"}
            tooltip={`Overall uptime percentage across all your websites`}
            delay={300}
          />
        </>
      )}
    </div>
  )
}
