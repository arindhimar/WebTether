"use client"

import { motion } from "framer-motion"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Users, Coins, Flag, Shield, Clock, Lock } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      title: "Manual Ping System",
      description: "Human validators manually ping websites for accurate, real-world monitoring results.",
      icon: Users,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Incentive System",
      description: "Validators earn coins for their monitoring efforts, creating a sustainable ecosystem.",
      icon: Coins,
      color: "from-indigo-600 to-purple-600",
    },
    {
      title: "Flagging & Reports",
      description: "Community-driven quality control with validator reporting and flagging systems.",
      icon: Flag,
      color: "from-red-500 to-pink-400",
    },
    {
      title: "Role-Based Access",
      description: "Distinct user and validator roles with appropriate permissions and dashboards.",
      icon: Shield,
      color: "from-green-500 to-emerald-400",
    },
    {
      title: "Real-time Latency",
      description: "Track website performance with timestamp and latency data from multiple regions.",
      icon: Clock,
      color: "from-purple-500 to-indigo-400",
    },
    {
      title: "Secure Authentication",
      description: "Powered by Clerk for secure, seamless user authentication and management.",
      icon: Lock,
      color: "from-slate-500 to-gray-400",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="space-y-2" variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need for comprehensive website monitoring with human intelligence
            </p>
          </motion.div>

          <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-8" variants={containerVariants}>
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-600/20 group">
                  <CardHeader>
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
