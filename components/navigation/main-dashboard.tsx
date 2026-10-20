"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { AppHeader } from "./app-header"
import { AuthCard } from "@/components/auth/auth-card"
import { StudentSubmissionsView } from "@/components/student/student-submissions-view"
import { MentorDashboardView } from "@/components/mentor/mentor-dashboard-view"
import { GraduationCap, Keyboard, Server, Radio, FileCode2 } from "lucide-react"

export function MainDashboard() {
  const { user, isAuthenticated, isLoading, apiMode } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-muted-foreground text-xs font-medium">Initializing session...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <AppHeader />

      {/* Mode notification banner */}
      <div className="border-b border-border bg-muted/40 text-xs py-2 px-4 text-center">
        <div className="container mx-auto flex items-center justify-center gap-2 max-w-7xl">
          {apiMode === "live" ? (
            <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" />
              <strong>Live API Mode:</strong> Connecting to Express.js + Prisma backend at <code>http://localhost:5000/api</code>.
            </span>
          ) : (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <strong>Simulated Contract Mode Active:</strong> Contract simulator loaded for frontend evaluation.
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {!isAuthenticated || !user ? (
          <AuthCard />
        ) : user.role === "STUDENT" ? (
          <StudentSubmissionsView />
        ) : (
          <MentorDashboardView />
        )}
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
              Contract-Driven Architecture
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

