"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Navbar } from "../components/ui/navbar"
import { Button } from "../components/ui/button"
import { Home } from "lucide-react"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <motion.h1
            className="text-4xl font-bold text-red-500 mb-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            500 - Server Error
          </motion.h1>
          <motion.p className="text-muted-foreground text-lg mb-8" variants={fadeIn} initial="hidden" animate="visible">
            Sorry, there was an error on our end. Please try again later.
          </motion.p>
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Link to="/">
              <Button variant="outline" className="mr-2">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>        
      </main >
    </div>
  )
}

