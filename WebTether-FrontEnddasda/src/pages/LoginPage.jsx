"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "../components/ui/navbar"
import { Button } from "../components/ui/button"
import { Github, Mail } from "lucide-react"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Redirect would happen here
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div className="text-center mb-8" initial="hidden" animate="visible" variants={fadeIn}>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </motion.div>

          <motion.div
            className="bg-card rounded-lg shadow-lg p-6 border border-border"
            initial="hidden"
            animate="visible"
            variants={formVariants}
          >
            <motion.div className="space-y-4 mb-6" variants={formVariants}>
              <motion.div variants={itemVariants}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Github size={18} />
                  <span>Continue with GitHub</span>
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Mail size={18} />
                  <span>Continue with Google</span>
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.form onSubmit={handleSubmit} className="space-y-4" variants={formVariants}>
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  placeholder="you@example.com"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  placeholder="••••••••"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </motion.div>
            </motion.form>
          </motion.div>

          <motion.p
            className="text-center mt-6 text-sm text-muted-foreground"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  )
}

