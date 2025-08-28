import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow hover:from-blue-700 hover:to-blue-800",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-300",
        secondary:
          "bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 shadow-sm hover:bg-blue-200 dark:hover:bg-blue-950/40",
        ghost: "hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-300",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"

export { Button, buttonVariants }
