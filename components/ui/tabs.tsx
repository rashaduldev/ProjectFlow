"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const activeValue = value !== undefined ? value : internalValue

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [value, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: {
  value: string
  className?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(TabsContext)
  const isSelected = context?.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => context?.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-background text-foreground shadow-xs"
          : "hover:bg-background/50 hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: {
  value: string
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(TabsContext)
  if (context?.value !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      {...props}
    >
      {children}
    </div>
  )
}

