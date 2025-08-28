"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/90 group-[.toaster]:text-slate-900 group-[.toaster]:border-blue-200 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl dark:group-[.toaster]:bg-slate-900/90 dark:group-[.toaster]:text-slate-100 dark:group-[.toaster]:border-blue-700 group-[.toaster]:rounded-2xl group-[.toaster]:border-2",
          description: "group-[.toast]:text-slate-600 dark:group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-600 group-[.toast]:to-blue-700 group-[.toast]:text-white group-[.toast]:rounded-xl group-[.toast]:font-semibold group-[.toast]:shadow-lg hover:group-[.toast]:shadow-xl hover:group-[.toast]:from-blue-700 hover:group-[.toast]:to-blue-800 group-[.toast]:transition-all group-[.toast]:duration-300",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-700 dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-300 group-[.toast]:rounded-xl group-[.toast]:font-semibold hover:group-[.toast]:bg-slate-200 dark:hover:group-[.toast]:bg-slate-700 group-[.toast]:transition-all group-[.toast]:duration-300",
          success:
            "group-[.toast]:border-emerald-300 group-[.toast]:bg-emerald-50/90 dark:group-[.toast]:border-emerald-700 dark:group-[.toast]:bg-emerald-950/30",
          error:
            "group-[.toast]:border-red-300 group-[.toast]:bg-red-50/90 dark:group-[.toast]:border-red-700 dark:group-[.toast]:bg-red-950/30",
          warning:
            "group-[.toast]:border-blue-300 group-[.toast]:bg-blue-50/90 dark:group-[.toast]:border-blue-700 dark:group-[.toast]:bg-blue-950/30",
          info: "group-[.toast]:border-blue-300 group-[.toast]:bg-blue-50/90 dark:group-[.toast]:border-blue-600 dark:group-[.toast]:bg-blue-950/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
