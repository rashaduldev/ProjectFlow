"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  GraduationCap,
  Moon,
  Sun,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDashboard } from "@/context/dashboard-context"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const { role, setRole, currentStudent, currentEvaluator, resetToSampleData } = useDashboard()
  const { theme, setTheme } = useTheme()
  const [resetNotice, setResetNotice] = React.useState(false)

  const handleReset = () => {
    resetToSampleData()
    setResetNotice(true)
    setTimeout(() => setResetNotice(false), 2500)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
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
              Project Submission & Rubric Review Workspace
            </p>
          </div>
        </div>

        {/* Center: Interactive Role Switcher */}
        <div className="flex items-center bg-muted/80 p-1 rounded-xl border border-border shadow-xs">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              role === "student"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Switch to Student view"
          >
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span>Student View</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("instructor")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              role === "instructor"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Switch to Instructor / Evaluator view"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Instructor View</span>
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Reset Demo Data button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground hidden md:inline-flex gap-1.5"
            title="Reset localStorage state to initial demo data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{resetNotice ? "Reset Done!" : "Reset Demo Data"}</span>
          </Button>

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

          {/* Current User Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-border text-xs">
            <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
              {role === "student" ? "TA" : "NC"}
            </div>
            <div className="text-left">
              <span className="font-semibold block text-xs leading-none">
                {role === "student" ? currentStudent.name : currentEvaluator.name}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                {role === "student" ? currentStudent.batch : currentEvaluator.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
