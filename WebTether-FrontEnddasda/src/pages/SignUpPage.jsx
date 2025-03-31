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

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [accountType, setAccountType] = useState("user") // 'user' or 'validator'

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
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground mt-2">Join WebTether to monitor websites or become a validator</p>
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

            <motion.div variants={itemVariants} className="mb-6">
              <label className="block text-sm font-medium mb-2">I want to:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType("user")}
                  className={`p-3 border rounded-md flex flex-col items-center justify-center transition-all ${
                    accountType === "user"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">Monitor Websites</span>
                  <span className="text-xs mt-1">Track your websites</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("validator")}
                  className={`p-3 border rounded-md flex flex-col items-center justify-center transition-all ${
                    accountType === "validator"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">Be a Validator</span>
                  <span className="text-xs mt-1">Join our network</span>
                </button>
              </div>
            </motion.div>

            <motion.form onSubmit={handleSubmit} className="space-y-4" variants={formVariants}>
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  placeholder="John Doe"
                  required
                />
              </motion.div>

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
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters long</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </motion.div>

              <motion.p variants={itemVariants} className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </motion.p>
            </motion.form>
          </motion.div>

          <motion.p
            className="text-center mt-6 text-sm text-muted-foreground"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  )
}

