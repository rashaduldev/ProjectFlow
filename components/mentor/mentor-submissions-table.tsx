"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/context/auth-context"
import { api, ApiConnectionError, ApiHttpError } from "@/lib/api/client"
import { Submission, SubmissionStatus } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  HelpCircle,
} from "lucide-react"

export function MentorSubmissionsTable() {
  const { user, apiMode } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const pageSize = 5
  const rawPage = Number(searchParams.get("page") || "1")
  const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const rawStatus = searchParams.get("status")
  const statusFilter: "ALL" | SubmissionStatus =
    rawStatus === "PENDING" || rawStatus === "APPROVED" || rawStatus === "REJECTED" ? rawStatus : "ALL"
  const searchQuery = searchParams.get("search")?.trim() ?? ""
  const [searchDraft, setSearchDraft] = React.useState(searchQuery)
  const [feedbackNotice, setFeedbackNotice] = React.useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [actionTarget, setActionTarget] = React.useState<{
    submission: Submission
    type: "APPROVED" | "REJECTED"
  } | null>(null)
  const [reviewNote, setReviewNote] = React.useState("")
  const updateUrl = React.useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  React.useEffect(() => {
    setSearchDraft(searchQuery)
  }, [searchQuery])

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchDraft.trim() !== searchQuery) {
        updateUrl({ search: searchDraft.trim() || null, page: null })
      }
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [searchDraft, searchQuery, updateUrl])

  const submissionsKey = ["mentor-submissions", apiMode, user?.id] as const
  const submissionsQuery = useQuery({
    queryKey: [...submissionsKey, currentPage, pageSize, statusFilter, searchQuery],
    queryFn: () => api.submissions.getAll({
      page: currentPage,
      limit: pageSize,
      status: statusFilter,
      search: searchQuery || undefined,
    }),
    enabled: user?.role === "MENTOR",
    placeholderData: keepPreviousData,
  })
  const submissions = submissionsQuery.data?.data ?? []
  const totalPages = Math.max(1, submissionsQuery.data?.pagination.totalPages ?? 1)
  const totalCount = submissionsQuery.data?.pagination.total ?? 0
  const isLoading = submissionsQuery.isPending || submissionsQuery.isFetching

  React.useEffect(() => {
    if (submissionsQuery.data && currentPage > totalPages) {
      updateUrl({ page: String(totalPages) })
    }
  }, [currentPage, submissionsQuery.data, totalPages, updateUrl])

  const handleRefresh = () => {
    setFeedbackNotice(null)
    void submissionsQuery.refetch()
  }

  const handleFilterChange = (newStatus: "ALL" | SubmissionStatus) => {
    updateUrl({ status: newStatus === "ALL" ? null : newStatus, page: null })
  }

  const mutation = useMutation({
    mutationFn: (input: { id: string; status: "APPROVED" | "REJECTED"; feedback?: string }) =>
      api.submissions.updateStatus(input.id, { status: input.status, feedback: input.feedback }, user?.name || "Mentor"),
    onSuccess: async (updated, variables) => {
      setFeedbackNotice({
        type: "success",
        message: `Submission "${updated.projectName}" has been ${variables.status.toLowerCase()} successfully.`,
      })
      setActionTarget(null)
      setReviewNote("")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: submissionsKey }),
        queryClient.invalidateQueries({ queryKey: ["mentor-stats", apiMode, user?.id] }),
      ])
    },
  })

  const handleConfirmAction = async () => {
    if (!actionTarget || mutation.isPending) return
    setFeedbackNotice(null)
    try {
      await mutation.mutateAsync({
        id: actionTarget.submission.id,
        status: actionTarget.type,
        feedback: reviewNote.trim() || undefined,
      })
    } catch (err: unknown) {
      const msg =
        err instanceof ApiConnectionError || err instanceof ApiHttpError || err instanceof Error
          ? err.message
          : `Failed to update submission status to ${actionTarget.type}.`
      setFeedbackNotice({ type: "error", message: msg })
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
      {submissionsQuery.isError && (
        <Alert variant="destructive" className="py-2.5" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Could not load submissions</AlertTitle>
          <AlertDescription className="mt-0.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>{submissionsQuery.error instanceof Error ? submissionsQuery.error.message : "The submission queue could not be loaded."}</span>
            <Button variant="outline" size="sm" onClick={() => void submissionsQuery.refetch()} disabled={submissionsQuery.isFetching}>Try again</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Mutation feedback */}
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

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <label htmlFor="submission-search" className="sr-only">Search submissions</label>
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="submission-search"
              placeholder="Search by student or project name..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-xs gap-1.5 self-end sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
        </div>

        {/* Server-Side Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/80 pt-3">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">
            Server Filter:
          </span>

          <button
            type="button"
            onClick={() => handleFilterChange("ALL")}
            aria-pressed={statusFilter === "ALL"}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            All Submissions
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("APPROVED")}
            aria-pressed={statusFilter === "APPROVED"}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
              statusFilter === "APPROVED"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("REJECTED")}
            aria-pressed={statusFilter === "REJECTED"}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
              statusFilter === "REJECTED"
                ? "bg-destructive text-destructive-foreground shadow-xs font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <XCircle className="h-3 w-3" />
            Rejected
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("PENDING")}
            aria-pressed={statusFilter === "PENDING"}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
              statusFilter === "PENDING"
                ? "bg-amber-600 text-white shadow-xs font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Clock className="h-3 w-3" />
            Pending
          </button>
        </div>
      </div>

      {/* Paginated Submissions Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border text-xs text-muted-foreground">
          <span>
            Total Submissions: <strong>{totalCount}</strong>
            {statusFilter !== "ALL" && ` (Filtered by ${statusFilter})`}
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : submissionsQuery.isError && !submissionsQuery.data ? null : submissions.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-semibold text-foreground">No Submissions Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are no submissions matching your search query or server filter.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Project Details</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => {
                const dateStr = new Date(sub.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <TableRow key={sub.id}>
                    {/* Student Info */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-semibold block text-foreground">
                          {sub.studentName}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {sub.studentEmail}
                        </span>
                      </div>
                    </TableCell>

                    {/* Project Name & Description */}
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-foreground block truncate">
                          {sub.projectName}
                        </span>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {sub.description}
                        </p>
                        {sub.mentorFeedback && (
                          <div className="text-[10px] text-primary italic bg-primary/5 p-1 rounded border border-primary/20">
                            Note: &ldquo;{sub.mentorFeedback}&rdquo;
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Repository and Live URLs */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <SafeExternalLink url={sub.liveUrl} label="Live URL" type="live" showCopy={false} />
                        <SafeExternalLink url={sub.githubUrl} label="GitHub" type="github" showCopy={false} />
                      </div>
                    </TableCell>

                    {/* Submission Date */}
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {dateStr}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>{renderStatusBadge(sub.status)}</TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActionTarget({ submission: sub, type: "REJECTED" })
                            setReviewNote("")
                          }}
                          disabled={mutation.isPending}
                          className="text-xs h-7 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            setActionTarget({ submission: sub, type: "APPROVED" })
                            setReviewNote("")
                          }}
                          disabled={mutation.isPending}
                          className="text-xs h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateUrl({ page: String(Math.max(1, currentPage - 1)) })}
              disabled={currentPage <= 1 || isLoading}
              className="text-xs gap-1 h-8"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => updateUrl({ page: String(pageNum) })}
                    aria-current={currentPage === pageNum ? "page" : undefined}
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
              onClick={() => updateUrl({ page: String(Math.min(totalPages, currentPage + 1)) })}
              disabled={currentPage >= totalPages || isLoading}
              className="text-xs gap-1 h-8"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog Before Approving or Rejecting */}
      {actionTarget && (
        <Dialog open={!!actionTarget} onOpenChange={(open) => { if (!open && !mutation.isPending) setActionTarget(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                {actionTarget.type === "APPROVED" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                Confirm {actionTarget.type === "APPROVED" ? "Approval" : "Rejection"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Are you sure you want to {actionTarget.type.toLowerCase()} <strong>{actionTarget.submission.projectName}</strong> submitted by {actionTarget.submission.studentName}?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label htmlFor="mentor-review-feedback" className="block text-xs font-semibold">
                Mentor Feedback & Instructions for Student{" "}
                {actionTarget.type === "REJECTED" && <span className="text-destructive">*</span>}
              </label>
              <Textarea
                id="mentor-review-feedback"
                placeholder={
                  actionTarget.type === "APPROVED"
                    ? "Great execution on this project! (Optional remarks)..."
                    : "Specify the required revisions (e.g. fix live 404 reload, add README credentials)..."
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
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAction}
                disabled={mutation.isPending || (actionTarget.type === "REJECTED" && !reviewNote.trim())}
                className={
                  actionTarget.type === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-destructive hover:bg-destructive/90 text-white"
                }
              >
                {mutation.isPending
                  ? "Processing..."
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
