"use client"

import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export default function CommunitySection() {
  return (
    <section className="w-full py-20 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl gradient-text mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Join Our Growing Community
          </motion.h2>
          <motion.p
            className="text-muted-foreground md:text-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            WebTether is built on the power of community. Join thousands of developers and website owners who are
            revolutionizing how websites are monitored.
          </motion.p>

          <motion.div
            className="grid gap-8 md:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="text-4xl font-bold gradient-text mb-2">1,000+</div>
              <p className="text-muted-foreground">Early Access Signups</p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
              <p className="text-muted-foreground">Global Monitoring</p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="text-4xl font-bold gradient-text mb-2">100%</div>
              <p className="text-muted-foreground">Community Driven</p>
            </div>
          </motion.div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button size="lg" variant="gradient" className="animate-in-button shadow-glow" asChild>
              <Link to="/sign-up">
                Join Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

