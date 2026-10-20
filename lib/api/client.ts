import {
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
    super(
      message ||
        `Backend API connection failed at ${url}. Please verify that the Express.js server is running and accessible.`
    )
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

export type ApiMode = "live" | "mock"

const MODE_STORAGE_KEY = "ph_dashboard_api_mode"

type AuthSessionResponse = { user: User }

export function getStoredApiMode(): ApiMode {
  if (typeof window === "undefined") return "mock" // Default to mock for seamless hiring evaluator review unless configured
  const mode = window.localStorage.getItem(MODE_STORAGE_KEY)
  return mode === "live" ? "live" : "mock"
}

export function setStoredApiMode(mode: ApiMode) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(MODE_STORAGE_KEY, mode)
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  const url = endpoint.startsWith("/api/auth/") ? endpoint : `/api/backend${endpoint}`

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "same-origin",
    })
  } catch (err) {
    // Real network failure (CORS, ECONNREFUSED, Server down)
    console.warn("Live API request failed:", err)
    throw new ApiConnectionError(
      url,
      `Unable to reach the authentication service at ${url}. Check the Next.js server and configured Express API.`
    )
  }

  if (!response.ok) {
    let errorData: Record<string, unknown> = {}
    try {
      errorData = (await response.json()) as Record<string, unknown>
    } catch {
      errorData = { message: response.statusText || `Request failed with status ${response.status}` }
    }

    const message = typeof errorData.message === "string" ? errorData.message : `API error: ${response.status} ${response.statusText}`
    const errors = (errorData.errors && typeof errorData.errors === "object" ? errorData.errors : undefined) as Record<string, string[]> | undefined

    throw new ApiHttpError(
      response.status,
      message,
      errors
    )
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

/**
 * Unified API Client with honest separation between Live Express Backend and Transparent Mock Simulation.
 */
export const api = {
  auth: {
    async register(data: { name: string; email: string; password: string }): Promise<AuthSessionResponse> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        const response = await mockApiService.register({ ...data, role: "STUDENT" })
        return { user: response.user }
      }
      return request<AuthSessionResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    async login(data: {
      email: string
      password: string
    }): Promise<AuthSessionResponse> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        const response = await mockApiService.login(data.email, data.password)
        return { user: response.user }
      }
      return request<AuthSessionResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    async me(): Promise<{ user: User | null }> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        return { user: null }
      }
      return request<{ user: User | null }>("/api/auth/me")
    },

    async logout(): Promise<void> {
      if (getStoredApiMode() === "mock") return
      await request<{ success: boolean }>("/api/auth/logout", { method: "POST" })
    },
  },

  submissions: {
    async create(
      payload: CreateSubmissionPayload,
      currentUser?: User
    ): Promise<Submission> {
      const mode = getStoredApiMode()
      if (mode === "mock" && currentUser) {
        return mockApiService.createSubmission(payload, currentUser)
      }
      return request<Submission>("/submissions", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    },

    async getMySubmissions(studentId?: string): Promise<Submission[]> {
      const mode = getStoredApiMode()
      if (mode === "mock" && studentId) {
        return mockApiService.getMySubmissions(studentId)
      }
      return request<Submission[]>("/submissions/my-submissions")
    },

    async getAll(
      params: SubmissionQueryParams = {}
    ): Promise<PaginatedSubmissionsResponse> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        return mockApiService.getSubmissionsPaginated(params)
      }

      const query = new URLSearchParams()
      if (params.page) query.set("page", String(params.page))
      if (params.limit) query.set("limit", String(params.limit))
      if (params.status && params.status !== "ALL") query.set("status", params.status)
      if (params.search) query.set("search", params.search)

      const qs = query.toString() ? `?${query.toString()}` : ""
      return request<PaginatedSubmissionsResponse>(`/submissions${qs}`)
    },

    async getStats(): Promise<SubmissionStats> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        return mockApiService.getStats()
      }
      return request<SubmissionStats>("/submissions/stats")
    },

    async updateStatus(
      id: string,
      payload: UpdateSubmissionStatusPayload,
      mentorName: string = "Mentor"
    ): Promise<Submission> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        return mockApiService.updateStatus(id, payload, mentorName)
      }
      return request<Submission>(`/submissions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
    },
  },

  resetMockData() {
    mockApiService.resetDemoData()
  },
}
