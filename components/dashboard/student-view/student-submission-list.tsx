"use client"

import * as React from "react"
import {
  Award,
  Info,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Submission } from "@/types/dashboard"
import { useDashboard } from "@/context/dashboard-context"
import { StatusBadge } from "../shared/status-badge"
import { SafeExternalLink } from "../shared/safe-external-link"
import { FeedbackDetailDialog } from "../shared/feedback-detail-dialog"
import { SubmissionModal } from "./submission-modal"

export function StudentSubmissionList() {
  const { submissions, currentStudent, assignments } = useDashboard()

  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null)
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false)
  const [isResubmitOpen, setIsResubmitOpen] = React.useState(false)

  // Filter only for current student
  const studentSubmissions = submissions.filter(
    (s) => s.studentId === currentStudent.id
  )

  const handleViewFeedback = (sub: Submission) => {
    setSelectedSubmission(sub)
    setIsFeedbackOpen(true)
  }

  const handleResubmit = (sub: Submission) => {
    setSelectedSubmission(sub)
    setIsResubmitOpen(true)
  }

  const currentAssignment = selectedSubmission
    ? assignments.find((a) => a.id === selectedSubmission.assignmentId) || null
    : null

  if (studentSubmissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3 bg-muted/20">
        <Info className="h-8 w-8 text-muted-foreground mx-auto" />
        <h4 className="font-semibold text-sm">No Submissions Yet</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          You haven&apos;t submitted any projects yet. Select one of the available assignments above to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Your Submission History & Feedback
        </h3>
        <p className="text-xs text-muted-foreground">
          Track the evaluation status of your submitted projects, review instructor comments, and address required revisions.
        </p>
      </div>

      <div className="space-y-3">
        {studentSubmissions.map((sub) => {
          const submitDate = new Date(sub.submittedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          const needsRevision = sub.status === "needs_revision"

          return (
            <div
              key={sub.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors shadow-xs"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-primary">
                    {sub.milestone}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">Submitted {submitDate}</span>
                  {sub.revisionCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      Revision #{sub.revisionCount}
                    </Badge>
                  )}
                  <StatusBadge status={sub.status} />
                </div>

                <h4 className="font-semibold text-base text-foreground truncate">
                  {sub.assignmentTitle}
                </h4>

                {/* Submitted Links */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <SafeExternalLink url={sub.liveUrl} label="Live Demo" type="live" />
                  <SafeExternalLink
                    url={sub.githubClientUrl}
                    label="Client Code"
                    type="github"
                  />
                  {sub.githubServerUrl && (
                    <SafeExternalLink
                      url={sub.githubServerUrl}
                      label="Server Code"
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

                {/* Student's notes if any */}
                {sub.studentNotes && (
                  <p className="text-xs text-muted-foreground italic line-clamp-1">
                    &ldquo;{sub.studentNotes}&rdquo;
                  </p>
                )}
              </div>

              {/* Score & Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-border shrink-0">
                {sub.evaluation ? (
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">
                      Score Awarded
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {sub.evaluation.totalScore}{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        / {sub.evaluation.maxPossibleScore}
                      </span>
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Awaiting Evaluation
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {needsRevision && (
                    <Button
                      size="sm"
                      onClick={() => handleResubmit(sub)}
                      className="text-xs gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Resubmit Fixes
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant={needsRevision ? "outline" : "default"}
                    onClick={() => handleViewFeedback(sub)}
                    className="text-xs gap-1"
                  >
                    <Award className="h-3.5 w-3.5" />
                    {sub.evaluation ? "View Feedback" : "Details"}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      <FeedbackDetailDialog
        open={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
        submission={selectedSubmission}
      />

      <SubmissionModal
        open={isResubmitOpen}
        onOpenChange={setIsResubmitOpen}
        assignment={currentAssignment}
        existingSubmission={selectedSubmission}
      />
    </div>
  )
}
