"use client"

import * as React from "react"
import { User, UserRole } from "@/types/api"
import {
  api,
  ApiConnectionError,
  ApiHttpError,
  ApiMode,
  getStoredApiMode,
  setStoredApiMode,
} from "@/lib/api/client"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  apiMode: ApiMode
  setApiMode: (mode: ApiMode) => void
  authError: string | null
  clearAuthError: () => void
  login: (email: string, password: string) => Promise<UserRole | null>
  register: (name: string, email: string, password: string) => Promise<UserRole | null>
  logout: () => void
  quickLoginDemo: (role: UserRole) => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | null>(null)

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiHttpError && err.errors) {
    const details = Object.values(err.errors).flat().join(" ")
    return details ? `${err.message} ${details}` : err.message
  }
  if (err instanceof ApiConnectionError || err instanceof ApiHttpError || err instanceof Error) {
    return err.message
  }
  return fallback
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [apiMode, setApiModeState] = React.useState<ApiMode>("mock")
  const [isLoading, setIsLoading] = React.useState(true)
  const [authError, setAuthError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    setApiModeState(getStoredApiMode())
    api.auth
      .me()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const setApiMode = React.useCallback((mode: ApiMode) => {
    setApiModeState(mode)
    setStoredApiMode(mode)
    setUser(null)
    setAuthError(null)
  }, [])

  const clearAuthError = React.useCallback(() => setAuthError(null), [])

  const login = React.useCallback(async (email: string, password: string): Promise<UserRole | null> => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const response = await api.auth.login({ email, password })
      setUser(response.user)
      return response.user.role
    } catch (err: unknown) {
      setAuthError(errorMessage(err, "Login failed. Please check your details."))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = React.useCallback(async (name: string, email: string, password: string): Promise<UserRole | null> => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const response = await api.auth.register({ name, email, password })
      setUser(response.user)
      return response.user.role
    } catch (err: unknown) {
      setAuthError(errorMessage(err, "Registration failed."))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const quickLoginDemo = React.useCallback(async (role: UserRole) => {
    if (getStoredApiMode() === "mock") {
      setUser(
        role === "STUDENT"
          ? { id: "usr_student_1", name: "Tanvir Ahmed", email: "student@example.com", role }
          : { id: "usr_mentor_1", name: "Nayeem Chowdhury", email: "mentor@example.com", role }
      )
      return
    }
    await login(role === "STUDENT" ? "student@example.com" : "mentor@example.com", "Password123!")
  }, [login])

  const logout = React.useCallback(() => {
    setUser(null)
    void api.auth.logout().catch((err: unknown) => {
      setAuthError(errorMessage(err, "Unable to end the server session."))
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        apiMode,
        setApiMode,
        authError,
        clearAuthError,
        login,
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
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
