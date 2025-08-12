"use client"

import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ArrowRight, Sparkles, Zap, Shield, Globe, TrendingUp } from "lucide-react"
import { AnimatedCounter } from "../interactive/AnimatedCounter"

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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 mesh-gradient" />

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 blur-xl"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute top-40 right-20 w-32 h-32 rounded-full bg-chart-2/10 blur-xl"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 1 }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-chart-3/10 blur-xl"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 2 }}
      />

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          className="flex flex-col items-center space-y-8 text-center max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium bg-secondary/80 backdrop-blur-sm border border-border/50 shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Decentralized Website Monitoring
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="gradient-text">WebTether</span>
              <br />
              <span className="text-foreground">Earn While You Monitor</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance">
              Revolutionary blockchain-powered website monitoring. Pay once to list your site, then earn ETH rewards
              from every validator ping. The more reliable your website, the more you earn.
            </p>
          </motion.div>

          {/* Value Proposition Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="glass-card p-6 rounded-xl text-center group hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Pay to List</h3>
              <p className="text-sm text-muted-foreground">
                One-time payment of 0.001 ETH to add your website to our global monitoring network
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl text-center group hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Earn from Pings</h3>
              <p className="text-sm text-muted-foreground">
                Receive 0.0001 ETH for every validator ping. More uptime means more earnings
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl text-center group hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Global Coverage</h3>
              <p className="text-sm text-muted-foreground">
                Decentralized validators ensure reliable monitoring from every corner of the world
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 py-8 w-full max-w-2xl">
            <div className="text-center">
              <AnimatedCounter end={1247} duration={2000} />
              <p className="text-sm text-muted-foreground mt-1">Active Validators</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={15420} duration={2000} />
              <p className="text-sm text-muted-foreground mt-1">Websites Listed</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={2.4} duration={2000} suffix=" ETH" />
              <p className="text-sm text-muted-foreground mt-1">Total Earned</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-glow transition-all duration-300 group"
            >
              Start Earning Today
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold border-2 hover:bg-accent hover:text-accent-foreground transition-all duration-300 group bg-transparent"
            >
              <Globe className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              View Live Network
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="flex items-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-chart-3 rounded-full animate-pulse" />
              <span>50+ Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-chart-4 rounded-full animate-pulse" />
              <span>24/7 Monitoring</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
