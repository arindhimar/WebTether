"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "../components/ui/navbar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  Globe,
  Clock,
  BarChart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const NetworkAnimation = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let nodes = []
    let connections = []

    // Set canvas dimensions
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initNodes()
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    // Initialize nodes
    function initNodes() {
      nodes = []
      connections = []

      // Create nodes
      for (let i = 0; i < 15; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 3 + Math.random() * 3,
          vx: Math.random() * 0.5 - 0.25,
          vy: Math.random() * 0.5 - 0.25,
          connected: false,
        })
      }

      // Create connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.random() > 0.85) {
            connections.push({
              from: i,
              to: j,
              life: 0,
              maxLife: 100 + Math.random() * 100,
            })
            nodes[i].connected = true
            nodes[j].connected = true
          }
        }
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw connections
      for (let i = connections.length - 1; i >= 0; i--) {
        const connection = connections[i]
        connection.life++

        if (connection.life > connection.maxLife) {
          connections.splice(i, 1)
          continue
        }

        const fromNode = nodes[connection.from]
        const toNode = nodes[connection.to]

        // Calculate opacity based on life
        let opacity
        if (connection.life < 20) {
          opacity = connection.life / 20
        } else if (connection.life > connection.maxLife - 20) {
          opacity = (connection.maxLife - connection.life) / 20
        } else {
          opacity = 1
        }

        // Draw connection
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.strokeStyle = `rgba(30, 144, 255, ${opacity * 0.5})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw pulse
        const pulsePosition = (connection.life % 100) / 100
        const pulseX = fromNode.x + (toNode.x - fromNode.x) * pulsePosition
        const pulseY = fromNode.y + (toNode.y - fromNode.y) * pulsePosition

        ctx.beginPath()
        ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(30, 144, 255, ${opacity})`
        ctx.fill()
      }

      // Create new connections randomly
      if (Math.random() > 0.97) {
        const from = Math.floor(Math.random() * nodes.length)
        const to = Math.floor(Math.random() * nodes.length)

        if (from !== to) {
          connections.push({
            from,
            to,
            life: 0,
            maxLife: 100 + Math.random() * 100,
          })
          nodes[from].connected = true
          nodes[to].connected = true
        }
      }

      // Update and draw nodes
      nodes.forEach((node, index) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.connected ? "#1E90FF" : "rgba(30, 144, 255, 0.5)"
        ctx.fill()
      })

      animationFrameId = window.requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20" />
}

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CTO, TechFlow",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "WebTether has transformed how we monitor our services. The distributed validator network gives us insights we never had before.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "DevOps Lead, CloudScale",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "Being able to monitor our websites from multiple geographic locations has been a game-changer for our global user base.",
  },
  {
    id: 3,
    name: "Priya Patel",
    role: "Web Developer, CreativeStack",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "I love being part of the validator network. It's easy to set up and I get credits for helping monitor other sites.",
  },
]

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 z-0">
          <NetworkAnimation />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={fadeIn}>
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400"
              variants={fadeIn}
            >
              Monitor Websites from Anywhere, Be a Validator!
            </motion.h1>

            <motion.p className="text-xl md:text-2xl mb-8 text-muted-foreground" variants={fadeIn}>
              Join a distributed network of validators to track website uptime, performance, and status in real-time.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeIn}>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Sign Up to Monitor
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Join as a Validator
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              WebTether provides powerful tools to monitor and analyze your websites from anywhere in the world.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Be a Validator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Join our network as a validator and help monitor websites while earning credits.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Real-Time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track website uptime and performance with real-time alerts and notifications.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Global Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monitor websites from multiple geographic locations for comprehensive insights.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Detailed Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get insights into website performance with detailed analytics and custom reports.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from the people who use WebTether to monitor their websites.
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="relative">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-lg p-8 shadow-md"
              >
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <img
                      src={testimonials[currentTestimonial].avatar || "/placeholder.svg"}
                      alt={testimonials[currentTestimonial].name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
                <p className="text-lg italic">"{testimonials[currentTestimonial].content}"</p>
              </motion.div>

              <div className="flex justify-center mt-8 space-x-2">
                <Button variant="outline" size="icon" onClick={prevTestimonial} className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${index === currentTestimonial ? "bg-primary" : "bg-muted"}`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
                <Button variant="outline" size="icon" onClick={nextTestimonial} className="rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">WebTether</h3>
              <p className="text-muted-foreground mb-4">
                Distributed website monitoring platform with user validators.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github size={20} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail size={20} />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Validators
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} WebTether. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

