"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useAnimation, useInView } from "framer-motion"
import { Navbar } from "../components/Navbar"
import { Button } from "../components/ui/button"
import { Logo } from "../components/Logo"
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
  CheckCircle,
  ArrowRight,
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
        ctx.strokeStyle = `rgba(30, 64, 175, ${opacity * 0.5})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw pulse
        const pulsePosition = (connection.life % 100) / 100
        const pulseX = fromNode.x + (toNode.x - fromNode.x) * pulsePosition
        const pulseY = fromNode.y + (toNode.y - fromNode.y) * pulsePosition

        ctx.beginPath()
        ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`
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
        ctx.fillStyle = node.connected ? "#1e40af" : "rgba(30, 64, 175, 0.5)"
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

// Animated feature component
const AnimatedFeature = ({ icon: Icon, title, description }) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, threshold: 0.2 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={fadeIn}>
      <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-primary/20 bg-gradient-to-b from-background to-primary/5">
        <CardHeader>
          <motion.div
            className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className="h-6 w-6 text-primary" />
          </motion.div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const featuresRef = useRef(null)
  const featuresInView = useInView(featuresRef, { once: true, threshold: 0.1 })
  const featuresControls = useAnimation()

  useEffect(() => {
    if (featuresInView) {
      featuresControls.start("visible")
    }
  }, [featuresControls, featuresInView])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const features = [
    {
      icon: Globe,
      title: "Be a Validator",
      description: "Join our network as a validator and help monitor websites while earning credits.",
    },
    {
      icon: Clock,
      title: "Real-Time Monitoring",
      description: "Track website uptime and performance with real-time alerts and notifications.",
    },
    {
      icon: MapPin,
      title: "Global Coverage",
      description: "Monitor websites from multiple geographic locations for comprehensive insights.",
    },
    {
      icon: BarChart,
      title: "Detailed Analytics",
      description: "Get insights into website performance with detailed analytics and custom reports.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-blue-900 to-background">
        <div className="absolute inset-0 z-0">
          <NetworkAnimation />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={fadeIn}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="mb-6 flex justify-center"
            >
              <Logo size="xl" />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-400"
              variants={fadeIn}
            >
              Monitor Websites from Anywhere, Be a Validator!
            </motion.h1>

            <motion.p className="text-xl md:text-2xl mb-8 text-blue-100" variants={fadeIn}>
              Join a distributed network of validators to track website uptime, performance, and status in real-time.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeIn}>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-blue-400/50 hover:border-blue-400 text-blue-100 hover:text-blue-50 hover:bg-blue-900/50"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background" ref={featuresRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial="hidden" animate={featuresControls} variants={fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Key Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              WebTether provides powerful tools to monitor and analyze your websites from anywhere in the world.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            animate={featuresControls}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <AnimatedFeature
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-blue-900/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              WebTether makes website monitoring simple, distributed, and effective.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up",
                description: "Create your account and set up your profile in just a few minutes.",
              },
              {
                step: "02",
                title: "Add Websites",
                description: "Add the websites you want to monitor with customizable check intervals.",
              },
              {
                step: "03",
                title: "Get Insights",
                description: "Receive real-time alerts and detailed analytics about your websites' performance.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="absolute -top-10 -left-10 text-8xl font-bold text-primary/10">{item.step}</div>
                <Card className="h-full border-primary/20 relative z-10 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                    <ul className="mt-4 space-y-2">
                      {[1, 2, 3].map((i) => (
                        <motion.li
                          key={i}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <CheckCircle className="h-5 w-5 text-primary/70" />
                          <span className="text-sm">
                            {index === 0 && i === 1 && "Quick and easy setup process"}
                            {index === 0 && i === 2 && "No credit card required"}
                            {index === 0 && i === 3 && "Free tier available"}

                            {index === 1 && i === 1 && "Monitor unlimited websites"}
                            {index === 1 && i === 2 && "Set custom check intervals"}
                            {index === 1 && i === 3 && "Configure alert thresholds"}

                            {index === 2 && i === 1 && "Email and SMS notifications"}
                            {index === 2 && i === 2 && "Detailed performance reports"}
                            {index === 2 && i === 3 && "Historical data analysis"}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from the people who use WebTether to monitor their websites.
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-lg p-8 shadow-md border border-primary/20"
              >
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <motion.img
                      src={testimonials[currentTestimonial].avatar || "/placeholder.svg"}
                      alt={testimonials[currentTestimonial].name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
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
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevTestimonial}
                    className="rounded-full border-primary/50 hover:border-primary"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </motion.div>

                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-3 h-3 rounded-full ${index === currentTestimonial ? "bg-primary" : "bg-muted"}`}
                    onClick={() => setCurrentTestimonial(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextTestimonial}
                    className="rounded-full border-primary/50 hover:border-primary"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-blue-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Start Monitoring?</h2>
            <p className="text-xl mb-8 text-blue-100/80">
              Join thousands of users who trust WebTether for their website monitoring needs.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-blue-50 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
                >
                  Get Started for Free
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 mt-auto border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="text-muted-foreground mb-4 mt-4">
                Distributed website monitoring platform with user validators.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Twitter size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Linkedin size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail size={20} />
                </motion.a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Product</h3>
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
              <h3 className="text-lg font-semibold mb-4 text-primary">Resources</h3>
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
              <h3 className="text-lg font-semibold mb-4 text-primary">Company</h3>
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

