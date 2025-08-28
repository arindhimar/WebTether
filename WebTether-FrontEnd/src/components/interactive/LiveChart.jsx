"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function LiveChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    // Generate initial data
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: i,
      uptime: 95 + Math.random() * 5,
      latency: 50 + Math.random() * 100,
    }))
    setData(initialData)

    // Update data every 2 seconds
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)]
        newData.push({
          time: prevData[prevData.length - 1].time + 1,
          uptime: 95 + Math.random() * 5,
          latency: 50 + Math.random() * 100,
        })
        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const maxUptime = 100
  const maxLatency = 200

  return (
    <div className="h-48 w-full relative">
      <div className="absolute inset-0 flex items-end justify-between px-2">
        {data.map((point, index) => (
          <motion.div
            key={point.time}
            className="flex flex-col items-center space-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            {/* Uptime bar */}
            <motion.div
              className="w-3 bg-gradient-to-t from-blue-600 to-indigo-600 rounded-t"
              style={{ height: `${(point.uptime / maxUptime) * 120}px` }}
              initial={{ height: 0 }}
              animate={{ height: `${(point.uptime / maxUptime) * 120}px` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Latency indicator */}
            <div className="w-1 bg-blue-500 rounded" style={{ height: `${(point.latency / maxLatency) * 40}px` }} />
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 text-xs space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded" />
          <span className="text-muted-foreground">Uptime %</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-muted-foreground">Latency</span>
        </div>
      </div>
    </div>
  )
}
