"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/context/auth-context"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Moon,
  Sun,
  ShieldCheck,
  RotateCcw,
  LogOut,
  Radio,
  Server,
} from "lucide-react"

export function AppHeader() {
  const { user, logout, quickLoginDemo, apiMode, setApiMode } = useAuth()
  const { theme, setTheme } = useTheme()
  const [resetNotice, setResetNotice] = React.useState(false)

  const handleReset = () => {
    api.resetMockData()
    setResetNotice(true)
    setTimeout(() => {
      setResetNotice(false)
      window.location.reload()
    }, 800)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl">
        {/* Brand & Assessment Title */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-foreground">
                Programming Hero
              </span>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 hidden sm:inline-flex">
                Assessment Portal
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Project Submission & Mentor Review Architecture
            </p>
          </div>
        </div>

        {/* Center: Live API vs Mock Mode Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => setApiMode("mock")}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors flex items-center gap-1 ${
                apiMode === "mock"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Test UI with contract simulator"
            >
              <Radio className="h-3 w-3 text-emerald-500" />
              <span>Simulated Contract</span>
            </button>

            <button
              type="button"
              onClick={() => setApiMode("live")}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors flex items-center gap-1 ${
                apiMode === "live"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Call real Express.js backend on http://localhost:5000/api"
            >
              <Server className="h-3 w-3 text-blue-500" />
              <span>Live Express API</span>
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Reset Demo State button */}
          {apiMode === "mock" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground hidden md:inline-flex gap-1.5 h-8"
              title="Reset localStorage state to initial demo data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{resetNotice ? "Resetting..." : "Reset Data"}</span>
            </Button>
          )}

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

          {/* User profile / Role Switcher */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="hidden lg:block text-left text-xs">
                <span className="font-semibold block leading-none">{user.name}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {user.role === "MENTOR" ? "Mentor / Evaluator" : "Student"}
                </span>
              </div>

              {/* Quick Role Switcher for assessment evaluators */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLoginDemo(user.role === "STUDENT" ? "MENTOR" : "STUDENT")}
                className="text-[11px] h-7 px-2 text-primary font-medium ml-1 hidden sm:inline-flex"
                title="Toggle between Student and Mentor perspectives"
              >
                {user.role === "STUDENT" ? (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Switch to Mentor
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Switch to Student
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Log out"
                className="size-8 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="pl-2 border-l border-border text-xs text-muted-foreground">
              Guest
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

