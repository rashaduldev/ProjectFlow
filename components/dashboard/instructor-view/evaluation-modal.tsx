"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Submission, RubricScore, Assignment } from "@/types/dashboard"
import { INSTRUCTOR_FEEDBACK_PRESETS } from "@/lib/mock-data"
import { useDashboard } from "@/context/dashboard-context"
import { SafeExternalLink } from "../shared/safe-external-link"
import { StatusBadge } from "../shared/status-badge"
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react"

interface EvaluationModalProps {
  submission: Submission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function EvaluationForm({
  submission,
  assignment,
  onClose,
  onSuccess,
}: {
  submission: Submission
  assignment: Assignment | null
  onClose: () => void
  onSuccess?: () => void
}) {
  const { evaluateSubmission } = useDashboard()

  const [rubricScores, setRubricScores] = React.useState<RubricScore[]>(() => {
    if (submission.evaluation) {
      return submission.evaluation.rubricScores
    }
    if (assignment) {
      return assignment.recommendedRubric.map((r, i) => ({
        id: `r-${i + 1}`,
        criteria: r.criteria,
        maxMarks: r.maxMarks,
        score: Math.floor(r.maxMarks * 0.8),
        feedback: "",
      }))
    }
    return []
  })

  const [generalFeedback, setGeneralFeedback] = React.useState(
    () => submission.evaluation?.generalFeedback || ""
  )
  const [strengths, setStrengths] = React.useState<string[]>(
    () => submission.evaluation?.strengths || []
  )
  const [improvements, setImprovements] = React.useState<string[]>(
    () => submission.evaluation?.improvements || []
  )

  const [newStrengthInput, setNewStrengthInput] = React.useState("")
  const [newImprovementInput, setNewImprovementInput] = React.useState("")
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Calculate live total score
  const totalScore = React.useMemo(() => {
    return rubricScores.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0)
  }, [rubricScores])

  const maxPossibleScore = assignment ? assignment.totalMarks : 60
  const passingMarks = assignment ? assignment.passingMarks : 50
  const isPassing = totalScore >= passingMarks

  const handleScoreChange = (id: string, newScore: number, max: number) => {
    const clamped = Math.min(Math.max(0, newScore), max)
    setRubricScores((prev) =>
      prev.map((r) => (r.id === id ? { ...r, score: clamped } : r))
    )
  }

  const handleFeedbackChange = (id: string, text: string) => {
    setRubricScores((prev) =>
      prev.map((r) => (r.id === id ? { ...r, feedback: text } : r))
    )
  }

  const handleAddStrength = (text: string) => {
    if (!text.trim() || strengths.includes(text.trim())) return
    setStrengths((prev) => [...prev, text.trim()])
    setNewStrengthInput("")
  }

  const handleRemoveStrength = (index: number) => {
    setStrengths((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddImprovement = (text: string) => {
    if (!text.trim() || improvements.includes(text.trim())) return
    setImprovements((prev) => [...prev, text.trim()])
    setNewImprovementInput("")
  }

  const handleRemoveImprovement = (index: number) => {
    setImprovements((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitEvaluation = (overrideStatus?: "passed" | "needs_revision") => {
    setErrorMsg(null)

    if (!generalFeedback.trim()) {
      setErrorMsg("Please write general constructive feedback for the student.")
      return
    }

    const finalStatus: "passed" | "needs_revision" =
      overrideStatus || (isPassing ? "passed" : "needs_revision")

    setIsSubmitting(true)
    try {
      const res = evaluateSubmission(submission.id, {
        totalScore,
        maxPossibleScore,
        status: finalStatus,
        generalFeedback: generalFeedback.trim(),
        strengths,
        improvements,
        rubricScores,
      })

      if (!res.success) {
        setErrorMsg(res.message)
        setIsSubmitting(false)
        return
      }

      setIsSubmitting(false)
      onClose()
      onSuccess?.()
    } catch {
      setErrorMsg("Failed to save evaluation.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Validation Notice</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Submission Verification Bar */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Submitted Repositories & Artifacts
          </span>
          <div className="flex items-center gap-3">
            <SafeExternalLink url={submission.liveUrl} label="Open Live App" type="live" />
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
                label="Watch Demo"
                type="video"
              />
            )}
          </div>
        </div>

        {/* Checklist items confirmed by student */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">Self-Check:</span>
          <span className={submission.checklistCompleted.publicRepo ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
            ✓ Public Repo
          </span>
          <span>•</span>
          <span className={submission.checklistCompleted.readmeProvided ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
            ✓ README Included
          </span>
          <span>•</span>
          <span className={submission.checklistCompleted.liveLinkActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
            ✓ Verified Live URL
          </span>
        </div>

        {submission.studentNotes && (
          <div className="text-xs bg-background p-2.5 rounded border border-border">
            <span className="font-semibold text-foreground">Student&apos;s Note: </span>
            <span className="text-muted-foreground italic">
              &ldquo;{submission.studentNotes}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* Live Score Tally Box */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-muted-foreground font-medium uppercase">
              Calculated Evaluation Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold tracking-tight">
                {totalScore}
              </span>
              <span className="text-sm text-muted-foreground">
                / {maxPossibleScore} Marks
              </span>
              <Badge
                variant={isPassing ? "success" : "destructive"}
                className="ml-2"
              >
                {isPassing ? "Passing Grade" : "Needs Revision (< 50m)"}
              </Badge>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-right sm:max-w-xs">
            <span>Passing Benchmark: {passingMarks} / {maxPossibleScore} Marks</span>
            <Progress
              value={totalScore}
              max={maxPossibleScore}
              className="mt-1.5 h-2"
              indicatorColor={isPassing ? "bg-emerald-500" : "bg-destructive"}
            />
          </div>
        </div>
      </div>

      {/* Rubric Criteria Evaluation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Rubric Criteria Evaluation
          </h4>
          <span className="text-xs text-muted-foreground">
            Set scores according to instructor grading criteria
          </span>
        </div>

        <div className="space-y-3">
          {rubricScores.map((criterion) => (
            <div
              key={criterion.id}
              className="rounded-lg border border-border bg-card p-3.5 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {criterion.criteria}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Score:</span>
                  <input
                    type="number"
                    min={0}
                    max={criterion.maxMarks}
                    value={criterion.score}
                    onChange={(e) =>
                      handleScoreChange(
                        criterion.id,
                        Number(e.target.value),
                        criterion.maxMarks
                      )
                    }
                    className="w-16 h-8 text-center text-sm font-bold rounded-md border border-input bg-background focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">
                    / {criterion.maxMarks}
                  </span>
                </div>
              </div>

              <Input
                placeholder="Specific remark for this criterion (optional)..."
                value={criterion.feedback || ""}
                onChange={(e) =>
                  handleFeedbackChange(criterion.id, e.target.value)
                }
                className="text-xs h-8"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Preset Feedback Pills */}
      <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Fast Preset Feedback Snippets (Click to Add)</span>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              Common Strengths:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INSTRUCTOR_FEEDBACK_PRESETS.strengths.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddStrength(s)}
                  className="text-[11px] bg-background border border-border rounded px-2 py-1 text-foreground hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/30 transition-colors text-left"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border/50">
            <span className="text-[11px] font-medium text-muted-foreground block mb-1">
              Common Areas for Improvement:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INSTRUCTOR_FEEDBACK_PRESETS.improvements.map((imp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddImprovement(imp)}
                  className="text-[11px] bg-background border border-border rounded px-2 py-1 text-foreground hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30 transition-colors text-left"
                >
                  + {imp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Improvements Lists */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Strengths */}
        <div className="space-y-2">
          <label className="text-xs font-semibold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Key Strengths Noted ({strengths.length})
          </label>
          <div className="flex gap-1.5">
            <Input
              placeholder="Add custom strength..."
              value={newStrengthInput}
              onChange={(e) => setNewStrengthInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddStrength(newStrengthInput)
                }
              }}
              className="text-xs h-8"
            />
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => handleAddStrength(newStrengthInput)}
              className="h-8 text-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {strengths.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs"
              >
                <span className="text-foreground">{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveStrength(idx)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="space-y-2">
          <label className="text-xs font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Areas for Improvement ({improvements.length})
          </label>
          <div className="flex gap-1.5">
            <Input
              placeholder="Add specific recommendation..."
              value={newImprovementInput}
              onChange={(e) => setNewImprovementInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddImprovement(newImprovementInput)
                }
              }}
              className="text-xs h-8"
            />
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => handleAddImprovement(newImprovementInput)}
              className="h-8 text-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {improvements.map((imp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs"
              >
                <span className="text-foreground">{imp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveImprovement(idx)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* General Constructive Feedback */}
      <div>
        <label className="block text-xs font-semibold mb-1.5">
          General Constructive Feedback & Mentorship Remarks <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="Provide encouraging and constructive feedback outlining the student's execution, architecture choices, and next steps..."
          value={generalFeedback}
          onChange={(e) => setGeneralFeedback(e.target.value)}
          rows={4}
          required
        />
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        {!isPassing && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleSubmitEvaluation("needs_revision")}
            disabled={isSubmitting}
            className="gap-1.5"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Request Revision ({totalScore}/{maxPossibleScore})
          </Button>
        )}

        <Button
          type="button"
          onClick={() => handleSubmitEvaluation(isPassing ? "passed" : "needs_revision")}
          disabled={isSubmitting}
          className={isPassing ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
        >
          {isPassing ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Pass & Approve ({totalScore}/{maxPossibleScore} Marks)
            </>
          ) : (
            "Submit Evaluation"
          )}
        </Button>
      </DialogFooter>
    </div>
  )
}

export function EvaluationModal({
  submission,
  open,
  onOpenChange,
  onSuccess,
}: EvaluationModalProps) {
  const { assignments } = useDashboard()

  const assignment = React.useMemo(() => {
    if (!submission) return null
    return assignments.find((a) => a.id === submission.assignmentId) || null
  }, [submission, assignments])

  if (!submission) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Evaluation Workspace • {submission.milestone}
              </span>
              <DialogTitle className="text-xl mt-1">
                {submission.assignmentTitle}
              </DialogTitle>
              <DialogDescription>
                Student: <strong>{submission.studentName}</strong> ({submission.studentId}) • {submission.studentEmail}
              </DialogDescription>
            </div>
            <StatusBadge status={submission.status} />
          </div>
        </DialogHeader>

        <EvaluationForm
          key={`${submission.id}-${submission.updatedAt}`}
          submission={submission}
          assignment={assignment}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}

