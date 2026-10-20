"use client"

import * as React from "react"
import {
  Assignment,
  Evaluation,
  Submission,
  SubmissionFilter,
  UserRole,
} from "@/types/dashboard"
import {
  ASSIGNMENTS,
  CURRENT_EVALUATOR,
  CURRENT_STUDENT,
} from "@/lib/mock-data"
import {
  getRoleSnapshot,
  getServerRoleSnapshot,
  getServerSubmissionsSnapshot,
  getSubmissionsSnapshot,
  resetStorageData,
  saveSubmissions,
  saveUserRole,
  subscribeStorage,
} from "@/lib/storage"

interface SubmitProjectPayload {
  assignmentId: string
  liveUrl: string
  githubClientUrl: string
  githubServerUrl?: string
  videoDemoUrl?: string
  studentNotes?: string
  checklistCompleted: {
    publicRepo: boolean
    readmeProvided: boolean
    liveLinkActive: boolean
    credentialsInReadme: boolean
  }
}

interface ResubmitProjectPayload {
  submissionId: string
  liveUrl: string
  githubClientUrl: string
  githubServerUrl?: string
  videoDemoUrl?: string
  studentNotes?: string
}

interface DashboardContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  submissions: Submission[]
  assignments: Assignment[]
  currentStudent: typeof CURRENT_STUDENT
  currentEvaluator: typeof CURRENT_EVALUATOR
  filters: SubmissionFilter
  setFilters: React.Dispatch<React.SetStateAction<SubmissionFilter>>
  submitProject: (payload: SubmitProjectPayload) => { success: boolean; message: string }
  resubmitProject: (payload: ResubmitProjectPayload) => { success: boolean; message: string }
  evaluateSubmission: (
    submissionId: string,
    evaluationData: {
      totalScore: number
      maxPossibleScore: number
      status: "passed" | "needs_revision"
      generalFeedback: string
      strengths: string[]
      improvements: string[]
      rubricScores: Evaluation["rubricScores"]
    }
  ) => { success: boolean; message: string }
  startReview: (submissionId: string) => void
  resetToSampleData: () => void
  studentStats: {
    totalSubmitted: number
    passedCount: number
    needsRevisionCount: number
    pendingCount: number
    averageScore: number
  }
  instructorStats: {
    totalSubmissions: number
    pendingReviewCount: number
    inReviewCount: number
    evaluatedCount: number
    passRatePercentage: number
    averageScore: number
  }
}

const DashboardContext = React.createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const role = React.useSyncExternalStore(
    subscribeStorage,
    getRoleSnapshot,
    getServerRoleSnapshot
  )

  const submissions = React.useSyncExternalStore(
    subscribeStorage,
    getSubmissionsSnapshot,
    getServerSubmissionsSnapshot
  )

  const [filters, setFilters] = React.useState<SubmissionFilter>({
    search: "",
    status: "all",
    assignmentId: "all",
    sortBy: "date_desc",
  })

  const setRole = React.useCallback((newRole: UserRole) => {
    saveUserRole(newRole)
  }, [])

  const resetToSampleData = React.useCallback(() => {
    resetStorageData()
  }, [])

  const submitProject = React.useCallback(
    (payload: SubmitProjectPayload) => {
      const assignment = ASSIGNMENTS.find((a) => a.id === payload.assignmentId)
      if (!assignment) {
        return { success: false, message: "Selected assignment not found." }
      }

      // Check if student already has a pending or in_review submission for this assignment
      const existingActive = submissions.find(
        (s) =>
          s.assignmentId === payload.assignmentId &&
          s.studentId === CURRENT_STUDENT.id &&
          (s.status === "pending" || s.status === "in_review")
      )

      if (existingActive) {
        return {
          success: false,
          message:
            "You already have an active submission pending review for this assignment.",
        }
      }

      const now = new Date().toISOString()
      const newSubmission: Submission = {
        id: `sub-${Date.now().toString(36)}`,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        milestone: assignment.milestone,
        studentId: CURRENT_STUDENT.id,
        studentName: CURRENT_STUDENT.name,
        studentEmail: CURRENT_STUDENT.email,
        submittedAt: now,
        updatedAt: now,
        liveUrl: payload.liveUrl,
        githubClientUrl: payload.githubClientUrl,
        githubServerUrl: payload.githubServerUrl || undefined,
        videoDemoUrl: payload.videoDemoUrl || undefined,
        studentNotes: payload.studentNotes || undefined,
        checklistCompleted: payload.checklistCompleted,
        status: "pending",
        revisionCount: 0,
        history: [
          {
            timestamp: now,
            status: "pending",
            note: "New project submission submitted by student.",
            githubClientUrl: payload.githubClientUrl,
            liveUrl: payload.liveUrl,
          },
        ],
      }

      const next = [newSubmission, ...submissions]
      saveSubmissions(next)
      return { success: true, message: "Project submitted successfully!" }
    },
    [submissions]
  )

  const resubmitProject = React.useCallback(
    (payload: ResubmitProjectPayload) => {
      const target = submissions.find((s) => s.id === payload.submissionId)
      if (!target) {
        return { success: false, message: "Submission not found." }
      }

      const now = new Date().toISOString()
      const updatedHistory = [
        ...target.history,
        {
          timestamp: now,
          status: "pending" as const,
          note: `Resubmitted (Revision #${target.revisionCount + 1}). Note: ${payload.studentNotes || "Updated deployment and code."}`,
          githubClientUrl: payload.githubClientUrl,
          liveUrl: payload.liveUrl,
        },
      ]

      const updated: Submission = {
        ...target,
        liveUrl: payload.liveUrl,
        githubClientUrl: payload.githubClientUrl,
        githubServerUrl: payload.githubServerUrl || target.githubServerUrl,
        videoDemoUrl: payload.videoDemoUrl || target.videoDemoUrl,
        studentNotes: payload.studentNotes || target.studentNotes,
        status: "pending",
        revisionCount: target.revisionCount + 1,
        updatedAt: now,
        history: updatedHistory,
      }

      const next = submissions.map((s) => (s.id === target.id ? updated : s))
      saveSubmissions(next)
      return { success: true, message: "Project revised and resubmitted successfully!" }
    },
    [submissions]
  )

  const startReview = React.useCallback(
    (submissionId: string) => {
      const target = submissions.find((s) => s.id === submissionId)
      if (!target || target.status !== "pending") return

      const now = new Date().toISOString()
      const updated: Submission = {
        ...target,
        status: "in_review",
        updatedAt: now,
        history: [
          ...target.history,
          {
            timestamp: now,
            status: "in_review",
            note: `Review initiated by ${CURRENT_EVALUATOR.name}.`,
            githubClientUrl: target.githubClientUrl,
            liveUrl: target.liveUrl,
          },
        ],
      }

      const next = submissions.map((s) => (s.id === target.id ? updated : s))
      saveSubmissions(next)
    },
    [submissions]
  )

  const evaluateSubmission = React.useCallback(
    (
      submissionId: string,
      evaluationData: {
        totalScore: number
        maxPossibleScore: number
        status: "passed" | "needs_revision"
        generalFeedback: string
        strengths: string[]
        improvements: string[]
        rubricScores: Evaluation["rubricScores"]
      }
    ) => {
      const target = submissions.find((s) => s.id === submissionId)
      if (!target) {
        return { success: false, message: "Submission not found." }
      }

      const now = new Date().toISOString()
      const fullEvaluation: Evaluation = {
        evaluatorId: CURRENT_EVALUATOR.id,
        evaluatorName: CURRENT_EVALUATOR.name,
        evaluatedAt: now,
        totalScore: evaluationData.totalScore,
        maxPossibleScore: evaluationData.maxPossibleScore,
        status: evaluationData.status,
        generalFeedback: evaluationData.generalFeedback,
        strengths: evaluationData.strengths,
        improvements: evaluationData.improvements,
        rubricScores: evaluationData.rubricScores,
      }

      const updated: Submission = {
        ...target,
        status: evaluationData.status,
        updatedAt: now,
        evaluation: fullEvaluation,
        history: [
          ...target.history,
          {
            timestamp: now,
            status: evaluationData.status,
            note: `Graded by ${CURRENT_EVALUATOR.name}. Result: ${evaluationData.status.toUpperCase()} (${evaluationData.totalScore}/${evaluationData.maxPossibleScore} marks).`,
            githubClientUrl: target.githubClientUrl,
            liveUrl: target.liveUrl,
          },
        ],
      }

      const next = submissions.map((s) => (s.id === target.id ? updated : s))
      saveSubmissions(next)
      return { success: true, message: `Evaluation saved (${evaluationData.status})!` }
    },
    [submissions]
  )

  // Compute student stats
  const studentSubmissions = React.useMemo(() => {
    return submissions.filter((s) => s.studentId === CURRENT_STUDENT.id)
  }, [submissions])

  const studentStats = React.useMemo(() => {
    const passed = studentSubmissions.filter((s) => s.status === "passed")
    const needsRevision = studentSubmissions.filter((s) => s.status === "needs_revision")
    const pending = studentSubmissions.filter((s) => s.status === "pending" || s.status === "in_review")

    const evaluatedScores = studentSubmissions
      .filter((s) => s.evaluation)
      .map((s) => s.evaluation!.totalScore)

    const avgScore =
      evaluatedScores.length > 0
        ? Math.round(evaluatedScores.reduce((a, b) => a + b, 0) / evaluatedScores.length)
        : 0

    return {
      totalSubmitted: studentSubmissions.length,
      passedCount: passed.length,
      needsRevisionCount: needsRevision.length,
      pendingCount: pending.length,
      averageScore: avgScore,
    }
  }, [studentSubmissions])

  // Compute instructor stats
  const instructorStats = React.useMemo(() => {
    const total = submissions.length
    const pending = submissions.filter((s) => s.status === "pending").length
    const inReview = submissions.filter((s) => s.status === "in_review").length
    const evaluated = submissions.filter((s) => s.status === "passed" || s.status === "needs_revision")
    const passed = submissions.filter((s) => s.status === "passed").length

    const passRate =
      evaluated.length > 0 ? Math.round((passed / evaluated.length) * 100) : 0

    const totalScores = evaluated
      .filter((s) => s.evaluation)
      .map((s) => s.evaluation!.totalScore)

    const avgScore =
      totalScores.length > 0
        ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length)
        : 0

    return {
      totalSubmissions: total,
      pendingReviewCount: pending,
      inReviewCount: inReview,
      evaluatedCount: evaluated.length,
      passRatePercentage: passRate,
      averageScore: avgScore,
    }
  }, [submissions])

  return (
    <DashboardContext.Provider
      value={{
        role,
        setRole,
        submissions,
        assignments: ASSIGNMENTS,
        currentStudent: CURRENT_STUDENT,
        currentEvaluator: CURRENT_EVALUATOR,
        filters,
        setFilters,
        submitProject,
        resubmitProject,
        evaluateSubmission,
        startReview,
        resetToSampleData,
        studentStats,
        instructorStats,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = React.useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}

