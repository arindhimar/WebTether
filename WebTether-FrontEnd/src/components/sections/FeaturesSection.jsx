"use client"

import { motion } from "framer-motion"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Users, Coins, Shield, Globe, Zap, BarChart3, Lock, Sparkles } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      title: "Human Validators",
      description:
        "Real people manually ping websites for accurate, intelligent monitoring that automated systems can't match.",
      icon: Users,
      color: "primary",
      benefits: ["Real-world testing", "Intelligent analysis", "Human insight"],
    },
    {
      title: "Earn While Listed",
      description:
        "Revolutionary model where website owners earn ETH rewards from validator pings instead of paying monthly fees.",
      icon: Coins,
      color: "chart-2",
      benefits: ["Passive income", "Performance-based", "No monthly fees"],
    },
    {
      title: "Blockchain Security",
      description:
        "All transactions and rewards are secured by blockchain technology, ensuring transparent and immutable records.",
      icon: Shield,
      color: "chart-3",
      benefits: ["Immutable records", "Transparent payments", "Decentralized trust"],
    },
    {
      title: "Global Coverage",
      description:
        "Validators from around the world provide comprehensive monitoring coverage across different regions and time zones.",
      icon: Globe,
      color: "chart-4",
      benefits: ["50+ countries", "24/7 monitoring", "Regional insights"],
    },
    {
      title: "Real-time Analytics",
      description: "Advanced dashboard with live performance metrics, uptime statistics, and earnings tracking.",
      icon: BarChart3,
      color: "chart-5",
      benefits: ["Live metrics", "Historical data", "Performance insights"],
    },
    {
      title: "Instant Rewards",
      description: "Automatic ETH payments for every successful ping validation, with real-time balance updates.",
      icon: Zap,
      color: "primary",
      benefits: ["Instant payments", "Auto-distribution", "Real-time updates"],
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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  }

  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants}>
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="gradient-text">Powerful Features</span>
              <br />
              <span className="text-foreground">Built for Success</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4 text-balance">
              Everything you need for comprehensive website monitoring with human intelligence and blockchain-powered
              rewards.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full glass-card hover:shadow-glow transition-all duration-300 group border-2 hover:border-primary/20">
                <CardHeader className="p-6">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-${feature.color}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                  </div>

                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>

                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <Badge key={benefitIndex} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Highlight */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-20"
        >
          <Card className="glass-card p-8 max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-4">
              <span className="gradient-text">Enterprise-Grade Security</span>
            </h3>

            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Built on blockchain technology with end-to-end encryption, multi-signature wallets, and decentralized
              architecture for maximum security and reliability.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">256-bit</div>
                <div className="text-sm text-muted-foreground">Encryption</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-chart-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime SLA</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-chart-3">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-chart-4">SOC 2</div>
                <div className="text-sm text-muted-foreground">Compliant</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
