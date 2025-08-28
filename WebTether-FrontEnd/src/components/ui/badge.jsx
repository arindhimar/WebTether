import { cva } from "class-variance-authority"
import { cn } from "../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow hover:from-blue-700 hover:to-blue-800",
        secondary:
          "border-transparent bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-950/40",
        destructive: "border-transparent bg-red-600 text-white shadow hover:bg-red-700",
        outline: "text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
