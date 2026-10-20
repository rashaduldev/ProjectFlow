"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function RootPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  React.useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.role === "MENTOR") {
          router.replace("/mentor/dashboard")
        } else {
          router.replace("/student/dashboard")
        }
      } else {
        router.replace("/login")
      }
    }
  }, [user, isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-muted-foreground text-xs font-medium">
          Loading portal session...
        </span>
      </div>
    </div>
  )
}
