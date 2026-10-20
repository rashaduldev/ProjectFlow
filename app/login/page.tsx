"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/auth-context"
import { LoginFormValues, loginSchema } from "@/lib/validations/schemas"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  Sparkles,
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, authError, clearAuthError, quickLoginDemo, isLoading, apiMode, user } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // If already logged in, redirect to appropriate portal
  React.useEffect(() => {
    if (user) {
      if (user.role === "MENTOR") {
        router.push("/mentor/dashboard")
      } else {
        router.push("/student/dashboard")
      }
    }
  }, [user, router])

  const onSubmit = async (data: LoginFormValues) => {
    clearAuthError()
    const loggedUser = await login(data.email.trim(), data.password)
    if (loggedUser) {
      if (loggedUser.role === "MENTOR") {
        router.push("/mentor/dashboard")
      } else {
        router.push("/student/dashboard")
      }
    }
  }

  const handleDemoLogin = async (role: "STUDENT" | "MENTOR") => {
    clearAuthError()
    const loggedUser = await quickLoginDemo(role)
    if (loggedUser) {
      if (loggedUser.role === "MENTOR") {
        router.push("/mentor/dashboard")
      } else {
        router.push("/student/dashboard")
      }
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-border">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-xs">
              <GraduationCap className="size-6" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Welcome to Programming Hero
            </CardTitle>
            <CardDescription className="text-xs">
              Sign in to your Student or Mentor account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {authError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">Authentication Error</AlertTitle>
                <AlertDescription className="text-xs mt-0.5">{authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="student@example.com"
                  autoComplete="email"
                  {...register("email")}
                  error={errors.email?.message}
                  disabled={isLoading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-foreground">
                    Password <span className="text-destructive">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    error={errors.password?.message}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full text-xs gap-1.5" disabled={isLoading}>
                <LogIn className="h-3.5 w-3.5" />
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Quick Fill Demo Logins */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                Quick Assessment Demo Accounts:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("STUDENT")}
                  className="text-xs h-8 gap-1.5"
                  disabled={isLoading}
                >
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  Student Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("MENTOR")}
                  className="text-xs h-8 gap-1.5"
                  disabled={isLoading}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Mentor Demo
                </Button>
              </div>

              {apiMode === "live" && (
                <p className="text-[10px] text-muted-foreground text-center">
                  Live API Mode active (<code>http://localhost:5000/api</code>)
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t border-border pt-4 pb-4 flex justify-center text-xs text-muted-foreground">
            <span>
              Don&apos;t have an account yet?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Create student account
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
