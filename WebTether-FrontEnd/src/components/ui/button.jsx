"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"
import { Slot } from "@radix-ui/react-slot"

const Button = forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : motion.button

  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow",
    accent: "bg-accent text-accent-foreground hover:bg-accent/80 shadow-sm hover:shadow",
    link: "underline-offset-4 hover:underline text-primary",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  }

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  }

  const motionProps = {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98, y: 1 },
    transition: { duration: 0.2 },
  }

  return (
    <Comp className={cn(baseStyles, variants[variant], sizes[size], className)} ref={ref} {...motionProps} {...props} />
  )
})

Button.displayName = "Button"

export { Button }

