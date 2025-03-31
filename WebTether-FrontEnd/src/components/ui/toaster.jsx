"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  const [progress, setProgress] = useState(0)
  const { id, title, description, type, duration } = toast

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration === Number.POSITIVE_INFINITY) return

    const timer = setTimeout(() => {
      onDismiss()
    }, duration)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (duration / 100)
        return newProgress > 100 ? 100 : newProgress
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [duration, onDismiss])

  // Get the appropriate styles based on toast type
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white"
      case "error":
        return "bg-red-500 text-white"
      case "warning":
        return "bg-yellow-500 text-white"
      case "info":
        return "bg-blue-500 text-white"
      default:
        return "bg-card border border-border text-foreground"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg shadow-lg overflow-hidden ${getTypeStyles()}`}
    >
      <div className="p-4 pr-8 relative">
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X size={16} />
        </button>

        {title && <h4 className="font-medium text-sm">{title}</h4>}
        {description && <p className="text-sm opacity-90 mt-1">{description}</p>}
      </div>

      {duration !== Number.POSITIVE_INFINITY && (
        <div className="h-1 bg-black/10">
          <div className="h-full bg-white/30 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      )}
    </motion.div>
  )
}

