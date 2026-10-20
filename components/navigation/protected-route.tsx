"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import type { UserRole } from "@/types/api"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

export function ProtectedRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" aria-live="polite">Checking your session…</main>
  }

  if (user.role !== role) {
    const destination = user.role === "MENTOR" ? "/mentor/dashboard" : "/student/dashboard"
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold">You don’t have access to this page</h1>
        <p className="text-sm text-muted-foreground">This area is for {role === "MENTOR" ? "mentors" : "students"}. Your signed-in account is a {user.role.toLowerCase()} account.</p>
        <Button onClick={() => router.push(destination)}>Go to your dashboard</Button>
      </main>
    )
  }

  return <>{children}</>
}
