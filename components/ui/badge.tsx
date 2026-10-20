import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive border border-destructive/20",
        outline: "text-foreground border border-border",
        success:
          "border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 border",
        warning:
          "border-amber-500/20 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 border",
        info:
          "border-blue-500/20 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40 border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

