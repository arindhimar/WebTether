"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { Sparkles, Rocket, Code, Zap, CheckCircle } from "lucide-react"

export default function EarlyAccessSection({
  isInView,
  email,
  setEmail,
  isEmailSubmitted,
  setIsEmailSubmitted,
  handleEarlyAccessSubmit,
}) {
  return (
    <div className="container px-4 md:px-6 relative">
      <motion.div
        className="mx-auto max-w-3xl rounded-2xl border bg-card/80 backdrop-blur-sm p-8 md:p-12 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-glow mb-4">
              <Sparkles className="inline-block mr-1 h-3.5 w-3.5" />
              Limited Spots Available
            </span>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl gradient-text"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Get Early Access
          </motion.h2>
          <motion.p
            className="mt-3 text-muted-foreground"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Be among the first to experience WebTether and help shape its future
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {isEmailSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                We've added you to our early access list. We'll notify you when WebTether is ready.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleEarlyAccessSubmit}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <Button type="submit" variant="gradient" className="h-12 w-full animate-in-button shadow-glow">
                  Join Waitlist
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy. We'll send you occasional updates
                about WebTether.
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Benefits */}
        <motion.div
          className="mt-8 grid gap-4 md:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex flex-col items-center text-center p-4">
            <Rocket className="h-8 w-8 text-primary mb-2" />
            <h4 className="font-medium">Early Adopter Benefits</h4>
            <p className="text-sm text-muted-foreground">Get exclusive features and priority support</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <Code className="h-8 w-8 text-primary mb-2" />
            <h4 className="font-medium">Shape the Product</h4>
            <p className="text-sm text-muted-foreground">Provide feedback that influences development</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <Zap className="h-8 w-8 text-primary mb-2" />
            <h4 className="font-medium">Lifetime Discount</h4>
            <p className="text-sm text-muted-foreground">Early adopters receive special pricing forever</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

