"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "../components/layout/Header"
import { Footer } from "../components/layout/Footer"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { useAuth } from "../contexts/AuthContext"
import {
  Globe,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  Coins,
  Monitor,
  Network,
  TrendingUp,
  Shield,
  Eye,
  ChevronDown,
  Star,
  ArrowUp,
} from "lucide-react"

export default function WebTetherLanding() {
  const { login } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState({})
  const [activeDemo, setActiveDemo] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [earnings, setEarnings] = useState({ sites: 0, pings: 0, earned: 0 })
  const [isCalculating, setIsCalculating] = useState(false)
  const heroRef = useRef(null)

  // Mouse tracking for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }))
        })
      },
      { threshold: 0.1 },
    )

    document.querySelectorAll("[id]").forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  // Demo cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Animated counter for earnings
  useEffect(() => {
    const interval = setInterval(() => {
      setEarnings((prev) => ({
        sites: Math.min(prev.sites + 1, 1247),
        pings: Math.min(prev.pings + 23, 89432),
        earned: Math.min(prev.earned + 0.001, 12.847),
      }))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle CTA clicks
  const handleGetStarted = () => {
    // Navigate to dashboard or show signup
    window.history.pushState({}, "", "/dashboard")
    window.location.reload()
  }

  const handleBecomeValidator = () => {
    // Show validator signup flow
    login({ isVisitor: true })
  }

  const handleCalculateEarnings = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
      scrollToSection("examples")
    }, 2000)
  }

  const demoSteps = [
    {
      title: "Sarah lists her blog",
      description: "Pays 0.001 ETH to join the network",
      icon: Globe,
      color: "text-blue-400",
    },
    {
      title: "Alex validates the site",
      description: "Checks uptime, earns 0.0001 ETH",
      icon: Eye,
      color: "text-green-400",
    },
    {
      title: "Everyone wins",
      description: "Sarah gets monitoring, Alex gets paid",
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsl(var(--primary) / 0.1) 0%, transparent 50%)`,
        }}
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div
            className="absolute inset-0 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:50px_50px]"
            style={{
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Live stats ticker */}
          <div className="inline-flex items-center gap-4 bg-card/50 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">Live Network Stats:</span>
            </div>
            <div className="text-sm font-mono">
              <span className="text-primary">{earnings.sites}</span> sites
            </div>
            <div className="text-sm font-mono">
              <span className="text-primary">{earnings.pings.toLocaleString()}</span> pings
            </div>
            <div className="text-sm font-mono">
              <span className="text-primary">{earnings.earned.toFixed(3)}</span> ETH earned
            </div>
          </div>

          {/* Main headline */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-muted-foreground">Website monitoring</span>
              <span className="block bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                that pays you back
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The first monitoring network where listing your website becomes an investment. Pay once, earn forever as
              validators check your uptime.
            </p>
          </div>

          {/* Interactive demo cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            {demoSteps.map((step, index) => (
              <Card
                key={index}
                className={`relative p-6 bg-card/30 backdrop-blur-sm border transition-all duration-500 cursor-pointer hover:scale-105 ${
                  activeDemo === index ? "border-primary bg-card/50 scale-105" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setActiveDemo(index)}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 transition-colors duration-300 ${
                    activeDemo === index ? "bg-primary/20" : ""
                  }`}
                >
                  <step.icon className={`w-6 h-6 ${activeDemo === index ? step.color : "text-muted-foreground"}`} />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>

                {activeDemo === index && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
                )}
              </Card>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="px-8 py-4 text-lg group transition-all duration-300 hover:scale-105"
            >
              Start Earning Today
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleBecomeValidator}
              className="px-8 py-4 text-lg bg-transparent"
            >
              Become a Validator
            </Button>
          </div>

          {/* Learn more button */}
          <Button
            variant="ghost"
            onClick={() => scrollToSection("problem")}
            className="group animate-bounce hover:animate-none"
          >
            <span className="mr-2">Learn How It Works</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </Button>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Blockchain Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              <span className="text-sm">Decentralized Network</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Instant Payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div
            className={`transition-all duration-1000 ${isVisible.problem ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Monitoring shouldn't be a <span className="text-destructive">money pit</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Traditional monitoring services charge you monthly fees forever. What if instead, your monitoring
                investment could pay you back?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                    <span className="text-destructive font-bold">×</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Monthly subscription fees</h3>
                    <p className="text-muted-foreground">Pay $20-100+ every month, forever</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                    <span className="text-destructive font-bold">×</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Centralized single points of failure</h3>
                    <p className="text-muted-foreground">When their servers go down, you're blind</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                    <span className="text-destructive font-bold">×</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Limited monitoring locations</h3>
                    <p className="text-muted-foreground">Miss regional outages and performance issues</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Card className="bg-gradient-to-br from-card to-muted p-8 border hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-destructive mb-2">$1,200</div>
                    <div className="text-muted-foreground mb-4">Typical yearly monitoring cost</div>
                    <div className="text-sm text-muted-foreground">For a basic plan with limited features</div>
                  </div>
                </Card>

                {/* Floating cost indicators */}
                <div className="absolute -top-4 -right-4 bg-destructive/20 rounded-full px-3 py-1 text-sm text-destructive animate-bounce">
                  +$100/mo
                </div>
                <div
                  className="absolute -bottom-4 -left-4 bg-destructive/20 rounded-full px-3 py-1 text-sm text-destructive animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >
                  Forever
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section id="solution" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className={`transition-all duration-1000 ${isVisible.solution ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What if monitoring <span className="text-green-500">paid you instead?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                WebTether flips the model. You invest once in the network, then earn rewards every time someone monitors
                your site.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Coins className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Pay once, earn forever</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      List your website for just 0.001 ETH (~$3). Every time a validator checks your site, you earn
                      0.0001 ETH back. Break even after just 10 pings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Network className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Truly decentralized</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Real humans around the world validate your site's uptime. No single point of failure, no corporate
                      overlords deciding your fate.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Community-driven quality</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Validators earn more for accurate monitoring and can be flagged for poor performance. The
                      community ensures quality through economic incentives.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive earnings calculator */}
              <div className="relative">
                <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30 p-8 hover:shadow-lg transition-shadow">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-green-500 mb-2">Earnings Calculator</h3>
                    <p className="text-muted-foreground">See your potential returns</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-green-500/20">
                      <span>Initial investment</span>
                      <span className="text-destructive font-mono">-0.001 ETH</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-green-500/20">
                      <span>After 50 pings</span>
                      <span className="text-green-500 font-mono">+0.004 ETH</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-green-500/20">
                      <span>After 100 pings</span>
                      <span className="text-green-500 font-mono">+0.009 ETH</span>
                    </div>

                    <div className="flex justify-between items-center py-3 font-bold">
                      <span>After 1000 pings</span>
                      <span className="text-green-500 font-mono text-lg">+0.099 ETH</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCalculateEarnings}
                    disabled={isCalculating}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Calculating...
                      </>
                    ) : (
                      "Calculate My Earnings"
                    )}
                  </Button>

                  <div className="mt-6 p-4 bg-card/50 rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      Popular sites get pinged 10-50 times per day. Your monitoring pays for itself and keeps earning.
                    </p>
                  </div>
                </Card>

                {/* Floating profit indicator */}
                <div className="absolute -top-4 -right-4 bg-green-500/20 rounded-full px-4 py-2 text-green-500 animate-pulse">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Profit!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Interactive Timeline */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div
            className={`transition-all duration-1000 ${isVisible["how-it-works"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Simple as <span className="text-primary">1, 2, 3</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                No complex setup, no monthly fees, no vendor lock-in. Just smart economics that work for everyone.
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 rounded-full opacity-30" />

              <div className="space-y-16">
                {/* Step 1 */}
                <div className="flex items-center gap-8 lg:gap-16">
                  <div className="flex-1 text-right">
                    <Card className="bg-card/50 backdrop-blur-sm p-6 border hover:border-blue-500/50 transition-colors hover:shadow-lg">
                      <h3 className="text-2xl font-bold mb-3 text-blue-500">List Your Website</h3>
                      <p className="text-muted-foreground mb-4">
                        Pay 0.001 ETH to add your site to our decentralized monitoring network. That's about $3 - less
                        than a coffee.
                      </p>
                      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Takes 2 minutes</span>
                      </div>
                    </Card>
                  </div>

                  <div className="relative z-10 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl hover:scale-110 transition-transform cursor-pointer">
                    1
                  </div>

                  <div className="flex-1">
                    <div className="w-64 h-32 bg-card/30 rounded-lg border flex items-center justify-center hover:border-blue-500/50 transition-colors">
                      <Globe className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-8 lg:gap-16">
                  <div className="flex-1">
                    <div className="w-64 h-32 bg-card/30 rounded-lg border flex items-center justify-center ml-auto hover:border-purple-500/50 transition-colors">
                      <Eye className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="relative z-10 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl hover:scale-110 transition-transform cursor-pointer">
                    2
                  </div>

                  <div className="flex-1">
                    <Card className="bg-card/50 backdrop-blur-sm p-6 border hover:border-purple-500/50 transition-colors hover:shadow-lg">
                      <h3 className="text-2xl font-bold mb-3 text-purple-500">Validators Monitor</h3>
                      <p className="text-muted-foreground mb-4">
                        Real people around the world ping your website to check if it's up. They earn rewards for
                        accurate monitoring.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Global validator network</span>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-8 lg:gap-16">
                  <div className="flex-1 text-right">
                    <Card className="bg-card/50 backdrop-blur-sm p-6 border hover:border-green-500/50 transition-colors hover:shadow-lg">
                      <h3 className="text-2xl font-bold mb-3 text-green-500">You Earn Rewards</h3>
                      <p className="text-muted-foreground mb-4">
                        Every ping earns you 0.0001 ETH. The more reliable your site, the more validators will check it,
                        the more you earn.
                      </p>
                      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                        <Coins className="w-4 h-4" />
                        <span>Automatic payments</span>
                      </div>
                    </Card>
                  </div>

                  <div className="relative z-10 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl hover:scale-110 transition-transform cursor-pointer">
                    3
                  </div>

                  <div className="flex-1">
                    <div className="w-64 h-32 bg-card/30 rounded-lg border flex items-center justify-center hover:border-green-500/50 transition-colors">
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Examples Section */}
      <section id="examples" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className={`transition-all duration-1000 ${isVisible.examples ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Real people, <span className="text-yellow-500">real earnings</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how different types of websites perform on our network
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Blog example */}
              <Card className="bg-card/30 border p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Monitor className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Tech Blog</h3>
                    <p className="text-sm text-muted-foreground">Personal website</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily pings</span>
                    <span>15-25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly earnings</span>
                    <span className="text-green-500">~0.05 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Break even</span>
                    <span className="text-primary">Day 1</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    "My blog monitoring pays for my hosting now!" - Sarah K.
                  </div>
                </div>
              </Card>

              {/* E-commerce example */}
              <Card className="bg-card/30 border p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Online Store</h3>
                    <p className="text-sm text-muted-foreground">E-commerce site</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily pings</span>
                    <span>40-60</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly earnings</span>
                    <span className="text-green-500">~0.15 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Break even</span>
                    <span className="text-primary">Day 1</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    "Better uptime monitoring than my old $50/mo service" - Mike R.
                  </div>
                </div>
              </Card>

              {/* SaaS example */}
              <Card className="bg-card/30 border p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">SaaS Platform</h3>
                    <p className="text-sm text-muted-foreground">Business app</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily pings</span>
                    <span>80-120</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly earnings</span>
                    <span className="text-green-500">~0.3 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Break even</span>
                    <span className="text-primary">Day 1</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    "Replaced 3 monitoring services with this one" - Lisa T.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-6 bg-gradient-to-br from-primary/10 to-purple-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to turn monitoring into <span className="text-green-500">profit?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the first monitoring network that pays you back. List your website today and start earning from every
              ping.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-8 py-4 text-lg group transition-all duration-300 hover:scale-105"
              >
                List Your Website
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBecomeValidator}
                className="px-8 py-4 text-lg hover:scale-105 transition-transform bg-transparent"
              >
                Become a Validator
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No monthly fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Instant setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Earn from day one</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:scale-110 transition-all duration-300"
          size="sm"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}

      <Footer />
    </div>
  )
}
