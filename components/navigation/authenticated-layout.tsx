"use client"

import type { ReactNode } from "react"
import { GraduationCap, Radio, Server } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { AppHeader } from "@/components/navigation/app-header"

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { apiMode } = useAuth()
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <div className="border-b border-border/80 bg-white/70 px-4 py-2.5 text-center text-xs dark:bg-card/70">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          {apiMode === "live" ? (
            <span className="flex items-center gap-1.5 font-medium text-blue-700 dark:text-blue-400">
              <Server className="size-3.5" /> Connected to the configured Express API
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
              <Radio className="size-3.5" /> Demo data mode · changes are stored in this browser
            </span>
          )}
        </div>
      </div>
      <main className="container mx-auto w-full max-w-[1440px] flex-1 px-4 py-7 sm:px-6 sm:py-9">{children}</main>
      <footer className="mt-12 border-t border-border/80 bg-white/60 px-4 py-5 text-xs text-muted-foreground dark:bg-card/40">
        <div className="container mx-auto flex max-w-7xl items-center gap-2">
          <GraduationCap className="size-4 text-primary" />
          <span><strong>Programming Hero</strong> · Project Submission &amp; Mentor Review</span>
        </div>
      </footer>
    </div>
  )
}
