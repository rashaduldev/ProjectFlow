"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useMySubmissions } from "@/lib/hooks/use-submissions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SafeExternalLink } from "@/components/dashboard/shared/safe-external-link"
import {
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Send,
  FolderGit2,
  AlertCircle,
  ArrowRight,
  MessageSquare,
} from "lucide-react"

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const { data: submissions = [], isLoading, error } = useMySubmissions(user?.id)

  const totalCount = submissions.length
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length
  const approvedCount = submissions.filter((s) => s.status === "APPROVED").length
  const rejectedCount = submissions.filter((s) => s.status === "REJECTED").length

  const recentSubmissions = submissions.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.name || "Student"}
            </h1>
            <Badge variant="outline" className="text-[10px]">
              Student Portal
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Track your assignment reviews, submit project repositories, and inspect mentor feedback in real time.
          </p>
        </div>

        <Link href="/student/submissions/new">
          <Button size="sm" className="text-xs gap-1.5 h-9">
            <Send className="h-3.5 w-3.5" />
            Submit New Project
          </Button>
        </Link>
      </div>

      {/* Submission Overview Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Projects</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{isLoading ? "..." : totalCount}</span>
            <span className="text-xs text-muted-foreground">submitted</span>
          </div>
        </Card>

        <Card className="p-4 bg-amber-500/5 border-amber-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{isLoading ? "..." : pendingCount}</span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80">awaiting</span>
          </div>
        </Card>

        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{isLoading ? "..." : approvedCount}</span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">passed</span>
          </div>
        </Card>

        <Card className="p-4 bg-destructive/5 border-destructive/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-destructive">Rejected</span>
            <XCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-destructive">{isLoading ? "..." : rejectedCount}</span>
            <span className="text-xs text-destructive/80">needs fix</span>
          </div>
        </Card>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Communication Error</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">
            {error instanceof Error ? error.message : "Failed to load submissions."}
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Submissions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-foreground">
            Recent Submissions
          </h2>
          <Link
            href="/student/submissions"
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <span>View all submissions ({submissions.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : recentSubmissions.length === 0 ? (
          <div className="p-10 text-center space-y-3 bg-card rounded-xl border border-dashed border-border">
            <FolderGit2 className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No Submissions Recorded</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t submitted any projects yet. Submit your first project to receive mentor evaluation.
            </p>
            <Link href="/student/submissions/new" className="inline-block pt-1">
              <Button size="sm" className="text-xs gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Submit Project Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSubmissions.map((sub) => {
              const submitDate = new Date(sub.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <div
                  key={sub.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2.5 shadow-xs hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">
                          {sub.projectName}
                        </h3>
                        {sub.status === "PENDING" && (
                          <Badge variant="warning" className="gap-1 text-[11px] font-semibold py-0.5">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                        {sub.status === "APPROVED" && (
                          <Badge variant="success" className="gap-1 text-[11px] font-semibold py-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </Badge>
                        )}
                        {sub.status === "REJECTED" && (
                          <Badge variant="destructive" className="gap-1 text-[11px] font-semibold py-0.5">
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Submitted on {submitDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <SafeExternalLink url={sub.liveUrl} label="Live URL" type="live" showCopy={false} />
                      <SafeExternalLink url={sub.githubUrl} label="GitHub" type="github" showCopy={false} />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {sub.description}
                  </p>

                  {sub.mentorFeedback && (
                    <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-xs">
                      <span className="font-semibold text-primary flex items-center gap-1 uppercase text-[10px] tracking-wider mb-0.5">
                        <MessageSquare className="h-3 w-3" />
                        Mentor Feedback ({sub.reviewedBy || "Reviewer"}):
                      </span>
                      <p className="text-foreground/90 italic">
                        &ldquo;{sub.mentorFeedback}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
