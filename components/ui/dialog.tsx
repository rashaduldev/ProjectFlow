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
  onClose: () => void
  contentRef: React.RefObject<HTMLDivElement | null>
  titleId: string
  descriptionId: string
}

const DialogContext = React.createContext<DialogContextType | null>(null)
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const onOpenChangeRef = React.useRef(onOpenChange)
  const titleId = React.useId()
  const descriptionId = React.useId()
  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  React.useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const frame = window.requestAnimationFrame(() => {
      const first = contentRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? contentRef.current)?.focus()
    })
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        onOpenChangeRef.current(false)
      }
      if (event.key !== "Tab" || !contentRef.current) return
      const items = Array.from(contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((item) => item.offsetParent !== null)
      if (items.length === 0) {
        event.preventDefault()
        contentRef.current.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === contentRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [open])

  if (!open) return null
  const close = () => onOpenChangeRef.current(false)
  return (
    <DialogContext.Provider value={{ onClose: close, contentRef, titleId, descriptionId }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
        <button
          type="button"
          className="fixed inset-0 cursor-default bg-background/80 backdrop-blur-xs"
          onClick={close}
          aria-label="Close dialog backdrop"
          tabIndex={-1}
        />
        <div className="relative z-50 my-auto flex w-full justify-center pointer-events-none">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  )
}

export function DialogContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const context = React.useContext(DialogContext)
  return (
    <div
      ref={context?.contentRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={context?.titleId}
      aria-describedby={context?.descriptionId}
      tabIndex={-1}
      className={cn("pointer-events-auto relative mx-auto flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xl outline-none", className)}
      {...props}
    >
      {context && (
        <button
          type="button"
          onClick={context.onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>
      )}
      <div className="max-h-[calc(90vh-3rem)] overflow-y-auto pr-1">{children}</div>
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4 flex flex-col space-y-1.5 text-left", className)} {...props} />
}

export function DialogTitle({ className, id, ...props }: React.ComponentProps<"h2">) {
  const context = React.useContext(DialogContext)
  return <h2 id={id ?? context?.titleId} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
}

export function DialogDescription({ className, id, ...props }: React.ComponentProps<"p">) {
  const context = React.useContext(DialogContext)
  return <p id={id ?? context?.descriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-4 flex flex-col-reverse border-t border-border pt-4 sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}
