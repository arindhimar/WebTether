"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { LoginDialog } from "../components/auth/LoginDialog"
import { SignupDialog } from "../components/auth/SignupDialog"
import { useNavigate } from "react-router-dom"

const NewWebTetherLanding = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    pings: 46030,
    uptime: 99.9,
    avgResponse: 47,
  })

  const [activeStep, setActiveStep] = useState(0)
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [networkNodes, setNetworkNodes] = useState([])
  const [dailyVisitors, setDailyVisitors] = useState(1000)
  const [calculatedEarnings, setCalculatedEarnings] = useState({ eth: 0.85, usd: 2127.5 })

  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showSignupDialog, setShowSignupDialog] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        pings: prev.pings + Math.floor(Math.random() * 10),
        avgResponse: 45 + Math.floor(Math.random() * 10),
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ethPerPing = 0.00085 // ETH per ping
    const pingsPerVisitor = 0.8 // Average pings per visitor
    const ethPerDay = dailyVisitors * pingsPerVisitor * ethPerPing
    const ethToUsd = 2500 // Approximate ETH price

    setCalculatedEarnings({
      eth: Number.parseFloat(ethPerDay.toFixed(3)),
      usd: Number.parseFloat((ethPerDay * ethToUsd).toFixed(2)),
    })
  }, [dailyVisitors])

  const isDark = theme === "dark"

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard")
    } else {
      setShowSignupDialog(true)
    }
  }

  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate("/dashboard")
    } else {
      setShowLoginDialog(true)
    }
  }

  const handleSwitchToSignup = () => {
    setShowLoginDialog(false)
    setShowSignupDialog(true)
  }

  const handleSwitchToLogin = () => {
    setShowSignupDialog(false)
    setShowLoginDialog(true)
  }

  const features = [
    {
      icon: "💰",
      title: "Earn While Monitored",
      description: "Get paid in ETH for every ping your website receives from our validator network",
      stats: "Up to $50/day",
    },
    {
      icon: "🌐",
      title: "Global Network",
      description: "24/7 monitoring from validators across 50+ countries worldwide",
      stats: "99.9% Uptime",
    },
    {
      icon: "⚡",
      title: "Real-time Alerts",
      description: "Instant notifications when your site goes down or performance degrades",
      stats: "<30s Response",
    },
    {
      icon: "🔒",
      title: "Blockchain Security",
      description: "Transparent, immutable monitoring records stored on Ethereum",
      stats: "100% Transparent",
    },
  ]

  const steps = [
    {
      title: "Add Your Website",
      description: "Submit your website URL and configure monitoring preferences",
      icon: "🌐",
    },
    {
      title: "Validators Monitor",
      description: "Global network of validators ping your site and verify uptime",
      icon: "👥",
    },
    {
      title: "Earn ETH Rewards",
      description: "Receive automatic ETH payments for every successful monitoring ping",
      icon: "💎",
    },
  ]

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-100"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
          isDark ? "bg-slate-900/80 border-blue-800/30" : "bg-white/80 border-blue-200/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-blue-600" : "bg-blue-600"
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>WebTether</h1>
                <p className={`text-xs ${isDark ? "text-blue-300" : "text-blue-600"}`}>Decentralized Monitoring</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {["How it Works", "Network", "Earnings", "Join Beta"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={`text-sm font-medium transition-colors hover:scale-105 ${
                    isDark ? "text-blue-200 hover:text-white" : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Theme Toggle & CTA */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  isDark
                    ? "bg-blue-800/50 text-blue-200 hover:bg-blue-700/50"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                {isDark ? "☀️" : "🌙"}
              </button>
              {isAuthenticated ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${
                    isDark ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Dashboard
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSignIn}
                    className={`px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${
                      isDark
                        ? "text-blue-200 hover:text-white hover:bg-blue-800/50"
                        : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className={`px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${
                      isDark ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            {/* URL Input */}
            <div
              className={`p-1 rounded-2xl ${isDark ? "bg-slate-800/50" : "bg-white/70"} backdrop-blur-sm border ${
                isDark ? "border-blue-800/30" : "border-blue-200/50"
              }`}
            >
              <input
                type="url"
                placeholder="Enter your website URL"
                className={`w-full px-6 py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-slate-700/50 text-white placeholder-slate-400"
                    : "bg-white text-slate-900 placeholder-slate-500"
                }`}
              />
            </div>

            {/* Hero Text */}
            <div className="space-y-6">
              <h1
                className={`text-5xl lg:text-6xl font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Get Paid
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  For Being
                </span>
                <br />
                Monitored
              </h1>

              <p className={`text-xl leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                The world's first decentralized monitoring network where website owners earn ETH while getting monitored
                by a global community of validators.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all hover:scale-105 shadow-lg"
              >
                Start Earning Today →
              </button>
              <button
                onClick={handleGetStarted}
                className={`px-8 py-4 font-semibold rounded-xl border-2 transition-all hover:scale-105 ${
                  isDark
                    ? "border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-slate-900"
                    : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                }`}
              >
                ○ Become Validator
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>Beta</div>
                <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Launch Phase</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>50+</div>
                <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Countries Ready</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  {calculatedEarnings.eth} ETH
                </div>
                <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Potential Daily Earnings
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Live Network */}
          <div className="space-y-6">
            <div
              className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark ? "bg-slate-800/30 border-blue-800/30" : "bg-white/50 border-blue-200/50"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Live Global Network
                  </h3>
                </div>
                <span className={`text-sm ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                  Real-time monitoring activity worldwide
                </span>
              </div>

              {/* Network Visualization */}
              <div
                className={`h-64 rounded-xl border-2 border-dashed relative overflow-hidden ${
                  isDark ? "border-blue-800/50 bg-slate-900/30" : "border-blue-200/50 bg-blue-50/30"
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Network Visualization</div>
                </div>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-500 rounded-full animate-ping"
                    style={{
                      left: `${20 + i * 10}%`,
                      top: `${30 + (i % 3) * 20}%`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDark
                      ? "bg-green-900/30 text-green-400 border border-green-800/50"
                      : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  Network Online
                </span>
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-xl backdrop-blur-sm border ${
                  isDark ? "bg-slate-800/30 border-blue-800/30" : "bg-white/50 border-blue-200/50"
                }`}
              >
                <div className={`text-2xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  {stats.pings.toLocaleString()}
                </div>
                <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>📊 Pings Today</div>
              </div>
              <div
                className={`p-4 rounded-xl backdrop-blur-sm border ${
                  isDark ? "bg-slate-800/30 border-blue-800/30" : "bg-white/50 border-blue-200/50"
                }`}
              >
                <div className={`text-2xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  {stats.uptime}%
                </div>
                <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>⚡ Uptime</div>
              </div>
              <div
                className={`p-4 rounded-xl backdrop-blur-sm border ${
                  isDark ? "bg-slate-800/30 border-blue-800/30" : "bg-white/50 border-blue-200/50"
                }`}
              >
                <div className={`text-2xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  {stats.avgResponse}ms
                </div>
                <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>⏱️ Avg Response</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className={`py-20 ${isDark ? "bg-slate-800/30" : "bg-blue-50/50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>How It Works</h2>
            <p className={`text-xl ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Three simple steps to start earning from your website
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                  activeStep === index
                    ? isDark
                      ? "bg-blue-900/50 border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
                      : "bg-white border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
                    : isDark
                      ? "bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70"
                      : "bg-white/70 border border-slate-200 hover:bg-white"
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className="text-center">
                  <div className={`text-6xl mb-4 ${activeStep === index ? "animate-bounce" : ""}`}>{step.icon}</div>
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold ${
                      activeStep === index ? "bg-blue-500" : "bg-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {step.title}
                  </h3>
                  <p className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>{step.description}</p>
                </div>
                {activeStep === index && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Distributed Architecture
            </h2>
            <p className={`text-xl ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Powered by a global network of validators ensuring 24/7 monitoring
            </p>
          </div>

          <div
            className={`relative h-96 rounded-3xl overflow-hidden border-2 ${
              isDark ? "bg-slate-900/50 border-blue-800/30" : "bg-blue-50/50 border-blue-200/50"
            }`}
          >
            {networkNodes.map((node) => (
              <div
                key={node.id}
                className="absolute transition-all duration-1000"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  animationDelay: `${node.delay}s`,
                }}
              >
                <div
                  className={`rounded-full animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-600"}`}
                  style={{
                    width: `${node.size}px`,
                    height: `${node.size}px`,
                  }}
                ></div>
                <div
                  className={`absolute inset-0 rounded-full animate-pulse ${
                    isDark ? "bg-blue-400/30" : "bg-blue-600/30"
                  }`}
                  style={{
                    animationDelay: `${node.delay}s`,
                  }}
                ></div>
              </div>
            ))}

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDark ? "bg-blue-600" : "bg-blue-600"
                } shadow-2xl`}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div
                className={`absolute inset-0 rounded-full animate-ping ${isDark ? "bg-blue-600/20" : "bg-blue-600/20"}`}
              ></div>
            </div>

            <svg className="absolute inset-0 w-full h-full">
              {networkNodes.slice(0, 6).map((node, index) => (
                <line
                  key={index}
                  x1="50%"
                  y1="50%"
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke={isDark ? "#3b82f6" : "#2563eb"}
                  strokeWidth="1"
                  opacity="0.3"
                  className="animate-pulse"
                  style={{ animationDelay: `${node.delay}s` }}
                />
              ))}
            </svg>

            <div className="absolute bottom-4 left-4 right-4">
              <div className={`p-4 rounded-xl backdrop-blur-sm ${isDark ? "bg-slate-800/70" : "bg-white/70"}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      Network Status: Preparing for Beta Launch
                    </p>
                    <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Global validator network ready to deploy
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm ${isDark ? "text-blue-400" : "text-blue-600"}`}>Beta Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`py-20 ${isDark ? "bg-slate-800/30" : "bg-blue-50/50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Why Choose WebTether?
            </h2>
            <p className={`text-xl ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Revolutionary features that set us apart from traditional monitoring
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  hoveredFeature === index
                    ? isDark
                      ? "bg-blue-900/50 border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
                      : "bg-white border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
                    : isDark
                      ? "bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70"
                      : "bg-white/70 border border-slate-200 hover:bg-white"
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="text-center">
                  <div className={`text-4xl mb-4 ${hoveredFeature === index ? "animate-bounce" : ""}`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm mb-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {feature.description}
                  </p>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      isDark
                        ? "bg-blue-900/50 text-blue-300 border border-blue-800"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {feature.stats}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Earning?</h2>
          <p className="text-xl text-blue-100 mb-8">Be among the first to earn ETH through decentralized monitoring</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
            >
              Add Your Website Now
            </button>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
            >
              Become a Validator
            </button>
          </div>
        </div>
      </section>

      <footer className={`py-12 ${isDark ? "bg-slate-900" : "bg-slate-800"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">WebTether</span>
              </div>
              <p className="text-slate-400 text-sm">The world's first decentralized website monitoring network.</p>
            </div>

            {[
              {
                title: "Product",
                links: ["How it Works", "Pricing", "Features", "API"],
              },
              {
                title: "Community",
                links: ["Discord", "Twitter", "GitHub", "Blog"],
              },
              {
                title: "Support",
                links: ["Help Center", "Contact", "Status", "Privacy"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-white font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-400 text-sm">© 2024 WebTether. All rights reserved. Built on Ethereum.</p>
          </div>
        </div>
      </footer>

      {/* Authentication Dialogs */}
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} onSwitchToSignup={handleSwitchToSignup} />
      <SignupDialog open={showSignupDialog} onOpenChange={setShowSignupDialog} onSwitchToLogin={handleSwitchToLogin} />
    </div>
  )
}

export default NewWebTetherLanding
