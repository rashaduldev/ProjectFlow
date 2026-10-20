"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { api, ApiConnectionError, ApiHttpError } from "@/lib/api/client"
import { Submission, SubmissionStatus } from "@/types/api"
import { ProjectSubmissionForm } from "./project-submission-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SafeExternalLink } from "@/components/dashboard/shared/safe-external-link"
import {
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FolderGit2,
  AlertCircle,
  MessageSquare,
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

export function StudentSubmissionsView() {
  const { user } = useAuth()

  const [submissions, setSubmissions] = React.useState<Submission[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  React.useEffect(() => {
    if (!user) return
    let isMounted = true

    api.submissions
      .getMySubmissions(user.id)
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Welcome, {user?.name || "Student"}! 🎓
              </h2>
              <Badge variant="outline" className="text-[10px]">
                Student View
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Submit your project repository and live URL for mentor review. Monitor your status in real time.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="text-xs gap-1.5 self-start sm:self-center"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Statuses
          </Button>
        </div>
      </div>

      {/* Submission Form */}
      <ProjectSubmissionForm
        existingSubmissions={submissions}
        onSubmissionSuccess={handleNewSubmission}
      />

      {/* Error state if fetching failed */}
      {apiError && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">API Communication Notice</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">{apiError}</AlertDescription>
        </Alert>
      )}

      {/* My Submissions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-semibold text-foreground">
            Your Submissions ({submissions.length})
          </h3>
          <span className="text-xs text-muted-foreground">
            Statuses: Pending, Approved, or Rejected
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-card rounded-xl border border-border">
            Loading your project submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-card rounded-xl border border-dashed border-border">
            <FolderGit2 className="h-8 w-8 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-semibold">No Submissions Yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Use the form above to submit your first project for mentor evaluation.
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
                        <h4 className="font-bold text-base text-foreground">
                          {sub.projectName}
                        </h4>
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
      </div>
    </div>
  )
}

