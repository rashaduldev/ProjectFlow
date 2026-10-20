"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft, GraduationCap, ShieldCheck, LogIn } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, quickLoginDemo } = useAuth()

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-destructive/20 bg-card text-center">
          <CardHeader className="pb-3">
            <div className="mx-auto size-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-2 shadow-xs">
              <ShieldAlert className="size-6" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-destructive">
              Access Denied (403 Forbidden)
            </CardTitle>
            <CardDescription className="text-xs">
              You do not have the required permissions to access this page.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            <div className="rounded-lg bg-muted/40 p-3.5 text-left space-y-1.5 border border-border">
              <span className="font-semibold text-foreground block">
                Current Session: {user?.name || "Unauthenticated"}
              </span>
              <p className="text-muted-foreground leading-relaxed">
                Role: <strong>{user?.role || "GUEST"}</strong>.
                {user?.role === "STUDENT"
                  ? " This route is restricted to verified Mentors and Instructors."
                  : user?.role === "MENTOR"
                    ? " This route is reserved for enrolled Students."
                    : " Please sign in with an authorized account."}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Quick Role Switching (Demo):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const s = await quickLoginDemo("STUDENT")
                    if (s) router.push("/student/dashboard")
                  }}
                  className="text-xs h-8 gap-1.5"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  Student Portal
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const m = await quickLoginDemo("MENTOR")
                    if (m) router.push("/mentor/dashboard")
                  }}
                  className="text-xs h-8 gap-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Mentor Portal
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-border pt-4 pb-4 flex justify-center gap-2">
            <Link href="/login">
              <Button size="sm" variant="ghost" className="text-xs gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Button>
            </Link>

            <Link href={user?.role === "MENTOR" ? "/mentor/dashboard" : "/student/dashboard"}>
              <Button size="sm" className="text-xs gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

