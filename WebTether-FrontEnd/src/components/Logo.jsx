"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export function Logo({ size = "default", animated = true }) {
  const sizeClasses = {
    small: "h-6 w-6",
    default: "h-8 w-8",
    large: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const textSizeClasses = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl",
    xl: "text-3xl",
  }

  const logoVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  }

  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        delay: 0.2,
      },
    },
  }

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.8 },
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      },
    },
  }

  return (
    <Link to="/" className="flex items-center gap-2">
      <motion.div
        initial="initial"
        animate={animated ? "animate" : "initial"}
        whileHover="hover"
        variants={logoVariants}
        className={`relative ${sizeClasses[size]}`}
      >
        <motion.div variants={pulseVariants} className="absolute inset-0 bg-primary/20 rounded-full" />
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <motion.path
            d="M20 5C11.716 5 5 11.716 5 20C5 28.284 11.716 35 20 35C28.284 35 35 28.284 35 20C35 11.716 28.284 5 20 5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary"
            variants={pathVariants}
          />
          <motion.path
            d="M20 12V20L26 26"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary"
            variants={pathVariants}
          />
          <motion.path
            d="M12 8L28 32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary"
            variants={pathVariants}
          />
          <motion.path
            d="M28 8L12 32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary"
            variants={pathVariants}
          />
        </svg>
      </motion.div>
      <motion.span
        className={`font-bold ${textSizeClasses[size]} bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-400`}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        WebTether
      </motion.span>
    </Link>
  )
}

