"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export function MainDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (isLoading) return
    router.replace(user ? (user.role === "MENTOR" ? "/mentor/dashboard" : "/student/dashboard") : "/login")
  }, [isLoading, user, router])

  return <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" aria-live="polite">Opening your workspace…</main>
}
