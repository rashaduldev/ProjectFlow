import { Submission, UserRole } from "@/types/dashboard"
import { INITIAL_SUBMISSIONS } from "./mock-data"

const STORAGE_KEYS = {
  SUBMISSIONS: "ph_dashboard_submissions_v1",
  USER_ROLE: "ph_dashboard_user_role_v1",
}

let cachedSubmissions: Submission[] = INITIAL_SUBMISSIONS
let cachedRole: UserRole = "student"
let isInitialized = false

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function initClientStorage() {
  if (typeof window === "undefined" || isInitialized) return
  isInitialized = true

  try {
    const rawSubs = window.localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)
    if (rawSubs) {
      cachedSubmissions = JSON.parse(rawSubs)
    } else {
      window.localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS))
      cachedSubmissions = INITIAL_SUBMISSIONS
    }

    const rawRole = window.localStorage.getItem(STORAGE_KEYS.USER_ROLE)
    if (rawRole === "student" || rawRole === "instructor") {
      cachedRole = rawRole
    }
  } catch (err) {
    console.error("Storage init failed:", err)
  }
}

export function subscribeStorage(callback: () => void) {
  initClientStorage()
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export function getSubmissionsSnapshot(): Submission[] {
  initClientStorage()
  return cachedSubmissions
}

export function getServerSubmissionsSnapshot(): Submission[] {
  return INITIAL_SUBMISSIONS
}

export function getRoleSnapshot(): UserRole {
  initClientStorage()
  return cachedRole
}

export function getServerRoleSnapshot(): UserRole {
  return "student"
}

export function saveSubmissions(submissions: Submission[]): void {
  cachedSubmissions = submissions
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions))
    } catch (err) {
      console.error("Failed to save submissions:", err)
    }
  }
  emitChange()
}

export function saveUserRole(role: UserRole): void {
  cachedRole = role
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEYS.USER_ROLE, role)
    } catch (err) {
      console.error("Failed to save role:", err)
    }
  }
  emitChange()
}

export function resetStorageData(): Submission[] {
  cachedSubmissions = INITIAL_SUBMISSIONS
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS))
    } catch (err) {
      console.error("Failed to reset storage:", err)
    }
  }
  emitChange()
  return INITIAL_SUBMISSIONS
}

