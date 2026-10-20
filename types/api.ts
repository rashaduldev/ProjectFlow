export type UserRole = "STUDENT" | "MENTOR"

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Submission {
  id: string
  projectName: string
  githubUrl: string
  liveUrl: string
  description: string
  status: SubmissionStatus
  studentId: string
  studentName: string
  studentEmail: string
  mentorFeedback?: string
  reviewedAt?: string
  reviewedBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateSubmissionPayload {
  projectName: string
  githubUrl: string
  liveUrl: string
  description: string
}

export interface UpdateSubmissionStatusPayload {
  status: "APPROVED" | "REJECTED"
  feedback?: string
}

export interface SubmissionStats {
  totalPending: number
  totalApproved: number
  totalRejected: number
  totalSubmissions: number
}

export interface PaginatedSubmissionsResponse {
  data: Submission[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SubmissionQueryParams {
  page?: number
  limit?: number
  status?: SubmissionStatus | "ALL"
  search?: string
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

