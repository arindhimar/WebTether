"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

const AnimatedCard = forwardRef(({ className, children, hoverEffect = true, ...props }, ref) => {
  const baseStyles = "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300"

  const hoverStyles = hoverEffect
    ? {
        whileHover: {
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -6px rgba(59, 130, 246, 0.2)",
          transition: { duration: 0.3 },
        },
      }
    : {}

  return (
    <motion.div ref={ref} className={cn(baseStyles, className)} {...hoverStyles} {...props}>
      {children}
    </motion.div>
  )
})

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }

