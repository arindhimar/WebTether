"use client"

import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { Activity, CheckCircle, XCircle, Clock, Zap, DollarSign } from "lucide-react"

export default function ModernActivitySection({ activities = [], loading = false }) {
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time"
    
    try {
      const now = new Date()
      const time = new Date(timestamp)
      const diffInSeconds = Math.floor((now - time) / 1000)

      if (diffInSeconds < 60) return "Now"
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      return `${Math.floor(diffInSeconds / 86400)}d ago`
    } catch (e) {
      return "Invalid date"
    }
  }

  // Format activities to match the structure expected by the component
  const formatActivity = (activity) => {
    // If activity is already in the correct format, return it as-is
    if (activity.message && activity.url) return activity
    
    // If it's a raw ping object, format it
    return {
      id: activity.pid || activity.id || `activity-${Date.now()}-${Math.random()}`,
      type: activity.is_up ? "success" : "failed",
      message: activity.is_up ? "Site validation successful" : "Site validation failed",
      timestamp: activity.timestamp || activity.created_at,
      url: activity.url || `Website ID: ${activity.wid}`,
      responseTime: activity.latency_ms,
      region: activity.region,
      fee: activity.fee_paid_numeric || 0,
    }
  }

  return (
    <Card className="bg-white/60 dark:bg-slate-800/40 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your latest actions • {loading ? "..." : activities.length} items
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-2 w-20 bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center mb-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">No Recent Activity</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
              Your activity will appear here once you start monitoring or validating sites.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const formattedActivity = formatActivity(activity)
              return (
                <div
                  key={formattedActivity.id}
                  className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {formattedActivity.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {formattedActivity.message}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                          {formattedActivity.url ? formattedActivity.url.replace(/^https?:\/\//, "") : "Unknown website"}
                        </p>
                        {formattedActivity.region && formattedActivity.region !== "unknown" && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formattedActivity.region}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formattedActivity.timestamp ? formatTimeAgo(formattedActivity.timestamp) : "Unknown time"}
                        </p>
                        {formattedActivity.responseTime && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Zap className="h-3 w-3" /> {formattedActivity.responseTime}ms
                          </p>
                        )}
                        {formattedActivity.fee > 0 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> +{formattedActivity.fee.toFixed(4)} ETH
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}