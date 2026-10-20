"use client"

import * as React from "react"
import { useDashboard } from "@/context/dashboard-context"
import { DashboardHeader } from "./header"
import { StudentDashboard } from "./student-view/student-dashboard"
import { InstructorDashboard } from "./instructor-view/instructor-dashboard"
import { GraduationCap, Keyboard, CheckCircle2 } from "lucide-react"

export function DashboardView() {
  const { role } = useDashboard()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Global Dashboard Navigation Bar */}
      <DashboardHeader />

      {/* Main Content Area */}
      <main className="container mx-auto flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {role === "student" ? <StudentDashboard /> : <InstructorDashboard />}
      </main>

      {/* Informative Footer */}
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
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Rubric Engine Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
