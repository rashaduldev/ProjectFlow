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

const SEED_USERS: User[] = [
  {
    id: "usr_student_1",
    name: "Tanvir Ahmed",
    email: "student@example.com",
    role: "STUDENT",
    createdAt: "2026-10-15T10:00:00Z",
  },
  {
    id: "usr_mentor_1",
    name: "Nayeem Chowdhury",
    email: "mentor@example.com",
    role: "MENTOR",
    createdAt: "2026-10-10T10:00:00Z",
  },
]

const SEED_SUBMISSIONS: Submission[] = [
  {
    id: "sub_1",
    projectName: "CareerHub - Job Application & Career Portal",
    githubUrl: "https://github.com/tanvir-ahmed-dev/careerhub-client",
    liveUrl: "https://careerhub-portal-demo.vercel.app",
    description: "Fullstack job application tracker built with Next.js, role-based dashboards, and filterable job listings.",
    status: "APPROVED",
    studentId: "usr_student_1",
    studentName: "Tanvir Ahmed",
    studentEmail: "student@example.com",
    mentorFeedback: "Excellent component decomposition and clean URL routing. Commits are atomic and well-documented.",
    reviewedAt: "2026-10-18T14:30:00Z",
    reviewedBy: "Nayeem Chowdhury",
    createdAt: "2026-10-17T11:20:00Z",
    updatedAt: "2026-10-18T14:30:00Z",
  },
  {
    id: "sub_2",
    projectName: "BookNest - Library Management System",
    githubUrl: "https://github.com/tanvir-ahmed-dev/booknest-library",
    liveUrl: "https://booknest-tanvir.surge.sh",
    description: "MERN Stack library portal with JWT authentication, inventory borrowing, and reader reviews.",
    status: "REJECTED",
    studentId: "usr_student_1",
    studentName: "Tanvir Ahmed",
    studentEmail: "student@example.com",
    mentorFeedback: "Page refresh on dynamic routes throws 404 because SPA routing redirects are missing. Also README lacks test login credentials.",
    reviewedAt: "2026-10-19T09:15:00Z",
    reviewedBy: "Nayeem Chowdhury",
    createdAt: "2026-10-18T16:00:00Z",
    updatedAt: "2026-10-19T09:15:00Z",
  },
  {
    id: "sub_3",
    projectName: "GadgetVibe - E-commerce Store",
    githubUrl: "https://github.com/tanvir-ahmed-dev/gadgetvibe-store",
    liveUrl: "https://gadgetvibe-demo.web.app",
    description: "Modern electronics shop with persistent cart, price filtering, and simulated checkout flow.",
    status: "PENDING",
    studentId: "usr_student_1",
    studentName: "Tanvir Ahmed",
    studentEmail: "student@example.com",
    createdAt: "2026-10-20T10:45:00Z",
    updatedAt: "2026-10-20T10:45:00Z",
  },
  {
    id: "sub_4",
    projectName: "DevPulse - Developer Social Network",
    githubUrl: "https://github.com/farhan-dev/devpulse",
    liveUrl: "https://devpulse.vercel.app",
    description: "Social networking platform for engineers with code snippet sharing and markdown blogging.",
    status: "PENDING",
    studentId: "usr_student_2",
    studentName: "Farhan Kabir",
    studentEmail: "farhan@example.com",
    createdAt: "2026-10-20T11:30:00Z",
    updatedAt: "2026-10-20T11:30:00Z",
  },
  {
    id: "sub_5",
    projectName: "TaskFlow - Kanban Project Tracker",
    githubUrl: "https://github.com/sumaiya-dev/taskflow",
    liveUrl: "https://taskflow.netlify.app",
    description: "Real-time task board with drag-and-drop, priority tags, and team invitation links.",
    status: "APPROVED",
    studentId: "usr_student_3",
    studentName: "Sumaiya Rahman",
    studentEmail: "sumaiya@example.com",
    mentorFeedback: "Great work on smooth drag-and-drop and optimistic UI updates.",
    reviewedAt: "2026-10-19T17:00:00Z",
    reviewedBy: "Nayeem Chowdhury",
    createdAt: "2026-10-18T13:00:00Z",
    updatedAt: "2026-10-19T17:00:00Z",
  },
  {
    id: "sub_6",
    projectName: "FoodieBite - Restaurant Delivery Hub",
    githubUrl: "https://github.com/arif-dev/foodiebite",
    liveUrl: "https://foodiebite.surge.sh",
    description: "Multi-restaurant ordering platform with checkout cart, address selector, and simulated tracking.",
    status: "REJECTED",
    studentId: "usr_student_4",
    studentName: "Ariful Islam",
    studentEmail: "arif@example.com",
    mentorFeedback: "Client deployment is throwing CORS errors against public backend. Fix CORS origins in server.",
    reviewedAt: "2026-10-19T11:20:00Z",
    reviewedBy: "Nayeem Chowdhury",
    createdAt: "2026-10-18T08:15:00Z",
    updatedAt: "2026-10-19T11:20:00Z",
  },
  {
    id: "sub_7",
    projectName: "PixelCraft - Collaborative Canvas",
    githubUrl: "https://github.com/mehedi-dev/pixelcraft",
    liveUrl: "https://pixelcraft.web.app",
    description: "Collaborative whiteboard canvas with shape tools, undo/redo, and PNG export.",
    status: "PENDING",
    studentId: "usr_student_5",
    studentName: "Mehedi Hasan",
    studentEmail: "mehedi@example.com",
    createdAt: "2026-10-20T13:40:00Z",
    updatedAt: "2026-10-20T13:40:00Z",
  },
]

const mockPasswords = new Map([
  ["student@example.com", "Password123!"],
  ["mentor@example.com", "Password123!"],
])

const MOCK_STORAGE_KEY = "ph_dashboard_mock_submissions_v2"
const MOCK_USERS_KEY = "ph_dashboard_mock_users_v2"

function getStoredSubmissions(): Submission[] {
  if (typeof window === "undefined") return SEED_SUBMISSIONS
  try {
    const raw = window.localStorage.getItem(MOCK_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(SEED_SUBMISSIONS))
      return SEED_SUBMISSIONS
    }
    return JSON.parse(raw)
  } catch {
    return SEED_SUBMISSIONS
  }
}

function saveStoredSubmissions(subs: Submission[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(subs))
  } catch (err) {
    console.error("Mock save failed:", err)
  }
}

function getStoredUsers(): User[] {
  if (typeof window === "undefined") return SEED_USERS
  try {
    const raw = window.localStorage.getItem(MOCK_USERS_KEY)
    if (!raw) {
      window.localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(SEED_USERS))
      return SEED_USERS
    }
    return JSON.parse(raw)
  } catch {
    return SEED_USERS
  }
}

function saveStoredUsers(users: User[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
  } catch (err) {
    console.error("Mock users save failed:", err)
  }
}

/**
 * Transparent Mock Service that mirrors the Express.js API contract exactly.
 */
export const mockApiService = {
  async register(data: { name: string; email: string; password: string; role: "STUDENT" | "MENTOR" }): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400))
    const users = getStoredUsers()
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())
    if (existing) {
      throw new Error("A user with this email address already exists (409 Conflict).")
    }

    const newUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: data.role,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    saveStoredUsers(users)
    mockPasswords.set(newUser.email, data.password)

    return {
      user: newUser,
      token: `mock_jwt_token_${newUser.id}_${Date.now()}`,
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 350))
    const users = getStoredUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
    if (!user || mockPasswords.get(user.email.toLowerCase()) !== password) {
      throw new Error("Invalid email or password (401 Unauthorized).")
    }

    return {
      user,
      token: `mock_jwt_token_${user.id}_${Date.now()}`,
    }
  },

  async createSubmission(payload: CreateSubmissionPayload, currentUser: User): Promise<Submission> {
    await new Promise((r) => setTimeout(r, 450))
    const subs = getStoredSubmissions()

    // Enforce duplicate prevention contract
    const isDuplicate = subs.some(
      (s) =>
        s.studentId === currentUser.id &&
        s.status === "PENDING" &&
        (s.projectName.toLowerCase().trim() === payload.projectName.toLowerCase().trim() ||
          s.githubUrl.toLowerCase().trim() === payload.githubUrl.toLowerCase().trim())
    )

    if (isDuplicate) {
      throw new Error(
        "Duplicate Submission: You already have a pending submission with this project name or repository URL (409 Conflict)."
      )
    }

    const now = new Date().toISOString()
    const newSub: Submission = {
      id: `sub_${Date.now().toString(36)}`,
      projectName: payload.projectName.trim(),
      githubUrl: payload.githubUrl.trim(),
      liveUrl: payload.liveUrl.trim(),
      description: payload.description.trim(),
      status: "PENDING",
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      createdAt: now,
      updatedAt: now,
    }

    const updated = [newSub, ...subs]
    saveStoredSubmissions(updated)
    return newSub
  },

  async getMySubmissions(studentId: string): Promise<Submission[]> {
    await new Promise((r) => setTimeout(r, 250))
    const subs = getStoredSubmissions()
    return subs.filter((s) => s.studentId === studentId)
  },

  async getSubmissionsPaginated(params: SubmissionQueryParams): Promise<PaginatedSubmissionsResponse> {
    await new Promise((r) => setTimeout(r, 300))
    let subs = getStoredSubmissions()

    // Server-side filtering
    if (params.status && params.status !== "ALL") {
      subs = subs.filter((s) => s.status === params.status)
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim()
      subs = subs.filter(
        (s) =>
          s.projectName.toLowerCase().includes(q) ||
          s.studentName.toLowerCase().includes(q) ||
          s.studentEmail.toLowerCase().includes(q)
      )
    }

    // Sort newest first
    subs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = subs.length
    const page = params.page || 1
    const limit = params.limit || 5
    const totalPages = Math.ceil(total / limit) || 1

    const start = (page - 1) * limit
    const paginated = subs.slice(start, start + limit)

    return {
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    }
  },

  async getStats(): Promise<SubmissionStats> {
    await new Promise((r) => setTimeout(r, 200))
    const subs = getStoredSubmissions()
    return {
      totalPending: subs.filter((s) => s.status === "PENDING").length,
      totalApproved: subs.filter((s) => s.status === "APPROVED").length,
      totalRejected: subs.filter((s) => s.status === "REJECTED").length,
      totalSubmissions: subs.length,
    }
  },

  async updateStatus(
    id: string,
    payload: UpdateSubmissionStatusPayload,
    mentorName: string
  ): Promise<Submission> {
    await new Promise((r) => setTimeout(r, 350))
    const subs = getStoredSubmissions()
    const targetIndex = subs.findIndex((s) => s.id === id)
    if (targetIndex === -1) {
      throw new Error("Submission not found (404 Not Found).")
    }

    const now = new Date().toISOString()
    const updated: Submission = {
      ...subs[targetIndex],
      status: payload.status,
      mentorFeedback: payload.feedback || undefined,
      reviewedAt: now,
      reviewedBy: mentorName,
      updatedAt: now,
    }

    subs[targetIndex] = updated
    saveStoredSubmissions([...subs])
    return updated
  },

  resetDemoData(): void {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(SEED_SUBMISSIONS))
      window.localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(SEED_USERS))
    }
  },
}

