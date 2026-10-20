"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  LogOut,
  Radio,
  Server,
  Sun,
  Moon,
  Keyboard,
} from "lucide-react"

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout, quickLoginDemo, apiMode, setApiMode } = useAuth()
  const { theme, setTheme } = useTheme()

  // Route protection
  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login")
      } else if (user.role !== "MENTOR") {
        router.push("/unauthorized")
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading || !user || user.role !== "MENTOR") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-muted-foreground text-xs font-medium">Verifying mentor credentials...</span>
        </div>
      </div>
    )
  }

  const navLinks = [
    { label: "Dashboard & Stats", href: "/mentor/dashboard", icon: BarChart3 },
    { label: "Submissions Queue", href: "/mentor/submissions", icon: ClipboardList },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Professional Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-card border-r border-border shrink-0 flex flex-col justify-between p-4 lg:min-h-screen">
        <div className="space-y-6">
          {/* Brand */}
          <Link href="/mentor/dashboard" className="flex items-center gap-2.5 px-2">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block text-foreground">
                Mentor Desk
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Academic Evaluation
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 tracking-wider">
              Navigation
            </span>
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Backend Mode Selector */}
          <div className="rounded-lg border border-border p-3 bg-muted/20 space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Backend Integration
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setApiMode("mock")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  apiMode === "mock"
                    ? "bg-background text-foreground font-semibold border border-border shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Radio className="h-3.5 w-3.5 text-emerald-500" />
                <span>Simulated Contract</span>
              </button>

              <button
                type="button"
                onClick={() => setApiMode("live")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                  apiMode === "live"
                    ? "bg-background text-foreground font-semibold border border-border shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Server className="h-3.5 w-3.5 text-blue-500" />
                <span>Live Express API</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">{user.name}</span>
                <span className="text-[10px] text-muted-foreground block truncate">Mentor</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout()
                router.push("/login")
              }}
              title="Log out"
              className="size-7 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const s = await quickLoginDemo("STUDENT")
                if (s) router.push("/student/dashboard")
              }}
              className="w-full text-xs h-7 gap-1.5 text-primary"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Switch to Student
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="size-7 shrink-0"
            >
              <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
          {children}
        </main>

        <footer className="border-t border-border bg-card/40 py-4 px-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            <strong>Programming Hero</strong> • Mentor Evaluation Desk
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Keyboard className="h-3 w-3" />
            Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border">d</kbd> for Dark Mode
          </span>
        </footer>
      </div>
    </div>
  )
}
