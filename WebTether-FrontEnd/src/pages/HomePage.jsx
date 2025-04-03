"use client"

import React, { lazy, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"
import {
  Globe,
  Shield,
  BarChart3,
  Bell,
  ChevronDown,
  MousePointer,
  Sparkles,
  Rocket,
  Users,
  ArrowUpRight,
  User,
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"

// Lazy load components that aren't immediately visible
const LazyAboutMeSection = lazy(() => import("../components/home/AboutMeSection"))
const LazyInteractiveFeatureSection = lazy(() => import("../components/home/InteractiveFeatureSection"))

// Dashboard preview component (optimized SVG-based)
const DashboardPreview = ({ isHovered }) => {
  return (
    <div className="w-full h-[400px] bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center px-4 bg-muted/30">
        <div className="w-32 h-6 bg-primary/20 rounded-md"></div>
        <div className="ml-auto flex space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/20"></div>
          <div className="w-8 h-8 rounded-full bg-primary/20"></div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100%-3.5rem)]">
        {/* Stats cards */}
        <div className="col-span-12 grid grid-cols-4 gap-4 h-24">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`bg-background rounded-lg border border-border p-3 flex flex-col justify-between transition-colors ${isHovered && i === 1 ? "border-green-500/50 bg-green-500/5" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="w-20 h-4 bg-muted rounded"></div>
                <div className="w-6 h-6 rounded-full bg-primary/20"></div>
              </div>
              <div className="w-16 h-6 bg-primary/20 rounded-md mt-2"></div>
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="col-span-8 bg-background rounded-lg border border-border p-4 flex flex-col">
          <div className="flex justify-between mb-4">
            <div className="w-32 h-6 bg-muted rounded"></div>
            <div className="w-24 h-8 bg-primary/20 rounded-md"></div>
          </div>

          {/* Chart */}
          <div className="flex-1 bg-muted/20 rounded-md overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 500 200">
              <path
                d="M0,150 C50,120 100,180 150,120 C200,60 250,100 300,80 C350,60 400,90 450,70 L450,200 L0,200 Z"
                fill="rgba(59, 130, 246, 0.1)"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="2"
              />
              <path
                d="M0,150 C50,120 100,180 150,120 C200,60 250,100 300,80 C350,60 400,90 450,70"
                fill="none"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={isHovered ? "1000" : "0"}
                strokeDashoffset={isHovered ? "0" : "1000"}
                style={{
                  transition: "stroke-dashoffset 2s ease-in-out",
                }}
              />
              {isHovered &&
                [...Array(6)].map((_, i) => (
                  <circle
                    key={i}
                    cx={i * 90 + 50}
                    cy={[150, 120, 180, 120, 80, 70][i]}
                    r="4"
                    fill="white"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                  />
                ))}
            </svg>
          </div>

          {/* Table */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-muted/30 rounded flex items-center px-2">
                <div className="w-full h-3 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 grid gap-4">
          <div className="bg-background rounded-lg border border-border p-4">
            <div className="w-full h-4 bg-muted rounded mb-3"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                  <div className="w-full h-3 bg-muted/30 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-background rounded-lg border border-border p-4">
            <div className="w-full h-4 bg-muted rounded mb-3"></div>
            <div className="w-full h-24 bg-muted/20 rounded-md mb-2"></div>
            <div className="w-full h-3 bg-muted/30 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isHeroHovered, setIsHeroHovered] = useState(false)
  const [email, setEmail] = useState("")
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false)
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const aboutMeRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.5 })
  const isFeaturesInView = useInView(featuresRef, { once: false, amount: 0.2 })
  const isHowItWorksInView = useInView(howItWorksRef, { once: false, amount: 0.2 })

  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 0.5, 0])

  useEffect(() => {
    setMounted(true)

    if (isSignedIn) {
      navigate("/dashboard")
    }

    // Auto-rotate features every 3 seconds
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isSignedIn, navigate])

  if (isSignedIn) {
    return null
  }

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  const features = [
    {
      title: "Real-time Monitoring",
      description: "Track your websites' uptime and performance with second-by-second precision.",
      icon: Globe,
      color: "from-blue-500 to-cyan-400",
      demo: (
        <div className="w-full h-[300px] bg-card/50 rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <div className="w-32 h-6 bg-muted rounded"></div>
            <div className="w-24 h-8 bg-blue-500/20 rounded-md"></div>
          </div>
          <div className="h-[200px] bg-muted/20 rounded-md overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 500 200">
              <path
                d="M0,150 C50,120 100,180 150,120 C200,60 250,100 300,80 C350,60 400,90 450,70 L450,200 L0,200 Z"
                fill="rgba(59, 130, 246, 0.1)"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="2"
              />
              <path
                d="M0,150 C50,120 100,180 150,120 C200,60 250,100 300,80 C350,60 400,90 450,70"
                fill="none"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {[...Array(6)].map((_, i) => (
                <circle
                  key={i}
                  cx={i * 90 + 50}
                  cy={[150, 120, 180, 120, 80, 70][i]}
                  r="4"
                  fill="white"
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
          <div className="mt-4 flex justify-between">
            <div className="w-20 h-6 bg-muted/30 rounded"></div>
            <div className="w-20 h-6 bg-blue-500/20 rounded"></div>
          </div>
        </div>
      ),
    },
    {
      title: "Community Validation",
      description: "Our unique validator network ensures accurate monitoring from multiple locations.",
      icon: Shield,
      color: "from-purple-500 to-indigo-400",
      demo: (
        <div className="w-full h-[300px] bg-card/50 rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <div className="w-32 h-6 bg-muted rounded"></div>
            <div className="w-24 h-8 bg-purple-500/20 rounded-md"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 h-[200px]">
            <div className="bg-muted/20 rounded-md p-3">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 mr-2"></div>
                <div className="w-24 h-4 bg-muted rounded"></div>
              </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-6 bg-muted/30 rounded w-full"></div>
                ))}
              </div>
            </div>
            <div className="bg-muted/20 rounded-md flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-purple-500/10 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/30"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <div className="w-20 h-6 bg-muted/30 rounded"></div>
            <div className="w-20 h-6 bg-purple-500/20 rounded"></div>
          </div>
        </div>
      ),
    },
    {
      title: "Instant Alerts",
      description: "Get notified immediately when your websites experience issues.",
      icon: Bell,
      color: "from-amber-500 to-orange-400",
      demo: (
        <div className="w-full h-[300px] bg-card/50 rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <div className="w-32 h-6 bg-muted rounded"></div>
            <div className="w-24 h-8 bg-amber-500/20 rounded-md"></div>
          </div>
          <div className="space-y-3 h-[200px] overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted/20 rounded-md p-3 flex items-start">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 mr-3 flex-shrink-0"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted/30 rounded w-full"></div>
                  <div className="h-3 bg-muted/30 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <div className="w-20 h-6 bg-muted/30 rounded"></div>
            <div className="w-20 h-6 bg-amber-500/20 rounded"></div>
          </div>
        </div>
      ),
    },
    {
      title: "Detailed Analytics",
      description: "Gain insights with comprehensive performance metrics and visualizations.",
      icon: BarChart3,
      color: "from-emerald-500 to-green-400",
      demo: (
        <div className="w-full h-[300px] bg-card/50 rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <div className="w-32 h-6 bg-muted rounded"></div>
            <div className="w-24 h-8 bg-emerald-500/20 rounded-md"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 h-[200px]">
            <div className="bg-muted/20 rounded-md overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="20" />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.7)"
                  strokeWidth="20"
                  strokeDasharray="502"
                  strokeDashoffset="125"
                  transform="rotate(-90 100 100)"
                />
                <text x="100" y="110" textAnchor="middle" fontSize="24" fill="currentColor">
                  75%
                </text>
              </svg>
            </div>
            <div className="bg-muted/20 rounded-md p-3">
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="w-20 h-3 bg-muted rounded"></div>
                      <div className="w-8 h-3 bg-muted rounded"></div>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500/70 rounded-full"
                        style={{ width: `${[75, 45, 90, 60][i]}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <div className="w-20 h-6 bg-muted/30 rounded"></div>
            <div className="w-20 h-6 bg-emerald-500/20 rounded"></div>
          </div>
        </div>
      ),
    },
  ]

  const howItWorks = [
    {
      title: "Add Your Websites",
      description: "Simply enter your website URLs to start monitoring their performance and uptime.",
      icon: Globe,
    },
    {
      title: "Get Validated",
      description: "Our community of validators checks your websites from different locations worldwide.",
      icon: Shield,
    },
    {
      title: "Receive Insights",
      description: "View detailed reports and get alerts when issues are detected.",
      icon: BarChart3,
    },
    {
      title: "Become a Validator",
      description: "Join our community by validating other websites and earn rewards.",
      icon: Users,
    },
  ]

  const handleEarlyAccessSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would send this to your backend
    console.log("Early access requested for:", email)
    setIsEmailSubmitted(true)
    setEmail("")

    // Reset after 5 seconds
    setTimeout(() => {
      setIsEmailSubmitted(false)
    }, 5000)
  }

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className={`flex min-h-screen flex-col dark ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      {/* Hero Background with Parallax Effect */}
      <motion.div className="absolute inset-0 -z-10 overflow-hidden" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background/0 to-background/0"></div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-10"></div>

        {/* Animated particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/50"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <div className="rounded-full bg-gradient-to-r from-primary to-blue-400 p-1.5 shadow-glow">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">WebTether</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="text-sm font-medium transition-colors hover:text-primary nav-item"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(howItWorksRef)}
                className="text-sm font-medium transition-colors hover:text-primary nav-item"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection(aboutMeRef)}
                className="text-sm font-medium transition-colors hover:text-primary nav-item"
              >
                About Me
              </button>
              <Button asChild variant="ghost" className="animate-in-button">
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild variant="gradient" className="animate-in-button shadow-glow">
                <Link to="/sign-up">Sign Up</Link>
              </Button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section ref={heroRef} className="w-full py-12 md:py-24 lg:py-32 xl:py-36 relative overflow-hidden">
          <motion.div
            className="container px-4 md:px-6 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-4"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  <span>Coming Soon</span>
                </motion.div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  <motion.span
                    className="gradient-text block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                  >
                    Monitor Your Websites
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                  >
                    with Community Power
                  </motion.span>
                </h1>
                <motion.p
                  className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4"
                  initial={{ opacity: 0 }}
                  animate={isHeroInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.7, duration: 0.7 }}
                >
                  WebTether is revolutionizing website monitoring by combining real-time tracking with a
                  community-driven validation network. Get accurate insights from around the globe.
                </motion.p>
              </div>
              <motion.div
                className="space-x-4 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.9, duration: 0.7 }}
              >
                <Button
                  size="lg"
                  variant="gradient"
                  className="animate-in-button shadow-glow"
                  onClick={() => scrollToSection(aboutMeRef)}
                >
                  About Me
                  <User className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="animate-in-button border-primary/30 hover:border-primary"
                  onClick={() => scrollToSection(featuresRef)}
                >
                  Learn More
                </Button>
              </motion.div>

              {/* Interactive Hero Demo */}
              <motion.div
                className="mt-16 w-full max-w-5xl mx-auto"
                initial={{ opacity: 0, y: 40 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ delay: 1.1, duration: 0.7 }}
                onHoverStart={() => setIsHeroHovered(true)}
                onHoverEnd={() => setIsHeroHovered(false)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative rounded-xl border bg-card/50 shadow-xl backdrop-blur-sm overflow-hidden p-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-400/5"></div>

                  {/* Interactive dashboard preview */}
                  <div className="relative rounded-lg overflow-hidden bg-background/80 p-4">
                    <DashboardPreview isHovered={isHeroHovered} />

                    {/* Interactive elements that appear on hover */}
                    <AnimatePresence>
                      {isHeroHovered && (
                        <>
                          <motion.div
                            className="absolute top-1/4 left-1/4 bg-primary/90 text-white px-3 py-2 rounded-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="text-sm font-medium">Website Status: Online</p>
                          </motion.div>

                          <motion.div
                            className="absolute top-1/3 right-1/4 bg-green-500/90 text-white px-3 py-2 rounded-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <p className="text-sm font-medium">Response Time: 120ms</p>
                          </motion.div>

                          <motion.div
                            className="absolute bottom-1/3 left-1/3 bg-blue-500/90 text-white px-3 py-2 rounded-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          >
                            <p className="text-sm font-medium">Uptime: 99.9%</p>
                          </motion.div>

                          {/* Animated cursor */}
                          <motion.div
                            className="absolute"
                            initial={{ x: "70%", y: "30%" }}
                            animate={{
                              x: ["70%", "40%", "60%", "30%", "70%"],
                              y: ["30%", "50%", "70%", "40%", "30%"],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: "reverse",
                            }}
                          >
                            <MousePointer className="h-6 w-6 text-white drop-shadow-lg" />
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-md p-2 text-center">
                    <p className="text-sm font-medium">Interactive dashboard with real-time monitoring</p>
                  </div>
                </div>
              </motion.div>

              {/* Mouse scroll indicator */}
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                <div className="w-8 h-12 rounded-full border-2 border-primary/50 flex justify-center">
                  <motion.div
                    className="w-1 h-2 bg-primary rounded-full mt-2"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="w-full py-20 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-mesh opacity-10"></div>
          <div className="container px-4 md:px-6 relative">
            <motion.div
              className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-glow">
                  Features
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tighter sm:text-5xl gradient-text">
                  Powerful Monitoring Tools
                </h2>
                <p className="max-w-[85%] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                  Discover how WebTether revolutionizes website monitoring with these powerful features
                </p>
              </div>
            </motion.div>

            <div className="mt-16 grid gap-12 lg:grid-cols-2">
              {/* Feature tabs */}
              <motion.div
                className="flex flex-col space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={isFeaturesInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={`relative overflow-hidden rounded-lg border p-4 cursor-pointer transition-all ${
                      activeFeature === index ? "bg-gradient-to-r border-primary shadow-lg" : "bg-card hover:bg-card/80"
                    }`}
                    onClick={() => setActiveFeature(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full p-2 bg-gradient-to-r ${feature.color}`}>
                        <feature.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">{feature.title}</h3>
                        <p className="text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeFeature === index && (
                      <motion.div
                        className="absolute left-0 top-0 h-full w-1 bg-primary"
                        layoutId="activeFeatureIndicator"
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Feature demo/preview */}
              <motion.div
                className="relative rounded-xl border bg-card shadow-lg overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={isFeaturesInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={`text-xl font-bold bg-gradient-to-r ${features[activeFeature].color} bg-clip-text text-transparent`}
                      >
                        {features[activeFeature].title}
                      </h3>
                      <div className={`rounded-full p-1.5 bg-gradient-to-r ${features[activeFeature].color}`}>
                        {React.createElement(features[activeFeature].icon, { className: "h-4 w-4 text-white" })}
                      </div>
                    </div>

                    <div className="rounded-lg overflow-hidden border">
                      {typeof features[activeFeature].demo === "string" ? (
                        <img
                          src={features[activeFeature].demo || "/placeholder.svg"}
                          alt={features[activeFeature].title}
                          className="w-full h-auto"
                        />
                      ) : (
                        features[activeFeature].demo
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" className="text-xs">
                        Learn more
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section ref={howItWorksRef} className="w-full py-20 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <motion.div
              className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-glow">
                  How It Works
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tighter sm:text-5xl gradient-text">
                  Simple & Powerful
                </h2>
                <p className="max-w-[85%] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                  WebTether combines simplicity with powerful technology to provide the best monitoring experience
                </p>
              </div>
            </motion.div>

            <div className="mt-16 relative">
              {/* Connecting line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/80 via-primary/50 to-primary/10 hidden md:block"></div>

              <div className="grid gap-12 relative">
                {howItWorks.map((step, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  >
                    <div
                      className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8`}
                    >
                      {/* Step number with icon */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-400 shadow-glow z-10">
                          <step.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -inset-4 bg-primary/10 rounded-full animate-pulse opacity-0 md:opacity-70"></div>
                      </div>

                      {/* Content */}
                      <div className={`flex-1 ${index % 2 === 0 ? "md:text-left" : "md:text-right"} text-center`}>
                        <h3 className="text-2xl font-bold gradient-text mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Call to action */}
            <motion.div
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                size="lg"
                variant="gradient"
                className="animate-in-button shadow-glow"
                onClick={() => scrollToSection(aboutMeRef)}
              >
                Join the Revolution
                <Rocket className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* About Me Section */}
        <section ref={aboutMeRef} className="w-full py-20 bg-muted/30 relative overflow-hidden">
          <Suspense
            fallback={
              <div className="w-full h-[600px] flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
            }
          >
            <LazyAboutMeSection />
          </Suspense>
        </section>

        {/* Interactive Feature Section */}
        <Suspense
          fallback={
            <div className="w-full py-20 h-[400px] flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          }
        >
          <LazyInteractiveFeatureSection />
        </Suspense>
      </main>

      <footer className="border-t py-8 md:py-12 bg-card/50 backdrop-blur-sm">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-primary to-blue-400 p-1.5 shadow-glow">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">WebTether</span>
          </div>
          <div className="flex gap-6">
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors nav-item">
              Terms
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors nav-item">
              Privacy
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors nav-item">
              Contact
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} WebTether. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

