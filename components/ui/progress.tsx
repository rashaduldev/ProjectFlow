import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  indicatorColor?: string
}

function Progress({
  className,
  value = 0,
  max = 100,
  indicatorColor,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100)

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 transition-all duration-300 ease-in-out",
          indicatorColor || "bg-primary"
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  )
}

export { Progress }

