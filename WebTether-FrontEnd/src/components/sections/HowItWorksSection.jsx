"use client"

import { motion } from "framer-motion"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Globe, Users, BarChart3 } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      title: "Add a Website to Monitor",
      description: "Simply enter your website URL and configure monitoring preferences for comprehensive tracking.",
      icon: Globe,
    },
    {
      title: "Validators Ping Your Site",
      description: "Our global network of human validators manually check your website from different regions.",
      icon: Users,
    },
    {
      title: "Get Region-Aware Uptime Stats",
      description: "Receive detailed reports with timestamp, latency, and status data organized by geographic region.",
      icon: BarChart3,
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
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
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
                How It Works
              </span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Simple steps to get started with decentralized website monitoring
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 pt-8 w-full max-w-5xl">
            {steps.map((step, index) => (
              <motion.div key={index} className="relative" variants={itemVariants}>
                <Card className="h-full border-2 hover:border-blue-600/50 transition-all duration-300 group">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm font-medium text-blue-600 mb-2">Step {index + 1}</div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardHeader>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
