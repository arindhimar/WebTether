"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { LoginDialog } from "../components/auth/LoginDialog"
import { SignupDialog } from "../components/auth/SignupDialog"
import { ThemeToggle } from "../components/ui/theme-toggle"
import {
  Globe,
  Shield,
  ArrowRight,
  DollarSign,
  ChevronUp,
  Menu,
  X,
  Rocket,
  Network,
  Sparkles,
  CheckCircle,
  Eye,
  Users,
  Clock,
  Star,
  Coins,
  MapPin,
  Signal,
  BarChart3,
  Layers,
  Gauge,
} from "lucide-react"

export default function WebTetherLanding() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const [showValidatorSignup, setShowValidatorSignup] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activePings, setActivePings] = useState([])
  const [globalStats, setGlobalStats] = useState({
    validators: 247,
    websites: 1892,
    pings: 45672,
    earnings: 12.45,
  })

  useEffect(() => {
    const locations = [
      { id: 1, name: "New York", x: 25, y: 40, country: "USA", region: "Americas" },
      { id: 2, name: "London", x: 50, y: 35, country: "UK", region: "Europe" },
      { id: 3, name: "Tokyo", x: 85, y: 45, country: "Japan", region: "Asia" },
      { id: 4, name: "Sydney", x: 90, y: 75, country: "Australia", region: "Oceania" },
      { id: 5, name: "São Paulo", x: 35, y: 70, country: "Brazil", region: "Americas" },
      { id: 6, name: "Mumbai", x: 75, y: 55, country: "India", region: "Asia" },
      { id: 7, name: "Lagos", x: 52, y: 60, country: "Nigeria", region: "Africa" },
      { id: 8, name: "Berlin", x: 52, y: 32, country: "Germany", region: "Europe" },
      { id: 9, name: "Singapore", x: 80, y: 58, country: "Singapore", region: "Asia" },
      { id: 10, name: "Toronto", x: 22, y: 38, country: "Canada", region: "Americas" },
      { id: 11, name: "Dubai", x: 65, y: 50, country: "UAE", region: "Middle East" },
      { id: 12, name: "Seoul", x: 87, y: 42, country: "South Korea", region: "Asia" },
    ]

    const interval = setInterval(() => {
      const randomLocation = locations[Math.floor(Math.random() * locations.length)]
      const newPing = {
        ...randomLocation,
        id: Date.now(),
        timestamp: Date.now(),
        status: Math.random() > 0.05 ? "success" : "warning",
        responseTime: Math.floor(Math.random() * 200) + 50,
      }

      setActivePings((prev) => [...prev.slice(-10), newPing])
    }, 600)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalStats((prev) => ({
        validators: Math.min(prev.validators + Math.floor(Math.random() * 3) + 1, 500),
        websites: Math.min(prev.websites + Math.floor(Math.random() * 5) + 2, 2500),
        pings: prev.pings + Math.floor(Math.random() * 50) + 25,
        earnings: prev.earnings + Math.random() * 0.1,
      }))
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleGetStarted = () => {
    if (user) {
      window.location.href = "/dashboard"
    } else {
      setShowSignupDialog(true)
    }
  }

  const handleBecomeValidator = () => {
    if (user) {
      window.location.href = "/dashboard?view=settings"
    } else {
      setShowValidatorSignup(true)
      setShowSignupDialog(true)
    }
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold gradient-text">WebTether</span>
                <span className="text-xs text-muted-foreground -mt-1">Decentralized Monitoring</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {[
                { label: "How it Works", id: "how-it-works" },
                { label: "Network", id: "network" },
                { label: "Earnings", id: "earnings" },
                { label: "Join Beta", id: "beta" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <Button onClick={() => (window.location.href = "/dashboard")} className="btn-primary">
                  Dashboard
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowLoginDialog(true)}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="btn-primary interactive-hover">
                    Join Beta
                  </Button>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center space-x-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass-effect border-t border-border/20">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {[
                  { label: "How it Works", id: "how-it-works" },
                  { label: "Network", id: "network" },
                  { label: "Earnings", id: "earnings" },
                  { label: "Join Beta", id: "beta" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                {!user && (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-border/20">
                    <Button variant="ghost" onClick={() => setShowLoginDialog(true)} className="justify-start">
                      Sign In
                    </Button>
                    <Button onClick={handleGetStarted} className="btn-primary justify-start">
                      Join Beta
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-32 hero-gradient overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-accent/25 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-20 h-20 bg-secondary/15 rounded-full blur-xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left column - Content */}
              <div className="space-y-8 animate-slide-up">
                <Badge className="glass-effect border-primary/30 text-primary px-4 py-2 text-sm font-medium w-fit">
                  <Rocket className="w-4 h-4 mr-2" />
                  Revolutionary Web3 Technology
                </Badge>

                <div className="space-y-6">
                  <h1 className="heading-xl">
                    <span className="gradient-text">Get Paid</span>
                    <br />
                    <span className="text-foreground">For Being Monitored</span>
                  </h1>

                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    The world's first decentralized monitoring network where website owners{" "}
                    <span className="text-primary font-semibold">earn ETH</span> while getting monitored by a global
                    community of validators.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleGetStarted} size="lg" className="btn-primary group px-8 py-4 text-lg">
                    Start Earning Today
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>

                  <Button
                    onClick={handleBecomeValidator}
                    variant="outline"
                    size="lg"
                    className="btn-glass group px-8 py-4 text-lg bg-transparent"
                  >
                    <Shield className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Become Validator
                  </Button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{globalStats.validators}</div>
                    <div className="text-sm text-muted-foreground">Active Validators</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{globalStats.websites}</div>
                    <div className="text-sm text-muted-foreground">Monitored Sites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">${globalStats.earnings.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Avg Daily Earnings</div>
                  </div>
                </div>
              </div>

              {/* Right column - Interactive Network Visualization */}
              <div className="relative animate-bounce-in" style={{ animationDelay: "0.3s" }}>
                <Card className="modern-card p-8">
                  <CardContent className="p-0">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Live Global Network
                      </h3>
                      <p className="text-muted-foreground text-sm">Real-time monitoring activity worldwide</p>
                    </div>

                    {/* Network visualization */}
                    <div className="relative w-full h-80 glass-effect rounded-2xl overflow-hidden border border-primary/20">
                      {/* World map grid */}
                      <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <pattern id="worldGrid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.3" />
                            </pattern>
                          </defs>
                          <rect width="100" height="100" fill="url(#worldGrid)" />
                        </svg>
                      </div>

                      {/* Active ping locations */}
                      {activePings.map((ping, index) => (
                        <div
                          key={ping.id}
                          className="absolute w-4 h-4 -translate-x-2 -translate-y-2"
                          style={{
                            left: `${ping.x}%`,
                            top: `${ping.y}%`,
                            animationDelay: `${index * 0.1}s`,
                          }}
                        >
                          <div
                            className={`w-4 h-4 rounded-full animate-ping ${ping.status === "success" ? "bg-success" : "bg-warning"}`}
                          />
                          <div
                            className={`absolute inset-0 w-4 h-4 rounded-full ${ping.status === "success" ? "bg-success/60" : "bg-warning/60"}`}
                          />

                          {/* Tooltip */}
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="glass-effect px-3 py-2 rounded-lg border border-border/20 text-xs whitespace-nowrap">
                              <div className="font-medium text-foreground">{ping.name}</div>
                              <div className="text-muted-foreground">{ping.responseTime}ms</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Connection lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>
                        {activePings.slice(0, 5).map((ping, index) => {
                          const nextPing = activePings[(index + 1) % Math.min(activePings.length, 5)]
                          if (!nextPing) return null
                          return (
                            <line
                              key={`line-${ping.id}`}
                              x1={`${ping.x}%`}
                              y1={`${ping.y}%`}
                              x2={`${nextPing.x}%`}
                              y2={`${nextPing.y}%`}
                              stroke="url(#connectionGradient)"
                              strokeWidth="1.5"
                              className="animate-pulse"
                              strokeDasharray="4,4"
                            />
                          )
                        })}
                      </svg>

                      {/* Status indicator */}
                      <div className="absolute top-4 right-4 status-up">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse mr-2"></div>
                        Network Online
                      </div>
                    </div>

                    {/* Live stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center glass-effect p-3 rounded-lg">
                        <div className="text-lg font-bold text-primary">{globalStats.pings.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Signal className="w-3 h-3" />
                          Pings Today
                        </div>
                      </div>
                      <div className="text-center glass-effect p-3 rounded-lg">
                        <div className="text-lg font-bold text-accent">99.9%</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Gauge className="w-3 h-3" />
                          Uptime
                        </div>
                      </div>
                      <div className="text-center glass-effect p-3 rounded-lg">
                        <div className="text-lg font-bold text-secondary">47ms</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          Avg Response
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6 text-foreground">How WebTether Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three simple steps to start earning from your website monitoring
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: Globe,
                  title: "Add Your Website",
                  description:
                    "Register your website in our decentralized network. No complex setup required - just provide your URL and you're ready to go.",
                  color: "from-primary to-primary/80",
                },
                {
                  step: "02",
                  icon: Users,
                  title: "Validators Monitor",
                  description:
                    "Global validators continuously ping your website, checking uptime, performance, and security. They earn rewards for their service.",
                  color: "from-accent to-accent/80",
                },
                {
                  step: "03",
                  icon: Coins,
                  title: "You Get Paid",
                  description:
                    "Receive ETH payments for participating in the network. The more reliable your site, the more you earn from the monitoring ecosystem.",
                  color: "from-success to-success/80",
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <Card className="modern-card h-full">
                    <CardContent className="p-8 text-center">
                      <div className="relative mb-6">
                        <div
                          className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto shadow-glow`}
                        >
                          <item.icon className="w-10 h-10 text-white" />
                        </div>
                        <Badge className="absolute -top-2 -right-2 bg-background border-2 border-primary text-primary font-bold px-2 py-1">
                          {item.step}
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-bold mb-4 text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>

                  {/* Connection arrow */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="network" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6 text-foreground">Global Validator Network</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powered by a decentralized network of validators ensuring 24/7 monitoring coverage
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left - Network stats */}
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Shield, label: "Active Validators", value: "247+", color: "text-primary" },
                  { icon: MapPin, label: "Global Locations", value: "50+", color: "text-accent" },
                  { icon: Clock, label: "Average Response", value: "47ms", color: "text-success" },
                  { icon: BarChart3, label: "Network Uptime", value: "99.9%", color: "text-secondary" },
                ].map((stat, index) => (
                  <Card key={index} className="modern-card">
                    <CardContent className="p-6 text-center">
                      <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                      <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="modern-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Validator Benefits
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Earn ETH rewards for monitoring websites",
                      "Contribute to global web infrastructure",
                      "Flexible participation - monitor when you want",
                      "Transparent reward distribution",
                      "Build reputation in the network",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right - Validator map */}
            <div className="relative">
              <Card className="modern-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6 text-foreground text-center">Live Validator Activity</h3>

                  <div className="relative w-full h-96 glass-effect rounded-2xl overflow-hidden border border-primary/20">
                    {/* Validator locations */}
                    {[
                      { name: "North America", x: 20, y: 30, count: 89 },
                      { name: "Europe", x: 50, y: 25, count: 76 },
                      { name: "Asia", x: 80, y: 40, count: 82 },
                      { name: "South America", x: 30, y: 70, count: 23 },
                      { name: "Africa", x: 55, y: 60, count: 18 },
                      { name: "Oceania", x: 85, y: 75, count: 12 },
                    ].map((region, index) => (
                      <div
                        key={index}
                        className="absolute group cursor-pointer"
                        style={{ left: `${region.x}%`, top: `${region.y}%` }}
                      >
                        <div className="relative">
                          <div className="w-6 h-6 bg-primary rounded-full animate-pulse shadow-glow"></div>
                          <div className="absolute inset-0 w-6 h-6 bg-primary/30 rounded-full animate-ping"></div>

                          {/* Tooltip */}
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="glass-effect px-3 py-2 rounded-lg border border-border/20 text-xs whitespace-nowrap">
                              <div className="font-medium text-foreground">{region.name}</div>
                              <div className="text-muted-foreground">{region.count} validators</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <defs>
                          <pattern id="validatorGrid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                            <circle cx="5" cy="5" r="0.5" fill="currentColor" opacity="0.3" />
                          </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#validatorGrid)" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="earnings" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6 text-foreground">Earning Potential</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your website monitoring from a cost center into a revenue stream
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Earnings breakdown */}
              <div className="space-y-8">
                <Card className="modern-card">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-success" />
                      Website Owner Earnings
                    </h3>

                    <div className="space-y-6">
                      {[
                        {
                          metric: "Base Monitoring Reward",
                          amount: "$5-15",
                          period: "per day",
                          description: "Earn for participating in the network",
                        },
                        {
                          metric: "Uptime Bonus",
                          amount: "$2-8",
                          period: "per day",
                          description: "Extra rewards for high availability",
                        },
                        {
                          metric: "Performance Bonus",
                          amount: "$1-5",
                          period: "per day",
                          description: "Fast response times = more rewards",
                        },
                      ].map((earning, index) => (
                        <div key={index} className="flex items-center justify-between p-4 glass-effect rounded-lg">
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">{earning.metric}</div>
                            <div className="text-sm text-muted-foreground">{earning.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-success">{earning.amount}</div>
                            <div className="text-xs text-muted-foreground">{earning.period}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Potential Monthly Earnings</span>
                        <span className="text-xl font-bold text-success">$240-840</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on average website performance and network participation
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="modern-card">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                      <Shield className="w-6 h-6 text-primary" />
                      Validator Earnings
                    </h3>

                    <div className="space-y-4">
                      {[
                        { metric: "Per Website Monitored", amount: "$0.10-0.50", period: "per ping" },
                        { metric: "Accuracy Bonus", amount: "$5-20", period: "per day" },
                        { metric: "Network Contribution", amount: "$10-50", period: "per week" },
                      ].map((earning, index) => (
                        <div key={index} className="flex items-center justify-between p-3 glass-effect rounded-lg">
                          <span className="text-foreground">{earning.metric}</span>
                          <div className="text-right">
                            <div className="font-bold text-primary">{earning.amount}</div>
                            <div className="text-xs text-muted-foreground">{earning.period}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right - Earnings calculator */}
              <div className="space-y-8">
                <Card className="modern-card">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-6 text-foreground text-center">Earnings Calculator</h3>

                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold gradient-text mb-2">
                          ${(globalStats.earnings * 30).toFixed(0)}
                        </div>
                        <div className="text-muted-foreground">Estimated Monthly Earnings</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 glass-effect rounded-lg">
                          <div className="text-2xl font-bold text-primary">{globalStats.earnings.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Daily Average</div>
                        </div>
                        <div className="text-center p-4 glass-effect rounded-lg">
                          <div className="text-2xl font-bold text-accent">{(globalStats.earnings * 7).toFixed(0)}</div>
                          <div className="text-sm text-muted-foreground">Weekly Total</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base Monitoring</span>
                          <span className="text-foreground">$8.50/day</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uptime Bonus (99.9%)</span>
                          <span className="text-foreground">$3.95/day</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-border/20 pt-2">
                          <span className="font-semibold text-foreground">Total Daily</span>
                          <span className="font-bold text-success">${globalStats.earnings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="modern-card">
                  <CardContent className="p-6">
                    <h4 className="font-bold mb-4 text-foreground flex items-center gap-2">
                      <Star className="w-4 h-4 text-warning" />
                      Why You Earn More
                    </h4>
                    <div className="space-y-3">
                      {[
                        "Network effects increase rewards over time",
                        "Higher uptime = exponentially higher rewards",
                        "Early adopters get bonus multipliers",
                        "Referral bonuses for bringing new sites",
                      ].map((reason, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beta" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="modern-card shadow-glow">
              <CardContent className="p-12">
                <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>

                <h2 className="heading-md mb-6 text-foreground">Join the Beta Revolution</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Be among the first to experience the future of website monitoring and start earning from day one
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8 text-left max-w-2xl mx-auto">
                  {[
                    "Priority access to the platform",
                    "Exclusive early adopter rewards",
                    "Direct input on feature development",
                    "Lifetime discount on premium features",
                    "Special validator status opportunities",
                    "Community recognition as a pioneer",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                  <Button onClick={handleGetStarted} size="lg" className="btn-primary group px-8 py-4 text-lg">
                    Join Beta Waitlist
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                  <Button
                    onClick={handleBecomeValidator}
                    variant="outline"
                    size="lg"
                    className="btn-glass group px-8 py-4 text-lg bg-transparent"
                  >
                    <Shield className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    Become Pioneer Validator
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  No commitment required • Be notified when we launch • Shape the future of monitoring
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-16 border-t border-border/20 glass-effect">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-glow">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-2xl font-bold gradient-text">WebTether</span>
                <span className="text-sm text-muted-foreground -mt-1">Decentralized Monitoring Network</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 text-lg">
              Pioneering the future of decentralized website monitoring
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <span>© 2024 WebTether. Built for the</span>
              <span className="text-primary font-semibold">decentralized future</span>
            </div>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 w-14 h-14 glass-effect border border-primary/30 shadow-glow text-primary rounded-2xl transition-all duration-300 flex items-center justify-center group interactive-hover"
        >
          <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}

      {/* Dialogs */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onSwitchToSignup={() => {
          setShowLoginDialog(false)
          setShowSignupDialog(true)
        }}
      />
      <SignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        defaultIsValidator={showValidatorSignup}
        onSwitchToLogin={() => {
          setShowSignupDialog(false)
          setShowLoginDialog(true)
        }}
      />
    </div>
  )
}
