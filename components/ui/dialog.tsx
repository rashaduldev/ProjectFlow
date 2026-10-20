"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContextType {
  open: boolean
  onClose: () => void
}

const DialogContext = React.createContext<DialogContextType | null>(null)

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }
    if (open) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <DialogContext.Provider value={{ open, onClose: () => onOpenChange(false) }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
        <div className="relative z-50 w-full flex justify-center my-auto pointer-events-none">
          <div className="pointer-events-auto w-full max-h-[90vh] flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </DialogContext.Provider>
  )
}

export function DialogContent({
  className,
  children,
}: React.ComponentProps<"div">) {
  const context = React.useContext(DialogContext)

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-2xl flex-col rounded-xl border border-border bg-card p-6 shadow-xl overflow-hidden",
        className
      )}
    >
      {context?.onClose && (
        <button
          type="button"
          onClick={context.onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      <div className="overflow-y-auto pr-1 max-h-[calc(85vh-3rem)]">
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-left mb-4", className)}
      {...props}
    />
  )
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 mt-4 border-t border-border",
        className
      )}
      {...props}
    />
  )
}

