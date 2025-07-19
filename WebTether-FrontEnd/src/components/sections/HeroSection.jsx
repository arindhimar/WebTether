"use client"

import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ArrowRight, Github } from "lucide-react"
import { AnimatedCounter } from "../interactive/AnimatedCounter"
import { FloatingParticles } from "../interactive/FloatingParticles"

export function HeroSection() {
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
    <section id="home" className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-background/0 to-background/0" />
      <FloatingParticles />

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          className="flex flex-col items-center space-y-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="mb-4">
              🚀 Decentralized Monitoring Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Decentralized Uptime Monitoring
              </span>
              <br />
              <span className="text-foreground">with Validator Rewards</span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Track uptime with real validators. Reward effort. Build trust. Join the future of website monitoring
              powered by human intelligence and blockchain incentives.
            </p>
          </motion.div>

          {/* Interactive Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 py-8">
            <div className="text-center">
              <AnimatedCounter end={1247} duration={2000} />
              <p className="text-sm text-muted-foreground mt-1">Active Validators</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={15420} duration={2000} />
              <p className="text-sm text-muted-foreground mt-1">Websites Monitored</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={99.9} duration={2000} suffix="%" />
              <p className="text-sm text-muted-foreground mt-1">Uptime Accuracy</p>
            </div>
          </motion.div>

          <motion.div className="flex flex-col gap-2 min-[400px]:flex-row pt-4" variants={itemVariants}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="group bg-transparent">
              <Github className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              GitHub Repo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
