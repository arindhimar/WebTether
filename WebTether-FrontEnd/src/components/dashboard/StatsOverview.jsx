"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Globe, TrendingUp, Coins, CheckCircle } from "lucide-react"

export function StatsOverview({ websites, pings, user }) {
  const totalWebsites = websites.length
  const averageUptime =
    websites.length > 0 ? (websites.reduce((sum, site) => sum + site.uptime, 0) / websites.length).toFixed(1) : 0
  const activeWebsites = websites.filter((site) => site.status === "up").length

  // Validator stats
  const userPings = pings.filter((ping) => ping.uid === user?.id)
  const successfulPings = userPings.filter((ping) => ping.is_up).length
  const validatorSuccessRate = userPings.length > 0 ? ((successfulPings / userPings.length) * 100).toFixed(1) : 0

  const stats = user?.isVisitor
    ? [
        {
          title: "Sites Validated",
          value: userPings.length,
          icon: Globe,
          color: "from-blue-500 to-cyan-400",
        },
        {
          title: "Success Rate",
          value: `${validatorSuccessRate}%`,
          icon: TrendingUp,
          color: "from-green-500 to-emerald-400",
        },
        {
          title: "Coins Earned",
          value: userPings.length * 5, // Assuming 5 coins per ping
          icon: Coins,
          color: "from-amber-500 to-orange-400",
        },
      ]
    : [
        {
          title: "Total Websites",
          value: totalWebsites,
          icon: Globe,
          color: "from-blue-500 to-cyan-400",
        },
        {
          title: "Average Uptime",
          value: `${averageUptime}%`,
          icon: TrendingUp,
          color: "from-green-500 to-emerald-400",
        },
        {
          title: "Active Sites",
          value: activeWebsites,
          icon: CheckCircle,
          color: "from-purple-500 to-indigo-400",
        },
      ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
