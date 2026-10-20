export type UserRole = "student" | "instructor"

export type SubmissionStatus =
  | "pending" // Submitted, awaiting instructor
  | "in_review" // Currently being evaluated
  | "needs_revision" // Returned with requested changes
  | "passed" // Approved with score

export interface Assignment {
  id: string
  title: string
  milestone: string
  track: string
  totalMarks: number
  passingMarks: number
  deadline: string
  description: string
  requirements: string[]
  recommendedRubric: {
    criteria: string
    maxMarks: number
    description: string
  }[]
}

export interface RubricScore {
  id: string
  criteria: string
  maxMarks: number
  score: number
  feedback?: string
}

export interface Evaluation {
  evaluatorId: string
  evaluatorName: string
  evaluatedAt: string
  totalScore: number
  maxPossibleScore: number
  status: "passed" | "needs_revision"
  generalFeedback: string
  strengths: string[]
  improvements: string[]
  rubricScores: RubricScore[]
}

export interface SubmissionHistoryItem {
  timestamp: string
  status: SubmissionStatus
  note: string
  githubClientUrl: string
  liveUrl: string
}

export interface Submission {
  id: string
  assignmentId: string
  assignmentTitle: string
  milestone: string
  studentId: string
  studentName: string
  studentEmail: string
  studentAvatar?: string
  submittedAt: string
  updatedAt: string
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
  status: SubmissionStatus
  evaluation?: Evaluation
  revisionCount: number
  history: SubmissionHistoryItem[]
}

export interface SubmissionFilter {
  search: string
  status: "all" | SubmissionStatus
  assignmentId: string
  sortBy: "date_desc" | "date_asc" | "score_desc" | "score_asc"
}

