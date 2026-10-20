"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { api, ApiConnectionError, ApiHttpError } from "@/lib/api/client"
import { SubmissionStats } from "@/types/api"
import { MentorSidebar } from "./mentor-sidebar"
import { MentorStatsCards } from "./mentor-stats-cards"
import { MentorSubmissionsTable } from "./mentor-submissions-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  Award,
  Layers,
} from "lucide-react"

export function MentorDashboardView() {
  const { user, quickLoginDemo } = useAuth()

  const [activeView, setActiveView] = React.useState<"queue" | "stats" | "policy">("queue")
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
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4 my-8 max-w-2xl mx-auto">
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
    <div className="flex flex-col lg:flex-row gap-0 -mx-4 sm:-mx-6 -my-7 sm:-my-9">
      {/* Professional Sidebar Navigation */}
      <MentorSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onRefreshStats={handleManualRefresh}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 min-w-0 p-5 sm:p-7 lg:p-9 space-y-7 max-w-[1200px]">
        {/* Workspace Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Mentor Review Desk
              </h1>
              <span className="text-xs bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full">
                Protected Portal
              </span>
            </div>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-6">
              Evaluate student project submissions, verify deployment links, apply server-side status filters, and approve or reject submissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isStatsLoading}
              className="text-xs gap-1.5 h-8"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isStatsLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Aggregated Submission Metrics
            </h2>
          </div>
          <MentorStatsCards stats={stats} isLoading={isStatsLoading} />
        </div>

        {/* View Selection: Queue / Statistics / Guidelines */}
        {activeView === "queue" && (
          <MentorSubmissionsTable onDataChanged={handleManualRefresh} />
        )}

        {activeView === "stats" && (
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Submission Throughput Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-1.5">
                  <span className="font-semibold text-foreground block">Evaluation Pass Rate</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Based on {stats?.totalSubmissions || 0} total submissions:{" "}
                    <strong>
                      {stats && stats.totalApproved + stats.totalRejected > 0
                        ? Math.round(
                            (stats.totalApproved / (stats.totalApproved + stats.totalRejected)) *
                              100
                          )
                        : 0}
                      %
                    </strong>{" "}
                    of evaluated projects meet graduation requirements.
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-1.5">
                  <span className="font-semibold text-foreground block">Queue Fairness (FIFO)</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Mentors are advised to evaluate pending projects in FIFO order (oldest submissions first) to maintain fair turnaround SLA for all students.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === "policy" && (
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Academic Review & Evaluation Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-foreground/90 leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-sm">Mandatory Checks Prior to Approval:</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>The GitHub repository must be public and accessible without permission requests.</li>
                  <li>The live project URL must resolve smoothly and support direct route refreshes without 404 errors.</li>
                  <li>The repository README must outline the project purpose, key features, and test login credentials.</li>
                  <li>Code architecture should follow modular component patterns with clean Git commit hygiene.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="font-semibold text-foreground text-sm">Rejection Feedback Policy:</h4>
                <p className="text-muted-foreground">
                  When rejecting a submission, mentors are required to provide clear, actionable feedback specifying exactly which criteria failed and instructions for resubmission.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
