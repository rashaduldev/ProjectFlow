"use client"

import * as React from "react"
import { User, UserRole } from "@/types/api"
import {
  api,
  ApiConnectionError,
  ApiHttpError,
  ApiMode,
  getStoredApiMode,
  getStoredToken,
  setStoredApiMode,
  setStoredToken,
} from "@/lib/api/client"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  apiMode: ApiMode
  setApiMode: (mode: ApiMode) => void
  authError: string | null
  clearAuthError: () => void
  login: (email: string, password: string) => Promise<User | null>
  signup: (name: string, email: string, password: string) => Promise<User | null>
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<User | null>
  logout: () => void
  quickLoginDemo: (role: UserRole) => Promise<User | null>
}

const AuthContext = React.createContext<AuthContextType | null>(null)

const USER_STORAGE_KEY = "ph_dashboard_user_profile"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const rawUser = window.localStorage.getItem(USER_STORAGE_KEY)
      if (rawUser) {
        return JSON.parse(rawUser)
      }
      const storedMode = getStoredApiMode()
      if (storedMode === "mock") {
        const defaultStudent: User = {
          id: "usr_student_1",
          name: "Tanvir Ahmed",
          email: "student@example.com",
          role: "STUDENT",
        }
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultStudent))
        return defaultStudent
      }
    } catch {
      return null
    }
    return null
  })

  const [token, setToken] = React.useState<string | null>(() => getStoredToken())
  const [apiMode, setApiModeState] = React.useState<ApiMode>(() => getStoredApiMode())
  const [isLoading, setIsLoading] = React.useState(false)
  const [authError, setAuthError] = React.useState<string | null>(null)

  const setApiMode = React.useCallback((mode: ApiMode) => {
    setApiModeState(mode)
    setStoredApiMode(mode)
  }, [])

  const clearAuthError = React.useCallback(() => {
    setAuthError(null)
  }, [])

  const login = React.useCallback(
    async (email: string, password: string): Promise<User | null> => {
      setIsLoading(true)
      setAuthError(null)

      try {
        const response = await api.auth.login({ email, password })
        setUser(response.user)
        setToken(response.token)
        setStoredToken(response.token)
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user))
        setIsLoading(false)
        return response.user
      } catch (err: unknown) {
        if (err instanceof ApiConnectionError || err instanceof ApiHttpError) {
          setAuthError(err.message)
        } else if (err instanceof Error) {
          setAuthError(err.message)
        } else {
          setAuthError("Login failed. Please check credentials.")
        }
        setIsLoading(false)
        return null
      }
    },
    []
  )

  const signup = React.useCallback(
    async (name: string, email: string, password: string): Promise<User | null> => {
      setIsLoading(true)
      setAuthError(null)

      try {
        const response = await api.auth.signup({ name, email, password })
        setUser(response.user)
        setToken(response.token)
        setStoredToken(response.token)
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user))
        setIsLoading(false)
        return response.user
      } catch (err: unknown) {
        if (err instanceof ApiConnectionError || err instanceof ApiHttpError) {
          setAuthError(err.message)
        } else if (err instanceof Error) {
          setAuthError(err.message)
        } else {
          setAuthError("Account creation failed.")
        }
        setIsLoading(false)
        return null
      }
    },
    []
  )

  const register = React.useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole
    ): Promise<User | null> => {
      setIsLoading(true)
      setAuthError(null)

      try {
        const response = await api.auth.register({ name, email, password, role })
        setUser(response.user)
        setToken(response.token)
        setStoredToken(response.token)
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user))
        setIsLoading(false)
        return response.user
      } catch (err: unknown) {
        if (err instanceof ApiConnectionError || err instanceof ApiHttpError) {
          setAuthError(err.message)
        } else if (err instanceof Error) {
          setAuthError(err.message)
        } else {
          setAuthError("Registration failed.")
        }
        setIsLoading(false)
        return null
      }
    },
    []
  )

  const quickLoginDemo = React.useCallback(
    async (targetRole: UserRole): Promise<User | null> => {
      setIsLoading(true)
      setAuthError(null)

      const email = targetRole === "STUDENT" ? "student@example.com" : "mentor@example.com"
      const password = "Password123!"

      try {
        const res = await login(email, password)
        if (res) return res
      } catch {
        // Fallback for mock if login failed
      }

      const fallbackUser: User =
        targetRole === "STUDENT"
          ? {
              id: "usr_student_1",
              name: "Tanvir Ahmed",
              email: "student@example.com",
              role: "STUDENT",
            }
          : {
              id: "usr_mentor_1",
              name: "Nayeem Chowdhury",
              email: "mentor@example.com",
              role: "MENTOR",
            }
      setUser(fallbackUser)
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallbackUser))
      setIsLoading(false)
      return fallbackUser
    },
    [login]
  )

  const logout = React.useCallback(() => {
    setUser(null)
    setToken(null)
    setStoredToken(null)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_STORAGE_KEY)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        apiMode,
        setApiMode,
        authError,
        clearAuthError,
        login,
        signup,
        register,
        logout,
        quickLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
