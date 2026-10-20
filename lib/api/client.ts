import {
  AuthResponse,
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const TOKEN_STORAGE_KEY = "ph_dashboard_jwt_token"
const MODE_STORAGE_KEY = "ph_dashboard_api_mode"

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export function getStoredApiMode(): ApiMode {
  if (typeof window === "undefined") return "mock"
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
  const token = getStoredToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${endpoint}`

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Supports secure HttpOnly session cookies from Express
    })
  } catch {
    throw new ApiConnectionError(
      API_BASE_URL,
      `Backend unreachable at ${url}. Please verify your Express.js server is running on ${API_BASE_URL}.`
    )
  }

  if (!response.ok) {
    let errorData: Record<string, unknown> = {}
    try {
      errorData = (await response.json()) as Record<string, unknown>
    } catch {
      errorData = { message: response.statusText || `Request failed with status ${response.status}` }
    }

    const message =
      typeof errorData.message === "string"
        ? errorData.message
        : `API Error ${response.status}: ${response.statusText}`
    const errors = (errorData.errors && typeof errorData.errors === "object"
      ? errorData.errors
      : undefined) as Record<string, string[]> | undefined

    throw new ApiHttpError(response.status, message, errors)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

export const api = {
  auth: {
    async signup(data: {
      name: string
      email: string
      password: string
    }): Promise<AuthResponse> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        return mockApiService.register({ ...data, role: "STUDENT" })
      }
      return request<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ ...data, role: "STUDENT" }),
      })
    },

    async register(data: {
      name: string
      email: string
      password: string
      role: "STUDENT" | "MENTOR"
    }): Promise<AuthResponse> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        return mockApiService.register(data)
      }
      return request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    async login(data: {
      email: string
      password: string
    }): Promise<AuthResponse> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        return mockApiService.login(data.email, data.password)
      }
      return request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    async me(): Promise<{ user: User }> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        const storedUser = window.localStorage.getItem("ph_dashboard_user_profile")
        if (storedUser) {
          return { user: JSON.parse(storedUser) }
        }
        return {
          user: {
            id: "usr_student_1",
            name: "Tanvir Ahmed",
            email: "student@example.com",
            role: "STUDENT",
          },
        }
      }
      return request<{ user: User }>("/auth/me")
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
      // Supports both /submissions/my and /submissions/my-submissions
      try {
        return await request<Submission[]>("/submissions/my")
      } catch (err: unknown) {
        if (err instanceof ApiHttpError && err.statusCode === 404) {
          return request<Submission[]>("/submissions/my-submissions")
        }
        throw err
      }
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

      try {
        return await request<PaginatedSubmissionsResponse>(`/mentor/submissions${qs}`)
      } catch (err: unknown) {
        if (err instanceof ApiHttpError && err.statusCode === 404) {
          return request<PaginatedSubmissionsResponse>(`/submissions${qs}`)
        }
        throw err
      }
    },

    async getStats(): Promise<SubmissionStats> {
      const mode = getStoredApiMode()
      if (mode === "mock") {
        return mockApiService.getStats()
      }
      try {
        return await request<SubmissionStats>("/mentor/stats")
      } catch (err: unknown) {
        if (err instanceof ApiHttpError && err.statusCode === 404) {
          return request<SubmissionStats>("/submissions/stats")
        }
        throw err
      }
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
      try {
        return await request<Submission>(`/mentor/submissions/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      } catch (err: unknown) {
        if (err instanceof ApiHttpError && err.statusCode === 404) {
          return request<Submission>(`/submissions/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        }
        throw err
      }
    },
  },

  // Aliases for compatibility
  get mentorSubmissions() {
    return {
      getAll: api.submissions.getAll,
      updateStatus: api.submissions.updateStatus,
    }
  },

  get studentSubmissions() {
    return {
      create: api.submissions.create,
      getMySubmissions: api.submissions.getMySubmissions,
    }
  },

  get dashboardStats() {
    return {
      getMentor: api.submissions.getStats,
    }
  },

  resetMockData() {
    mockApiService.resetDemoData()
  },
}
