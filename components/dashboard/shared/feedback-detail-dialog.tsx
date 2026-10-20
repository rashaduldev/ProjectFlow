"use client"

import * as React from "react"
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  User,
  History,
  TrendingUp,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Submission } from "@/types/dashboard"
import { StatusBadge } from "./status-badge"
import { SafeExternalLink } from "./safe-external-link"

interface FeedbackDetailDialogProps {
  submission: Submission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackDetailDialog({
  submission,
  open,
  onOpenChange,
}: FeedbackDetailDialogProps) {
  if (!submission) return null

  const evaluation = submission.evaluation

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {submission.milestone}
              </span>
              <DialogTitle className="text-xl mt-1">
                {submission.assignmentTitle}
              </DialogTitle>
              <DialogDescription>
                Student: {submission.studentName} ({submission.studentId})
              </DialogDescription>
            </div>
            <StatusBadge status={submission.status} />
          </div>
        </DialogHeader>

        {evaluation ? (
          <div className="space-y-6">
            {/* Score summary card */}
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">
                    Evaluation Result
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold tracking-tight">
                      {evaluation.totalScore}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {evaluation.maxPossibleScore} marks
                    </span>
                    <Badge
                      variant={evaluation.status === "passed" ? "success" : "destructive"}
                      className="ml-2"
                    >
                      {evaluation.status === "passed" ? "Passed" : "Revision Required"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background px-3 py-2 rounded-lg border border-border">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Evaluator: {evaluation.evaluatorName}</span>
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Score percentage</span>
                  <span className="font-medium text-foreground">
                    {Math.round((evaluation.totalScore / evaluation.maxPossibleScore) * 100)}%
                  </span>
                </div>
                <Progress
                  value={evaluation.totalScore}
                  max={evaluation.maxPossibleScore}
                  indicatorColor={
                    evaluation.status === "passed"
                      ? "bg-emerald-500"
                      : "bg-destructive"
                  }
                />
              </div>
            </div>

            {/* Rubric Criteria Breakdown */}
            {evaluation.rubricScores && evaluation.rubricScores.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Rubric Criteria Breakdown
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {evaluation.rubricScores.map((score) => {
                    return (
                      <div
                        key={score.id}
                        className="rounded-lg border border-border/80 bg-card p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium truncate">
                            {score.criteria}
                          </span>
                          <span className="text-xs font-bold shrink-0">
                            {score.score} / {score.maxMarks}
                          </span>
                        </div>
                        <Progress value={score.score} max={score.maxMarks} />
                        {score.feedback && (
                          <p className="text-xs text-muted-foreground italic">
                            &ldquo;{score.feedback}&rdquo;
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* General Feedback */}
            {evaluation.generalFeedback && (
              <div className="space-y-2 rounded-lg border border-border p-4 bg-background">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Evaluator&apos;s Remarks
                </h4>
                <p className="text-sm leading-relaxed text-foreground">
                  {evaluation.generalFeedback}
                </p>
              </div>
            )}

            {/* Strengths & Improvements */}
            <div className="grid gap-4 sm:grid-cols-2">
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                  <h5 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                    <CheckCircle2 className="h-4 w-4" />
                    Key Strengths Observed
                  </h5>
                  <ul className="space-y-1.5 text-xs text-foreground/90 pl-1">
                    {evaluation.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                  <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase">
                    <TrendingUp className="h-4 w-4" />
                    Areas for Improvement
                  </h5>
                  <ul className="space-y-1.5 text-xs text-foreground/90 pl-1">
                    {evaluation.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Links and Submission context */}
            <div className="rounded-lg border border-border p-3 flex flex-wrap gap-4 items-center bg-muted/20">
              <span className="text-xs font-medium text-muted-foreground">
                Submitted Links:
              </span>
              <SafeExternalLink
                url={submission.liveUrl}
                label="Live Demo"
                type="live"
              />
              <SafeExternalLink
                url={submission.githubClientUrl}
                label="Client Repo"
                type="github"
              />
              {submission.githubServerUrl && (
                <SafeExternalLink
                  url={submission.githubServerUrl}
                  label="Server Repo"
                  type="github"
                />
              )}
              {submission.videoDemoUrl && (
                <SafeExternalLink
                  url={submission.videoDemoUrl}
                  label="Video Demo"
                  type="video"
                />
              )}
            </div>

            {/* Submission History / Audit Trail */}
            {submission.history && submission.history.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  Submission & Revision Timeline
                </h5>
                <div className="space-y-2">
                  {submission.history.map((hist, i) => (
                    <div
                      key={i}
                      className="text-xs flex items-start justify-between gap-3 p-2 rounded bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <StatusBadge status={hist.status} showIcon={false} />
                        <span className="text-foreground">{hist.note}</span>
                      </div>
                      <span className="text-muted-foreground shrink-0">
                        {new Date(hist.timestamp).toLocaleDateString()}{" "}
                        {new Date(hist.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
            <h4 className="font-semibold text-foreground">
              Evaluation In Progress
            </h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This assignment is currently in the evaluation queue. The instructor will review your code structure, live deployment, and rubric criteria shortly.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
