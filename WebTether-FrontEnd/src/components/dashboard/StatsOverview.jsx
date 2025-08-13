"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { TrendingUp, Globe, Zap, CheckCircle, Target, Coins, BarChart3 } from "lucide-react"

export default function StatsOverview({ websites = [], pings = [], user }) {
  const [stats, setStats] = useState({
    totalWebsites: 0,
    totalPings: 0,
    successRate: 0,
    totalEarnings: 0,
    avgResponseTime: 0,
    onlineWebsites: 0,
  })

  useEffect(() => {
    calculateStats()
  }, [websites, pings, user])

  const calculateStats = () => {
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
      })
    }
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, gradient, trend, badge }) => (
    <Card className="floating-card overflow-hidden">
      <CardContent className="p-0">
        <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <p className="metric-label">{title}</p>
              <div className="flex items-baseline gap-2">
                <p className="metric-value">{value}</p>
                {badge && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {badge}
                  </Badge>
                )}
              </div>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          {trend && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (!user) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="floating-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 loading-shimmer" />
                    <Skeleton className="h-8 w-16 loading-shimmer" />
                    <Skeleton className="h-3 w-24 loading-shimmer" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-2xl loading-shimmer" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {user.isVisitor ? (
        // Validator Stats
        <>
          <MetricCard
            title="Validations"
            value={stats.totalPings}
            subtitle="Sites validated"
            icon={Target}
            gradient="from-violet-500 to-purple-600"
            trend="+12% this week"
          />
          <MetricCard
            title="Success Rate"
            value={`${Math.round(stats.successRate)}%`}
            subtitle="Successful pings"
            icon={CheckCircle}
            gradient="from-emerald-500 to-green-600"
            badge="Excellent"
          />
          <MetricCard
            title="Earnings"
            value={`${stats.totalEarnings.toFixed(3)}`}
            subtitle="ETH earned"
            icon={Coins}
            gradient="from-amber-500 to-orange-600"
            trend={`$${(stats.totalEarnings * 2000).toFixed(2)} USD`}
          />
          <MetricCard
            title="Response Time"
            value={`${stats.avgResponseTime}`}
            subtitle="ms average"
            icon={Zap}
            gradient="from-blue-500 to-cyan-600"
            badge="Fast"
          />
        </>
      ) : (
        // Website Owner Stats
        <>
          <MetricCard
            title="Websites"
            value={stats.totalWebsites}
            subtitle="Total monitored"
            icon={Globe}
            gradient="from-violet-500 to-purple-600"
            trend="+2 this month"
          />
          <MetricCard
            title="Online Sites"
            value={stats.onlineWebsites}
            subtitle={`${stats.totalWebsites - stats.onlineWebsites} offline`}
            icon={CheckCircle}
            gradient="from-emerald-500 to-green-600"
            badge="Healthy"
          />
          <MetricCard
            title="Total Pings"
            value={stats.totalPings}
            subtitle="Validation checks"
            icon={BarChart3}
            gradient="from-blue-500 to-cyan-600"
            trend="+156 today"
          />
          <MetricCard
            title="Uptime"
            value={`${Math.round(stats.successRate)}%`}
            subtitle="Overall availability"
            icon={TrendingUp}
            gradient="from-amber-500 to-orange-600"
            badge="Stable"
          />
        </>
      )}
    </div>
  )
}
