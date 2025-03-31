"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Navbar } from "../components/Navbar"
import { Button } from "../components/ui/button"
import { Home, RefreshCw } from "lucide-react"
import { Logo } from "../components/ui/logo"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const pulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    },
  },
}

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div className="mb-6 flex justify-center" initial="initial" animate="animate" variants={pulse}>
            <Logo size="large" />
          </motion.div>

          <motion.h1
            className="text-4xl font-bold text-red-500 mb-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            500 - Server Error
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg mb-8"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            Sorry, there was an error on our end. Please try again later.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Link to="/">
              <Button variant="default" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

