"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  ShieldCheck,
  Send,
  Layers,
  Clock,
  LogOut,
  Sun,
  Moon,
  Radio,
  Server,
  FileCode2,
  Keyboard,
} from "lucide-react"

export default function StudentLayout({
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
      } else if (user.role !== "STUDENT") {
        router.push("/unauthorized")
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading || !user || user.role !== "STUDENT") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-muted-foreground text-xs font-medium">Verifying student session...</span>
        </div>
      </div>
    )
  }

  const navLinks = [
    { label: "Dashboard", href: "/student/dashboard", icon: Layers },
    { label: "My Submissions", href: "/student/submissions", icon: Clock },
    { label: "Submit Project", href: "/student/submissions/new", icon: Send },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Student Global Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/student/dashboard" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-foreground">
                    Programming Hero
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 hidden sm:inline-flex">
                    Student Portal
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Project Submission & Status Tracking
                </p>
              </div>
            </Link>
          </div>

          {/* Student Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Mode selector */}
            <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border text-xs hidden lg:flex">
              <button
                type="button"
                onClick={() => setApiMode("mock")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  apiMode === "mock"
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Test with contract simulator"
              >
                <Radio className="h-3 w-3 text-emerald-500" />
                <span>Simulated</span>
              </button>
              <button
                type="button"
                onClick={() => setApiMode("live")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  apiMode === "live"
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Use real Express backend"
              >
                <Server className="h-3 w-3 text-blue-500" />
                <span>Live API</span>
              </button>
            </div>

            {/* Theme switcher */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="size-8"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-border text-xs">
              <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden xl:block text-left">
                <span className="font-semibold block text-xs leading-none">{user.name}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Student</span>
              </div>

              {/* Quick Switch to Mentor for testing */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const m = await quickLoginDemo("MENTOR")
                  if (m) router.push("/mentor/dashboard")
                }}
                className="text-[11px] h-7 px-2 text-primary font-medium ml-1 hidden sm:inline-flex"
                title="Toggle to Mentor view"
              >
                <ShieldCheck className="h-3 w-3 mr-1" />
                Switch to Mentor
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  logout()
                  router.push("/login")
                }}
                title="Log out"
                className="size-8 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile secondary nav */}
        <div className="md:hidden flex items-center justify-around border-t border-border px-4 py-2 bg-muted/30">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 text-xs font-semibold py-1 px-2 rounded-md ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-6 mt-12 text-xs text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>
              <strong>Programming Hero</strong> • Associate Web Instructor Assessment & Evaluation Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 font-mono">
              <Keyboard className="h-3 w-3" />
              Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border">d</kbd> for Dark Mode
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-primary">
              <FileCode2 className="h-3 w-3" />
              Zod & React Hook Form Enforced
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

