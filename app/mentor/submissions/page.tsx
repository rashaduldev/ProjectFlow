"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import {
  useMentorSubmissions,
  useUpdateSubmissionStatus,
} from "@/lib/hooks/use-submissions"
import { Submission, SubmissionStatus } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  FolderGit2,
} from "lucide-react"

function SubmissionsTableContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Read URL search params for shareable filter and pagination state
  const pageParam = Number(searchParams.get("page")) || 1
  const statusParam = (searchParams.get("status") as "ALL" | SubmissionStatus) || "ALL"
  const searchParam = searchParams.get("search") || ""

  const [searchInput, setSearchInput] = React.useState(searchParam)

  // Server-side query via TanStack Query
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useMentorSubmissions({
    page: pageParam,
    limit: 5,
    status: statusParam,
    search: searchParam || undefined,
  })

  const updateMutation = useUpdateSubmissionStatus()

  // Confirmation dialog state before approving/rejecting
  const [actionTarget, setActionTarget] = React.useState<{
    submission: Submission
    type: "APPROVED" | "REJECTED"
  } | null>(null)
  const [reviewNote, setReviewNote] = React.useState("")
  const [feedbackNotice, setFeedbackNotice] = React.useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Helper to update URL search parameters
  const updateUrlParams = React.useCallback(
    (updates: { page?: number; status?: string; search?: string }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.page !== undefined) {
        if (updates.page === 1) params.delete("page")
        else params.set("page", String(updates.page))
      }

      if (updates.status !== undefined) {
        if (updates.status === "ALL") params.delete("status")
        else params.set("status", updates.status)
      }

      if (updates.search !== undefined) {
        if (!updates.search.trim()) params.delete("search")
        else params.set("search", updates.search.trim())
      }

      const qs = params.toString() ? `?${params.toString()}` : ""
      router.push(`${pathname}${qs}`)
    },
    [searchParams, pathname, router]
  )

  const handleStatusFilter = (st: "ALL" | SubmissionStatus) => {
    updateUrlParams({ status: st, page: 1 })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchInput, page: 1 })
  }

  // Handle Approve or Reject execution with confirmation
  const handleConfirmAction = async () => {
    if (!actionTarget) return

    setFeedbackNotice(null)

    try {
      const updated = await updateMutation.mutateAsync({
        id: actionTarget.submission.id,
        payload: {
          status: actionTarget.type,
          feedback: reviewNote.trim() || undefined,
        },
        mentorName: user?.name || "Mentor",
      })

      setFeedbackNotice({
        type: "success",
        message: `Project "${updated.projectName}" has been ${actionTarget.type.toLowerCase()} successfully.`,
      })
      setActionTarget(null)
      setReviewNote("")
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : `Failed to update status to ${actionTarget.type}.`
      setFeedbackNotice({ type: "error", message: msg })
    }
  }

  const submissions = response?.data || []
  const totalPages = response?.pagination.totalPages || 1
  const totalCount = response?.pagination.total || 0

  return (
    <div className="space-y-4">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Submissions Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Paginated submissions table with server-side filtering and status moderation.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching || isLoading}
          className="text-xs gap-1.5 h-8 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Action feedback */}
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

      {error && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Server Query Error</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">
            {error instanceof Error ? error.message : "Failed to load submissions."}
          </AlertDescription>
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by student name, email, or project name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="text-xs h-9">
            Search
          </Button>
        </form>

        {/* Server-Side Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/80 pt-3">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">
            Server Filter:
          </span>

          {(["ALL", "APPROVED", "REJECTED", "PENDING"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => handleStatusFilter(st)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                statusParam === st
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border text-xs text-muted-foreground">
          <span>
            Total Results: <strong>{totalCount}</strong>
            {statusParam !== "ALL" && ` (Filtered: ${statusParam})`}
          </span>
          <span>Page {pageParam} of {totalPages}</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <FolderGit2 className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No Submissions Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No submissions match your query or filter parameters.
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
                    {/* Student */}
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

                    {/* Project */}
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

                    {/* Links */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <SafeExternalLink url={sub.liveUrl} label="Live Demo" type="live" showCopy={false} />
                        <SafeExternalLink url={sub.githubUrl} label="GitHub" type="github" showCopy={false} />
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {dateStr}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
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
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActionTarget({ submission: sub, type: "REJECTED" })
                            setReviewNote("")
                          }}
                          disabled={updateMutation.isPending}
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
                          disabled={updateMutation.isPending}
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
              onClick={() => updateUrlParams({ page: Math.max(1, pageParam - 1) })}
              disabled={pageParam <= 1 || isLoading}
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
                    onClick={() => updateUrlParams({ page: pageNum })}
                    className={`size-7 rounded text-xs font-semibold transition-colors ${
                      pageParam === pageNum
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
              onClick={() => updateUrlParams({ page: Math.min(totalPages, pageParam + 1) })}
              disabled={pageParam >= totalPages || isLoading}
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
        <Dialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
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
              <label className="block text-xs font-semibold text-foreground">
                Mentor Feedback & Instructions for Student{" "}
                {actionTarget.type === "REJECTED" && <span className="text-destructive">*</span>}
              </label>
              <Textarea
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
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAction}
                disabled={updateMutation.isPending || (actionTarget.type === "REJECTED" && !reviewNote.trim())}
                className={
                  actionTarget.type === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-destructive hover:bg-destructive/90 text-white"
                }
              >
                {updateMutation.isPending
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

export default function MentorSubmissionsPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
      <SubmissionsTableContent />
    </React.Suspense>
  )
}
