"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { api, ApiConnectionError, ApiHttpError } from "@/lib/api/client"
import { SubmissionStats } from "@/types/api"
import { MentorStatsCards } from "./mentor-stats-cards"
import { MentorSubmissionsTable } from "./mentor-submissions-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2 } from "lucide-react"

export function MentorDashboardView() {
  const { user, quickLoginDemo } = useAuth()

  const [stats, setStats] = React.useState<SubmissionStats | null>(null)
  const [isStatsLoading, setIsStatsLoading] = React.useState(true)
  const [statsError, setStatsError] = React.useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  React.useEffect(() => {
    if (user?.role !== "MENTOR") return
    let isMounted = true

    api.submissions
      .getStats()
      .then((data) => {
        if (isMounted) {
          setStats(data)
          setIsStatsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err instanceof ApiConnectionError || err instanceof ApiHttpError || err instanceof Error
              ? err.message
              : "Failed to load aggregated statistics."
          setStatsError(msg)
          setIsStatsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [user, refreshTrigger])

  const handleManualRefresh = React.useCallback(() => {
    setIsStatsLoading(true)
    setStatsError(null)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  // Role Protection Guard
  if (user?.role !== "MENTOR") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4 my-8">
        <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
        <h3 className="text-lg font-bold text-destructive">
          Mentor Access Restricted
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          You are currently signed in as <strong>{user?.name || "Student"}</strong> ({user?.role || "STUDENT"}).
          The Mentor Review Dashboard is protected and only accessible to verified Mentors and Instructors.
        </p>
        <div className="pt-2">
          <Button
            size="sm"
            onClick={() => quickLoginDemo("MENTOR")}
            className="text-xs gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Switch to Mentor Account (Demo)
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Mentor Review Desk 📋
              </h2>
              <span className="text-xs bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full">
                {user.name} (Mentor)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Inspect submitted project repositories, verify live URLs, apply server-side status filters, and approve or reject submissions with actionable feedback.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-background/80 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground self-start sm:self-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Protected Mentor Session Active</span>
          </div>
        </div>
      </div>

      {/* Stats Error Notice */}
      {statsError && (
        <Alert variant="destructive" className="py-2.5">
          <AlertTitle className="text-xs font-semibold">Statistics Error</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">{statsError}</AlertDescription>
        </Alert>
      )}

      {/* 4 Aggregated Statistics Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aggregated Submission Metrics
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isStatsLoading}
            className="text-[11px] h-7 gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isStatsLoading ? "animate-spin" : ""}`} />
            Refresh Stats
          </Button>
        </div>
        <MentorStatsCards stats={stats} isLoading={isStatsLoading} />
      </div>

      {/* Paginated Submissions Table with Server-Side Filtering */}
      <MentorSubmissionsTable onDataChanged={handleManualRefresh} />
    </div>
  )
}
