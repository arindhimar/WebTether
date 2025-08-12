"use client"

import { motion } from "framer-motion"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Wallet, Users, TrendingUp, BarChart3, ArrowRight } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "List Your Website",
      description:
        "Pay a one-time fee of 0.001 ETH to add your website to our decentralized monitoring network. Your site becomes part of our global ecosystem.",
      icon: Wallet,
      color: "primary",
      details: ["One-time payment", "Instant activation", "Global coverage"],
    },
    {
      step: "02",
      title: "Validators Monitor",
      description:
        "Our network of human validators regularly ping your website from different locations worldwide, checking uptime and performance metrics.",
      icon: Users,
      color: "chart-2",
      details: ["Human validators", "Multiple locations", "Real-time checks"],
    },
    {
      step: "03",
      title: "Earn from Pings",
      description:
        "Receive 0.0001 ETH for every successful ping validation. The more reliable your website, the more validators will check it.",
      icon: TrendingUp,
      color: "chart-3",
      details: ["Automatic payments", "Performance-based", "Passive income"],
    },
    {
      step: "04",
      title: "Track & Optimize",
      description:
        "Monitor your website's performance metrics, earnings, and uptime statistics through our comprehensive dashboard.",
      icon: BarChart3,
      color: "chart-4",
      details: ["Real-time analytics", "Performance insights", "Earnings tracking"],
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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
    <section id="how-it-works" className="py-24 lg:py-32 bg-muted/30">
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
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="gradient-text">Simple Process,</span>
              <br />
              <span className="text-foreground">Maximum Rewards</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4 text-balance">
              Our revolutionary model turns website monitoring into a profitable venture. List once, earn forever from
              validator pings.
            </p>
          </motion.div>
        </motion.div>

        <div className="grid gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`grid gap-8 lg:gap-12 items-center ${
                  index % 2 === 0 ? "lg:grid-cols-2" : "lg:grid-cols-2 lg:grid-flow-col-dense"
                }`}
              >
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className={`text-lg font-bold px-4 py-2 bg-${step.color}/10 border-${step.color}/20 text-${step.color}`}
                    >
                      {step.step}
                    </Badge>
                    <div className={`w-12 h-12 rounded-lg bg-${step.color}/10 flex items-center justify-center`}>
                      <step.icon className={`w-6 h-6 text-${step.color}`} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-bold">{step.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {step.details.map((detail, detailIndex) => (
                        <Badge key={detailIndex} variant="secondary" className="text-xs">
                          {detail}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual */}
                <div className={`${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <Card className="glass-card p-8 hover:shadow-glow transition-all duration-300 group">
                    <CardHeader className="text-center">
                      <div
                        className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-${step.color}/10 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <step.icon className={`h-10 w-10 text-${step.color}`} />
                      </div>
                      <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                      <CardDescription className="text-sm">Step {step.step} of our streamlined process</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-1/2 -bottom-6 transform -translate-x-1/2">
                  <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Earnings Example */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-20"
        >
          <Card className="glass-card p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 gradient-text">Earnings Potential</h3>
              <p className="text-muted-foreground">
                Real examples of how your investment grows with validator activity
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-destructive">-0.001 ETH</div>
                <div className="text-sm text-muted-foreground">Initial listing cost</div>
                <Badge variant="outline" className="text-xs">
                  One-time payment
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-chart-2">+0.01 ETH</div>
                <div className="text-sm text-muted-foreground">After 100 pings</div>
                <Badge variant="secondary" className="text-xs bg-chart-2/10 text-chart-2">
                  10x ROI
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-chart-3">+0.1 ETH</div>
                <div className="text-sm text-muted-foreground">After 1000 pings</div>
                <Badge variant="secondary" className="text-xs bg-chart-3/10 text-chart-3">
                  100x ROI
                </Badge>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent/50 rounded-lg text-center">
              <p className="text-sm text-accent-foreground">
                💡 <strong>Pro Tip:</strong> Higher uptime websites attract more validators, leading to more pings and
                higher earnings potential.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
