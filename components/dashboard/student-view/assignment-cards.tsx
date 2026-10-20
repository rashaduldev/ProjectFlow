"use client"

import * as React from "react"
import { Calendar, Award, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Assignment, Submission } from "@/types/dashboard"
import { useDashboard } from "@/context/dashboard-context"
import { StatusBadge } from "../shared/status-badge"
import { SubmissionModal } from "./submission-modal"
import { FeedbackDetailDialog } from "../shared/feedback-detail-dialog"

export function AssignmentCards() {
  const { assignments, submissions, currentStudent } = useDashboard()

  const [selectedAssignment, setSelectedAssignment] = React.useState<Assignment | null>(null)
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = React.useState(false)

  // Find student's submission for an assignment
  const getStudentSubmission = (assignmentId: string): Submission | undefined => {
    return submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === currentStudent.id
    )
  }

  const handleOpenSubmit = (assignment: Assignment, existing?: Submission) => {
    setSelectedAssignment(assignment)
    setSelectedSubmission(existing || null)
    setIsSubmitModalOpen(true)
  }

  const handleOpenFeedback = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsFeedbackModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Assigned Projects & Milestones
        </h3>
        <p className="text-xs text-muted-foreground">
          Submit your project repository and live URL for instructor review and rubric-based grading.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => {
          const studentSubmission = getStudentSubmission(assignment.id)
          const deadlineDate = new Date(assignment.deadline)
          const isPassed = studentSubmission?.status === "passed"
          const needsRevision = studentSubmission?.status === "needs_revision"
          const isPending =
            studentSubmission?.status === "pending" ||
            studentSubmission?.status === "in_review"

          return (
            <Card
              key={assignment.id}
              className="flex flex-col justify-between border-border hover:border-primary/40 transition-all hover:shadow-sm"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                    {assignment.milestone}
                  </span>
                  {studentSubmission ? (
                    <StatusBadge status={studentSubmission.status} />
                  ) : (
                    <Badge variant="outline" className="text-[11px]">
                      Not Submitted
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-base font-bold line-clamp-1">
                  {assignment.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {assignment.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 pb-4 space-y-3">
                {/* Score or Status summary banner */}
                {studentSubmission?.evaluation ? (
                  <div className="rounded-lg bg-muted/60 p-3 text-xs flex items-center justify-between border border-border">
                    <span className="text-muted-foreground font-medium">Earned Marks:</span>
                    <span className="font-bold text-sm">
                      {studentSubmission.evaluation.totalScore} /{" "}
                      {studentSubmission.evaluation.maxPossibleScore}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-primary" />
                      Total: {assignment.totalMarks} Marks
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Due {deadlineDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                )}

                {/* Key Rubric criteria pills */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Rubric Criteria:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignment.recommendedRubric.map((r, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded"
                      >
                        {r.criteria} ({r.maxMarks}m)
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 flex gap-2 border-t border-border/40 mt-auto">
                {!studentSubmission && (
                  <Button
                    className="w-full text-xs"
                    onClick={() => handleOpenSubmit(assignment)}
                  >
                    Submit Project
                  </Button>
                )}

                {isPending && (
                  <Button
                    variant="outline"
                    className="w-full text-xs gap-1.5"
                    onClick={() => handleOpenFeedback(studentSubmission)}
                  >
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    View Status Details
                  </Button>
                )}

                {needsRevision && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleOpenFeedback(studentSubmission)}
                    >
                      View Feedback
                    </Button>
                    <Button
                      className="flex-1 text-xs"
                      onClick={() => handleOpenSubmit(assignment, studentSubmission)}
                    >
                      Resubmit
                    </Button>
                  </>
                )}

                {isPassed && (
                  <Button
                    variant="outline"
                    className="w-full text-xs gap-1.5"
                    onClick={() => handleOpenFeedback(studentSubmission)}
                  >
                    <Award className="h-3.5 w-3.5 text-emerald-600" />
                    View Grade Sheet
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Submit / Resubmit Modal */}
      <SubmissionModal
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        assignment={selectedAssignment}
        existingSubmission={selectedSubmission}
      />

      {/* Grade sheet / feedback modal */}
      <FeedbackDetailDialog
        open={isFeedbackModalOpen}
        onOpenChange={setIsFeedbackModalOpen}
        submission={selectedSubmission}
      />
    </div>
  )
}
