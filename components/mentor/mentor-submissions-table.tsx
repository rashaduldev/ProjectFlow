"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { api, ApiConnectionError, ApiHttpError } from "@/lib/api/client"
import { Submission, SubmissionStatus } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { SafeExternalLink } from "@/components/dashboard/shared/safe-external-link"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  X,
  AlertCircle,
} from "lucide-react"

interface MentorSubmissionsTableProps {
  onDataChanged: () => void
}

export function MentorSubmissionsTable({ onDataChanged }: MentorSubmissionsTableProps) {
  const { user } = useAuth()

  // Table state
  const [submissions, setSubmissions] = React.useState<Submission[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)
  const pageSize = 5

  // Server-side filter state
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | SubmissionStatus>("ALL")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Loading & feedback states
  const [isLoading, setIsLoading] = React.useState(true)
  const [feedbackNotice, setFeedbackNotice] = React.useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Action dialog state (for approve or reject with feedback)
  const [actionTarget, setActionTarget] = React.useState<{
    submission: Submission
    type: "APPROVED" | "REJECTED"
  } | null>(null)
  const [reviewNote, setReviewNote] = React.useState("")
  const [isActionLoading, setIsActionLoading] = React.useState(false)

  const [refreshTrigger, setRefreshTrigger] = React.useState(0)

  // Server-side fetch call
  React.useEffect(() => {
    let isMounted = true

    api.submissions
      .getAll({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
      })
      .then((response) => {
        if (isMounted) {
          setSubmissions(response.data)
          setTotalPages(response.pagination.totalPages)
          setTotalCount(response.pagination.total)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err instanceof ApiConnectionError || err instanceof ApiHttpError || err instanceof Error
              ? err.message
              : "Failed to fetch submissions from server."
          setFeedbackNotice({ type: "error", message: msg })
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentPage, statusFilter, searchQuery, pageSize, refreshTrigger])

  const triggerRefresh = React.useCallback(() => {
    setIsLoading(true)
    setFeedbackNotice(null)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  // Reset page when filter changes
  const handleFilterChange = (newStatus: "ALL" | SubmissionStatus) => {
    setStatusFilter(newStatus)
    setCurrentPage(1)
    setIsLoading(true)
  }

  // Handle Approve or Reject
  const handleConfirmAction = async () => {
    if (!actionTarget) return

    setIsActionLoading(true)
    setFeedbackNotice(null)

    try {
      const updated = await api.submissions.updateStatus(
        actionTarget.submission.id,
        {
          status: actionTarget.type,
          feedback: reviewNote.trim() || undefined,
        },
        user?.name || "Mentor"
      )

      setFeedbackNotice({
        type: "success",
        message: `Submission for "${updated.projectName}" has been ${actionTarget.type.toLowerCase()} successfully.`,
      })

      setActionTarget(null)
      setReviewNote("")
      triggerRefresh()
      onDataChanged()
    } catch (err: unknown) {
      const msg =
        err instanceof ApiConnectionError || err instanceof ApiHttpError || err instanceof Error
          ? err.message
          : `Failed to update submission status to ${actionTarget.type}.`
      setFeedbackNotice({ type: "error", message: msg })
    } finally {
      setIsActionLoading(false)
    }
  }

  const renderStatusBadge = (status: SubmissionStatus) => {
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

  return (
    <div className="space-y-4">
      {/* Feedback Alert */}
      {feedbackNotice && (
        <Alert
          variant={feedbackNotice.type === "success" ? "success" : "destructive"}
          className="py-2.5 transition-all"
        >
          {feedbackNotice.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle className="text-xs font-semibold">
            {feedbackNotice.type === "success" ? "Action Succeeded" : "Action Notice"}
          </AlertTitle>
          <AlertDescription className="text-xs mt-0.5">
            {feedbackNotice.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Server-Side Filter Bar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by student name, email, or project name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={triggerRefresh}
            disabled={isLoading}
            className="text-xs gap-1.5 self-end sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
        </div>

        {/* Server-side status filters: All, Approved, Rejected, Pending */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/80 pt-3">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">
            Server Filter:
          </span>

          <button
            type="button"
            onClick={() => handleFilterChange("ALL")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            All Submissions
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("APPROVED")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
              statusFilter === "APPROVED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("REJECTED")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
              statusFilter === "REJECTED"
                ? "bg-destructive text-destructive-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <XCircle className="h-3 w-3" />
            Rejected
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("PENDING")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
              statusFilter === "PENDING"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Clock className="h-3 w-3" />
            Pending
          </button>
        </div>
      </div>

      {/* Paginated Submissions Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>
            Showing <strong>{submissions.length}</strong> of <strong>{totalCount}</strong> submissions
            {statusFilter !== "ALL" && ` (Filter: ${statusFilter})`}
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-xs text-muted-foreground bg-card rounded-xl border border-border">
            Loading submissions from server...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-10 text-center space-y-2 bg-card rounded-xl border border-dashed border-border">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-semibold">No Submissions Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No project submissions match your current server filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const submitDate = new Date(sub.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <div
                  key={sub.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs hover:border-primary/30 transition-all"
                >
                  {/* Left Column: Student info and project details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="size-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                        {sub.studentName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm text-foreground">
                        {sub.studentName}
                      </span>
                      <span className="text-xs text-muted-foreground">({sub.studentEmail})</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{submitDate}</span>
                      {renderStatusBadge(sub.status)}
                    </div>

                    <h4 className="font-bold text-base text-foreground truncate">
                      {sub.projectName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 pt-0.5">
                      <SafeExternalLink url={sub.liveUrl} label="Live Project" type="live" />
                      <SafeExternalLink url={sub.githubUrl} label="GitHub Repo" type="github" />
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {sub.description}
                    </p>

                    {sub.mentorFeedback && (
                      <div className="text-xs text-foreground/90 italic bg-muted/30 p-2 rounded border border-border">
                        <strong>Mentor Note ({sub.reviewedBy || "Evaluator"}):</strong> &ldquo;{sub.mentorFeedback}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Right Column: Approve / Reject Action Buttons */}
                  <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-border shrink-0">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActionTarget({ submission: sub, type: "REJECTED" })
                          setReviewNote("")
                        }}
                        className="text-xs gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          setActionTarget({ submission: sub, type: "APPROVED" })
                          setReviewNote("")
                        }}
                        className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4 px-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="text-xs gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`size-7 rounded text-xs font-semibold transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="text-xs gap-1"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Modal for Approve or Reject Feedback */}
      {actionTarget && (
        <Dialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                {actionTarget.type === "APPROVED" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                {actionTarget.type === "APPROVED" ? "Approve Submission" : "Reject Submission"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {actionTarget.submission.projectName} • Submitted by {actionTarget.submission.studentName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="block text-xs font-semibold">
                Mentor Feedback / Instructions for Student{" "}
                {actionTarget.type === "REJECTED" && <span className="text-destructive">*</span>}
              </label>
              <Textarea
                placeholder={
                  actionTarget.type === "APPROVED"
                    ? "Great work on this project! (Optional remarks)..."
                    : "Explain specifically what needs to be fixed or updated..."
                }
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionTarget(null)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAction}
                disabled={isActionLoading || (actionTarget.type === "REJECTED" && !reviewNote.trim())}
                className={
                  actionTarget.type === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-destructive hover:bg-destructive/90 text-white"
                }
              >
                {isActionLoading
                  ? "Saving..."
                  : actionTarget.type === "APPROVED"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
