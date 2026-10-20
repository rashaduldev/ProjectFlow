"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { api, ApiConnectionError, ApiHttpError } from "@/lib/api/client"
import { Submission, SubmissionStatus } from "@/types/api"
import { ProjectSubmissionForm } from "./project-submission-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { SafeExternalLink } from "@/components/dashboard/shared/safe-external-link"
import {
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FolderGit2,
  AlertCircle,
  MessageSquare,
  GraduationCap,
  Layers,
  Sparkles,
} from "lucide-react"

function StatusPill({ status }: { status: SubmissionStatus }) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="warning" className="gap-1 text-[11px] font-semibold py-0.5">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    case "APPROVED":
      return (
        <Badge variant="success" className="gap-1 text-[11px] font-semibold py-0.5">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      )
    case "REJECTED":
      return (
        <Badge variant="destructive" className="gap-1 text-[11px] font-semibold py-0.5">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function StudentSubmissionsView({ section = "dashboard" }: { section?: "dashboard" | "new" | "submissions" }) {
  const { user } = useAuth()

  const [submissions, setSubmissions] = React.useState<Submission[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  React.useEffect(() => {
    if (!user) return
    let isMounted = true

    api.studentSubmissions
      .getMine(user.id)
      .then((data) => {
        if (isMounted) {
          setSubmissions(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err instanceof ApiConnectionError || err instanceof ApiHttpError || err instanceof Error
              ? err.message
              : "Failed to load submissions."
          setApiError(msg)
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [user, refreshTrigger])

  const handleManualRefresh = () => {
    setIsLoading(true)
    setApiError(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleNewSubmission = (newSub: Submission) => {
    setSubmissions((prev) => [newSub, ...prev])
  }

  // Student Submission Overview Metrics
  const totalCount = submissions.length
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length
  const approvedCount = submissions.filter((s) => s.status === "APPROVED").length
  const rejectedCount = submissions.filter((s) => s.status === "REJECTED").length

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Welcome Header */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-foreground">
              {section === "new" ? "New project submission" : section === "submissions" ? "My submissions" : `Welcome, ${user?.name || "Student"}`}
            </h1>
            <Badge variant="outline" className="text-[10px] gap-1 py-0">
              <GraduationCap className="h-3 w-3 text-primary" />
              Student View
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-6">
            {section === "submissions" ? "Review submission status, open project links, and read mentor feedback." : "Submit your project repository and live deployment URL for mentor evaluation. Monitor feedback and review statuses in real time."}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="text-xs gap-1.5 self-start sm:self-center h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Statuses
        </Button>
      </div>

      {/* Submission Overview Cards */}
      {section === "dashboard" && <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
      </div>}

      {/* New Project Submission Form (React Hook Form + Zod) */}
      {(section === "dashboard" || section === "new") && <ProjectSubmissionForm
        onSubmissionSuccess={handleNewSubmission}
      />}

      {/* Error state if fetching failed */}
      {apiError && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">API Communication Notice</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">{apiError}</AlertDescription>
        </Alert>
      )}

      {/* My Submissions List */}
      {(section === "dashboard" || section === "submissions") && <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-foreground">
            My Submissions ({submissions.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            Track evaluation outcomes
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-10 text-center space-y-2 bg-card rounded-xl border border-dashed border-border">
            <FolderGit2 className="h-8 w-8 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-semibold">No Submissions Yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {section === "submissions" ? "Your submitted projects will appear here." : "Use the form above to submit your project for mentor evaluation."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const submitDate = new Date(sub.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <div
                  key={sub.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3 shadow-xs hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-foreground">
                          {sub.projectName}
                        </h3>
                        <StatusPill status={sub.status} />
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Submitted on {submitDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <SafeExternalLink url={sub.liveUrl} label="Live Project" type="live" />
                      <SafeExternalLink
                        url={sub.githubUrl}
                        label="GitHub Repo"
                        type="github"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/50">
                    {sub.description}
                  </p>

                  {/* Mentor Feedback Display if reviewed */}
                  {sub.mentorFeedback && (
                    <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1">
                      <span className="font-semibold text-primary flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Mentor Feedback ({sub.reviewedBy || "Evaluator"}):
                      </span>
                      <p className="text-foreground/90 italic pl-1">
                        &ldquo;{sub.mentorFeedback}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>}
    </div>
  )
}
