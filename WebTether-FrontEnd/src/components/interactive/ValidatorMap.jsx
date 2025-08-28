"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export function ValidatorMap() {
  const [validators, setValidators] = useState([])

  useEffect(() => {
    // Simulate validator locations
    const locations = [
      { id: 1, x: 20, y: 30, region: "US-West", status: "active" },
      { id: 2, x: 35, y: 25, region: "US-East", status: "active" },
      { id: 3, x: 55, y: 20, region: "Europe", status: "active" },
      { id: 4, x: 75, y: 35, region: "Asia", status: "checking" },
      { id: 5, x: 85, y: 55, region: "Australia", status: "active" },
      { id: 6, x: 45, y: 60, region: "South America", status: "active" },
    ]
    setValidators(locations)
  }, [])

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg overflow-hidden">
      {/* World map background (simplified) */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          <path d="M10,20 Q20,15 30,20 T50,25 T70,20 T90,25" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <path d="M15,35 Q25,30 35,35 T55,40 T75,35 T85,40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* Validator nodes */}
      {validators.map((validator) => (
        <motion.div
          key={validator.id}
          className="absolute"
          style={{
            left: `${validator.x}%`,
            top: `${validator.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: validator.id * 0.2 }}
        >
          {/* Pulse animation */}
          <motion.div
            className={`absolute inset-0 rounded-full ${
              validator.status === "active" ? "bg-green-500" : "bg-blue-500"
            }`}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          {/* Node */}
          <div
            className={`relative w-3 h-3 rounded-full ${
              validator.status === "active" ? "bg-green-500" : "bg-blue-500"
            } border-2 border-background shadow-lg`}
          />

          {/* Tooltip */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
            {validator.region}
          </div>
        </motion.div>
      ))}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {validators.map((validator, index) => {
          if (index === 0) return null
          const prev = validators[index - 1]
          return (
            <motion.line
              key={`line-${validator.id}`}
              x1={`${prev.x}%`}
              y1={`${prev.y}%`}
              x2={`${validator.x}%`}
              y2={`${validator.y}%`}
              stroke="rgb(59 130 246 / 0.3)"
              strokeWidth="1"
              strokeDasharray="2,2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.3 }}
            />
          )
        })}
      </svg>
    </div>
  )
}
c