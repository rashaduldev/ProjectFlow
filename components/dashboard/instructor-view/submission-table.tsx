"use client"

import * as React from "react"
import {
  Award,
  Clock,
  Eye,
  FileEdit,
  FilterX,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Submission } from "@/types/dashboard"
import { useDashboard } from "@/context/dashboard-context"
import { StatusBadge } from "../shared/status-badge"
import { SafeExternalLink } from "../shared/safe-external-link"
import { EvaluationModal } from "./evaluation-modal"
import { FeedbackDetailDialog } from "../shared/feedback-detail-dialog"

export function SubmissionTable() {
  const { submissions, filters, setFilters, startReview } = useDashboard()

  const [selectedForEvaluation, setSelectedForEvaluation] = React.useState<Submission | null>(null)
  const [selectedForDetails, setSelectedForDetails] = React.useState<Submission | null>(null)
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = React.useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false)

  // Filter and sort submissions
  const filteredSubmissions = React.useMemo(() => {
    return submissions
      .filter((sub) => {
        // Status filter
        if (filters.status !== "all" && sub.status !== filters.status) {
          return false
        }

        // Assignment filter
        if (filters.assignmentId !== "all" && sub.assignmentId !== filters.assignmentId) {
          return false
        }

        // Search filter (name, studentId, assignment title, email)
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase().trim()
          const matchName = sub.studentName.toLowerCase().includes(q)
          const matchId = sub.studentId.toLowerCase().includes(q)
          const matchEmail = sub.studentEmail.toLowerCase().includes(q)
          const matchTitle = sub.assignmentTitle.toLowerCase().includes(q)
          if (!matchName && !matchId && !matchEmail && !matchTitle) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (filters.sortBy === "date_asc") {
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        }
        if (filters.sortBy === "date_desc") {
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        }
        if (filters.sortBy === "score_desc") {
          const scoreA = a.evaluation?.totalScore || 0
          const scoreB = b.evaluation?.totalScore || 0
          return scoreB - scoreA
        }
        if (filters.sortBy === "score_asc") {
          const scoreA = a.evaluation?.totalScore || 0
          const scoreB = b.evaluation?.totalScore || 0
          return scoreA - scoreB
        }
        return 0
      })
  }, [submissions, filters])

  const handleStartReview = (sub: Submission) => {
    startReview(sub.id)
    setSelectedForEvaluation(sub)
    setIsEvaluationModalOpen(true)
  }

  const handleOpenEvaluation = (sub: Submission) => {
    setSelectedForEvaluation(sub)
    setIsEvaluationModalOpen(true)
  }

  const handleOpenDetails = (sub: Submission) => {
    setSelectedForDetails(sub)
    setIsDetailsModalOpen(true)
  }

  if (filteredSubmissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3 bg-card">
        <FilterX className="h-8 w-8 text-muted-foreground mx-auto" />
        <h4 className="font-semibold text-sm">No Matching Submissions Found</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No student submissions match your current filter and search criteria.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setFilters({
              search: "",
              status: "all",
              assignmentId: "all",
              sortBy: "date_desc",
            })
          }
          className="text-xs"
        >
          Reset Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong>{filteredSubmissions.length}</strong> of{" "}
          <strong>{submissions.length}</strong> submissions
        </span>
      </div>

      <div className="space-y-3">
        {filteredSubmissions.map((sub) => {
          const submitDate = new Date(sub.submittedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })

          return (
            <div
              key={sub.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-primary/30 transition-all shadow-xs"
            >
              {/* Left Column: Student info and submission links */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Student avatar bubble */}
                  <div className="size-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                    {sub.studentName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm text-foreground">
                    {sub.studentName}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ({sub.studentId})
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{submitDate}</span>
                  {sub.revisionCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      Revision #{sub.revisionCount}
                    </Badge>
                  )}
                  <StatusBadge status={sub.status} />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                    {sub.milestone}
                  </span>
                  <h4 className="font-semibold text-base text-foreground truncate">
                    {sub.assignmentTitle}
                  </h4>
                </div>

                {/* Quick Link bar */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <SafeExternalLink url={sub.liveUrl} label="Live Demo" type="live" />
                  <SafeExternalLink
                    url={sub.githubClientUrl}
                    label="Client Repo"
                    type="github"
                  />
                  {sub.githubServerUrl && (
                    <SafeExternalLink
                      url={sub.githubServerUrl}
                      label="Server Repo"
                      type="github"
                    />
                  )}
                  {sub.videoDemoUrl && (
                    <SafeExternalLink
                      url={sub.videoDemoUrl}
                      label="Walkthrough"
                      type="video"
                    />
                  )}
                </div>

                {sub.studentNotes && (
                  <p className="text-xs text-muted-foreground italic line-clamp-1 bg-muted/30 px-2 py-1 rounded">
                    &ldquo;{sub.studentNotes}&rdquo;
                  </p>
                )}
              </div>

              {/* Right Column: Score, Evaluator info and Action buttons */}
              <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-border shrink-0">
                {sub.evaluation ? (
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-muted-foreground block">
                      Awarded Marks
                    </span>
                    <span className="text-xl font-extrabold text-foreground">
                      {sub.evaluation.totalScore}{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        / {sub.evaluation.maxPossibleScore}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Awaiting Grading
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {sub.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleStartReview(sub)}
                      className="text-xs gap-1.5"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Start Review
                    </Button>
                  )}

                  {sub.status === "in_review" && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenEvaluation(sub)}
                      className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Eye className="h-3 w-3" />
                      Continue Evaluation
                    </Button>
                  )}

                  {(sub.status === "passed" || sub.status === "needs_revision") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetails(sub)}
                        className="text-xs gap-1"
                      >
                        <Award className="h-3.5 w-3.5" />
                        Report
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenEvaluation(sub)}
                        className="text-xs gap-1"
                      >
                        <FileEdit className="h-3.5 w-3.5" />
                        Edit Grade
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Evaluation Workspace Modal */}
      <EvaluationModal
        open={isEvaluationModalOpen}
        onOpenChange={setIsEvaluationModalOpen}
        submission={selectedForEvaluation}
      />

      {/* Grade Report Sheet Modal */}
      <FeedbackDetailDialog
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        submission={selectedForDetails}
      />
    </div>
  )
}
