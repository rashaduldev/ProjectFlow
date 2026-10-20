import type {
  CreateSubmissionPayload,
  PaginatedSubmissionsResponse,
  Submission,
  SubmissionQueryParams,
  SubmissionStats,
  UpdateSubmissionStatusPayload,
  User,
} from "@/types/api"
import { mockApiService } from "./mock-service"

export class ApiConnectionError extends Error {
  constructor(public url: string, message?: string) {
    super(message || `Backend API connection failed at ${url}. Verify that the Next.js and Express servers are running.`)
    this.name = "ApiConnectionError"
  }
}

export class ApiHttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "ApiHttpError"
  }
}

export class ApiResponseError extends Error {
  constructor(message = "The API returned a response in an unexpected format.") {
    super(message)
    this.name = "ApiResponseError"
  }
}

export type ApiMode = "live" | "mock"
const MODE_STORAGE_KEY = "ph_dashboard_api_mode"
type AuthSessionResponse = { user: User }

export function getStoredApiMode(): ApiMode {
  if (typeof window === "undefined") return "mock"
  return window.localStorage.getItem(MODE_STORAGE_KEY) === "live" ? "live" : "mock"
}

export function setStoredApiMode(mode: ApiMode) {
  if (typeof window !== "undefined") window.localStorage.setItem(MODE_STORAGE_KEY, mode)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseUser(value: unknown): User {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string" ||
      typeof value.email !== "string" || (value.role !== "STUDENT" && value.role !== "MENTOR")) {
    throw new ApiResponseError("The API returned an invalid user response.")
  }
  return value as unknown as User
}

function parseAuthSession(value: unknown): AuthSessionResponse {
  if (!isRecord(value) || !("user" in value)) throw new ApiResponseError("The API returned an invalid authentication response.")
  return { user: parseUser(value.user) }
}

function parseNullableString(value: unknown): boolean {
  return value === undefined || value === null || typeof value === "string"
}

function parseSubmission(value: unknown): Submission {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.projectName !== "string" ||
      typeof value.githubUrl !== "string" || typeof value.liveUrl !== "string" ||
      typeof value.description !== "string" || !["PENDING", "APPROVED", "REJECTED"].includes(String(value.status)) ||
      typeof value.createdAt !== "string" || typeof value.updatedAt !== "string" ||
      !parseNullableString(value.mentorFeedback) || !parseNullableString(value.reviewedAt) || !parseNullableString(value.reviewedBy)) {
    throw new ApiResponseError("The API returned an invalid submission response.")
  }
  return value as unknown as Submission
}

function parseSubmissionList(value: unknown): Submission[] {
  if (!Array.isArray(value)) throw new ApiResponseError("The API returned an invalid submissions list.")
  return value.map(parseSubmission)
}

function parseStats(value: unknown): SubmissionStats {
  const keys = ["totalPending", "totalApproved", "totalRejected", "totalSubmissions"] as const
  if (!isRecord(value) || keys.some((key) => typeof value[key] !== "number" || !Number.isFinite(value[key]))) {
    throw new ApiResponseError("The API returned invalid dashboard statistics.")
  }
  return value as unknown as SubmissionStats
}

function parsePaginatedSubmissions(value: unknown): PaginatedSubmissionsResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.pagination)) {
    throw new ApiResponseError("The API returned an invalid paginated submissions response.")
  }
  const { total, page, limit, totalPages } = value.pagination
  if ([total, page, limit, totalPages].some((item) => typeof item !== "number" || !Number.isFinite(item))) {
    throw new ApiResponseError("The API returned invalid pagination details.")
  }
  return {
    data: value.data.map(parseSubmission),
    pagination: {
      total: total as number,
      page: page as number,
      limit: limit as number,
      totalPages: totalPages as number,
    },
  }
}

function defaultHttpMessage(status: number, statusText: string): string {
  const known: Record<number, string> = {
    400: "The request was invalid. Check the submitted information.",
    401: "Your session has expired. Please sign in again.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This request conflicts with existing data.",
    429: "Too many requests. Please wait and try again.",
  }
  if (known[status]) return known[status]
  if (status >= 500) return "The server could not complete the request. Please try again later."
  return statusText || `Request failed with status ${status}.`
}

async function request<T>(endpoint: string, options: RequestInit = {}, parse: (value: unknown) => T): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  const url = endpoint.startsWith("/api/auth/") ? endpoint : `/api/backend${endpoint}`
  let response: Response
  try {
    response = await fetch(url, { ...options, headers, credentials: "same-origin" })
  } catch {
    throw new ApiConnectionError(url, `Unable to reach the API through ${url}. Check the Next.js server and configured Express API.`)
  }

  const raw = response.status === 204 ? "" : await response.text()
  let payload: unknown
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown
    } catch {
      if (response.ok) throw new ApiResponseError("The API returned malformed JSON.")
    }
  }
  if (!response.ok) {
    const error = isRecord(payload) ? payload : {}
    const message = typeof error.message === "string" ? error.message : defaultHttpMessage(response.status, response.statusText)
    const errors = isRecord(error.errors) ? error.errors as Record<string, string[]> : undefined
    throw new ApiHttpError(response.status, message, errors)
  }
  if (response.status === 204) return parse(undefined)
  if (payload === undefined) throw new ApiResponseError("The API returned an empty response.")
  return parse(payload)
}

function authSession(value: unknown): AuthSessionResponse { return parseAuthSession(value) }
function optionalUser(value: unknown): { user: User | null } {
  if (!isRecord(value) || !("user" in value)) throw new ApiResponseError("The API returned an invalid session response.")
  return { user: value.user === null ? null : parseUser(value.user) }
}

/** Centralized client for the project's documented Express contract and local demo simulator. */
export const api = {
  auth: {
    async register(data: { name: string; email: string; password: string }): Promise<AuthSessionResponse> {
      if (getStoredApiMode() === "mock") return { user: (await mockApiService.register({ ...data, role: "STUDENT" })).user }
      return request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }, authSession)
    },
    async login(data: { email: string; password: string }): Promise<AuthSessionResponse> {
      if (getStoredApiMode() === "mock") return { user: (await mockApiService.login(data.email, data.password)).user }
      return request("/api/auth/login", { method: "POST", body: JSON.stringify(data) }, authSession)
    },
    async me(): Promise<{ user: User | null }> {
      if (getStoredApiMode() === "mock") return { user: null }
      return request("/api/auth/me", {}, optionalUser)
    },
    async logout(): Promise<void> {
      if (getStoredApiMode() === "live") await request("/api/auth/logout", { method: "POST" }, () => undefined)
    },
  },
  studentSubmissions: {
    async create(payload: CreateSubmissionPayload, currentUser?: User): Promise<Submission> {
      if (getStoredApiMode() === "mock" && currentUser) return mockApiService.createSubmission(payload, currentUser)
      return request("/submissions", { method: "POST", body: JSON.stringify(payload) }, parseSubmission)
    },
    async getMine(studentId?: string): Promise<Submission[]> {
      if (getStoredApiMode() === "mock" && studentId) return mockApiService.getMySubmissions(studentId)
      return request("/submissions/my-submissions", {}, parseSubmissionList)
    },
  },
  mentorSubmissions: {
    async getAll(params: SubmissionQueryParams = {}): Promise<PaginatedSubmissionsResponse> {
      if (getStoredApiMode() === "mock") return mockApiService.getSubmissionsPaginated(params)
      const query = new URLSearchParams()
      if (params.page) query.set("page", String(params.page))
      if (params.limit) query.set("limit", String(params.limit))
      if (params.status && params.status !== "ALL") query.set("status", params.status)
      if (params.search) query.set("search", params.search)
      const qs = query.size ? `?${query.toString()}` : ""
      return request(`/submissions${qs}`, {}, parsePaginatedSubmissions)
    },
    async updateStatus(id: string, payload: UpdateSubmissionStatusPayload, mentorName = "Mentor"): Promise<Submission> {
      if (getStoredApiMode() === "mock") return mockApiService.updateStatus(id, payload, mentorName)
      return request(`/submissions/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify(payload) }, parseSubmission)
    },
  },
  dashboardStats: {
    async getMentor(): Promise<SubmissionStats> {
      if (getStoredApiMode() === "mock") return mockApiService.getStats()
      return request("/submissions/stats", {}, parseStats)
    },
  },
  resetMockData() { mockApiService.resetDemoData() },
}
