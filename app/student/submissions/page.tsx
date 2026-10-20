"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useMySubmissions } from "@/lib/hooks/use-submissions"
import { SubmissionStatus } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { SafeExternalLink } from "@/components/dashboard/shared/safe-external-link"
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Send,
  FolderGit2,
  AlertCircle,
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

export function StudentSubmissionsPage() {
  const { user } = useAuth()
  const { data: submissions = [], isLoading, error, refetch, isRefetching } = useMySubmissions(user?.id)

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | SubmissionStatus>("ALL")

  const filtered = React.useMemo(() => {
    return submissions.filter((sub) => {
      if (statusFilter !== "ALL" && sub.status !== statusFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        return (
          sub.projectName.toLowerCase().includes(q) ||
          sub.description.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [submissions, statusFilter, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            My Submissions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete list of your project submissions, evaluation statuses, and mentor feedback notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/student/submissions/new">
            <Button size="sm" className="text-xs gap-1.5 h-8">
              <Send className="h-3.5 w-3.5" />
              Submit Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Communication Notice</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">
            {error instanceof Error ? error.message : "Failed to load submissions."}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by project name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(["ALL", "APPROVED", "REJECTED", "PENDING"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border text-xs text-muted-foreground">
          <span>
            Total Submissions: <strong>{filtered.length}</strong>
            {statusFilter !== "ALL" && ` (Filtered by ${statusFilter})`}
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <FolderGit2 className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No Submissions Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No project submissions match your current search or filter query.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Artifact Links</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Review Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => {
                const dateStr = new Date(sub.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-bold text-foreground">
                      {sub.projectName}
                    </TableCell>

                    <TableCell className="max-w-md">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {sub.description}
                        </p>
                        {sub.mentorFeedback && (
                          <div className="text-[11px] text-primary italic bg-primary/5 p-1.5 rounded border border-primary/20">
                            <strong>Mentor ({sub.reviewedBy || "Evaluator"}):</strong> &ldquo;{sub.mentorFeedback}&rdquo;
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <SafeExternalLink url={sub.liveUrl} label="Live Demo" type="live" showCopy={false} />
                        <SafeExternalLink url={sub.githubUrl} label="Client Code" type="github" showCopy={false} />
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {dateStr}
                    </TableCell>

                    <TableCell>
                      <StatusPill status={sub.status} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

export default StudentSubmissionsPage
