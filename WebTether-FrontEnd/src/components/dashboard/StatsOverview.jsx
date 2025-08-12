"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Globe, TrendingUp, Wallet, CheckCircle, Activity, Users } from "lucide-react"

export function StatsOverview({ websites, pings, user }) {
  const totalWebsites = websites.length
  const websitesWithPings = websites.filter((site) => site.pingCount > 0)
  const averageUptime =
    websitesWithPings.length > 0
      ? websitesWithPings.reduce((sum, site) => sum + site.uptimeValue, 0) / websitesWithPings.length
      : 0
  const activeWebsites = websites.filter((site) => site.status === "up").length
  const totalPings = websites.reduce((sum, site) => sum + site.pingCount, 0)
  const totalEarnings = totalPings * 0.0001
  const listingCosts = totalWebsites * 0.001
  const netEarnings = totalEarnings - listingCosts

  const userPings = pings.filter((ping) => ping.uid === user?.id)
  const successfulPings = userPings.filter((ping) => ping.is_up).length
  const validatorSuccessRate = userPings.length > 0 ? (successfulPings / userPings.length) * 100 : 0
  const validatorEarnings = userPings.length * 0.0001

  const stats = user?.isVisitor
    ? [
        {
          title: "Sites Validated",
          value: userPings.length.toLocaleString(),
          icon: Globe,
          color: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-800 dark:text-blue-200",
        },
        {
          title: "Success Rate",
          value: `${validatorSuccessRate.toFixed(1)}%`,
          icon: TrendingUp,
          color: "from-green-500 to-green-600",
          bgColor: "bg-green-50 dark:bg-green-950/20",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-800 dark:text-green-200",
        },
        {
          title: "ETH Earned",
          value: validatorEarnings.toFixed(4),
          icon: Wallet,
          color: "from-amber-500 to-orange-500",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-200 dark:border-amber-800",
          textColor: "text-amber-800 dark:text-amber-200",
        },
        {
          title: "Network Rank",
          value: "#47",
          icon: Users,
          color: "from-purple-500 to-purple-600",
          bgColor: "bg-purple-50 dark:bg-purple-950/20",
          borderColor: "border-purple-200 dark:border-purple-800",
          textColor: "text-purple-800 dark:text-purple-200",
        },
      ]
    : [
        {
          title: "Websites",
          value: totalWebsites.toLocaleString(),
          icon: Globe,
          color: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-800 dark:text-blue-200",
        },
        {
          title: "Total Pings",
          value: totalPings.toLocaleString(),
          icon: Activity,
          color: "from-purple-500 to-purple-600",
          bgColor: "bg-purple-50 dark:bg-purple-950/20",
          borderColor: "border-purple-200 dark:border-purple-800",
          textColor: "text-purple-800 dark:text-purple-200",
        },
        {
          title: "Net Earnings",
          value: `${netEarnings >= 0 ? "+" : ""}${netEarnings.toFixed(4)} ETH`,
          icon: Wallet,
          color: netEarnings >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600",
          bgColor: netEarnings >= 0 ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20",
          borderColor:
            netEarnings >= 0 ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800",
          textColor: netEarnings >= 0 ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200",
        },
        {
          title: "Avg Uptime",
          value: `${averageUptime.toFixed(1)}%`,
          icon: CheckCircle,
          color: "from-cyan-500 to-cyan-600",
          bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
          borderColor: "border-cyan-200 dark:border-cyan-800",
          textColor: "text-cyan-800 dark:text-cyan-200",
        },
      ]

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card
            className={`hover:shadow-md transition-all duration-200 border-0 shadow-sm ${stat.bgColor} ${stat.borderColor}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className="h-4 w-4 text-current" />
                </div>
                <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                  {stat.title}
                </Badge>
              </div>
              <div className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
