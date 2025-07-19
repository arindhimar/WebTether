"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Star } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

export function CTASection() {
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  const handleEarlyAccess = (e) => {
    e.preventDefault()
    if (email) {
      toast({
        title: "Success!",
        description: "You've been added to our early access list. We'll be in touch soon!",
      })
      setEmail("")
    } else {
      toast({
        title: "Missing Email",
        description: "Please enter your email address to join the list.",
        variant: "destructive",
      })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="space-y-2" variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Start Monitoring?</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join the decentralized monitoring revolution. Monitor your websites with human intelligence and earn
              rewards as a validator.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleEarlyAccess}
            className="flex flex-col sm:flex-row gap-2 w-full max-w-sm pt-4"
            variants={itemVariants}
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Monitor a Website Now
            </Button>
          </motion.form>

          <motion.div className="flex items-center gap-4 pt-4" variants={itemVariants}>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Trusted by developers worldwide</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
