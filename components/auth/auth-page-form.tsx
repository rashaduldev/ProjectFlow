"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, GraduationCap, ShieldCheck, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from "@/lib/validations/schemas"

type AuthPageFormProps = { mode: "login" | "signup" }

export function AuthPageForm({ mode }: AuthPageFormProps) {
  const isSignup = mode === "signup"
  const router = useRouter()
  const { user, isLoading, authError, clearAuthError, login, register, quickLoginDemo, apiMode, setApiMode } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)
  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } })
  const signupForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  React.useEffect(() => {
    if (user) router.replace(user.role === "MENTOR" ? "/mentor/dashboard" : "/student/dashboard")
  }, [user, router])

  const redirectForRole = (role: "STUDENT" | "MENTOR") => {
    router.replace(role === "MENTOR" ? "/mentor/dashboard" : "/student/dashboard")
  }

  const onLogin = loginForm.handleSubmit(async (values) => {
    clearAuthError()
    const loggedUser = await login(values.email.trim(), values.password)
    if (loggedUser) redirectForRole(loggedUser.role)
  })

  const onSignup = signupForm.handleSubmit(async ({ name, email, password }) => {
    clearAuthError()
    const loggedUser = await register(name.trim(), email.trim(), password, "STUDENT")
    if (loggedUser) redirectForRole(loggedUser.role)
  })

  const generalError = authError
    ? authError
    : null
  const loginErrors = loginForm.formState.errors
  const signupErrors = signupForm.formState.errors

  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full rounded-2xl border-border/80 shadow-lg shadow-slate-900/5">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl tracking-tight">{isSignup ? "Create your account" : "Welcome back"}</CardTitle>
            <CardDescription className="text-sm">
              {isSignup ? "Join Programming Hero to submit projects and track reviews." : "Sign in to continue to your learning workspace."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label htmlFor="auth-mode" className="mb-1.5 block text-xs font-medium text-muted-foreground">Authentication environment</label>
            <select id="auth-mode" value={apiMode} onChange={(event) => setApiMode(event.target.value === "live" ? "live" : "mock")} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="mock">Demo data mode</option>
              <option value="live">Live Express API</option>
            </select>
          </div>
          {generalError && (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="size-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          {isSignup ? (
            <form onSubmit={onSignup} className="space-y-4" noValidate>
              <div>
                <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium">Full name</label>
                <Input id="signup-name" autoComplete="name" placeholder="Your full name" aria-invalid={!!signupErrors.name} {...signupForm.register("name")} />
                {signupErrors.name && <p className="mt-1 text-xs text-destructive">{signupErrors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium">Email</label>
                <Input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!signupErrors.email} {...signupForm.register("email")} />
                {signupErrors.email && <p className="mt-1 text-xs text-destructive">{signupErrors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium">Password</label>
                <div className="relative">
                  <Input id="signup-password" type={showPassword ? "text" : "password"} autoComplete="new-password" className="pr-10" aria-invalid={!!signupErrors.password} {...signupForm.register("password")} />
                  <button type="button" className="absolute inset-y-0 right-2 flex items-center rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Use at least 8 characters.</p>
                {signupErrors.password && <p className="mt-1 text-xs text-destructive">{signupErrors.password.message}</p>}
              </div>
              <div>
                <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium">Confirm password</label>
                <Input id="signup-confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" aria-invalid={!!signupErrors.confirmPassword} {...signupForm.register("confirmPassword")} />
                {signupErrors.confirmPassword && <p className="mt-1 text-xs text-destructive">{signupErrors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="h-10 w-full" disabled={isLoading}>
                {isLoading ? "Creating account…" : "Create student account"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onLogin} className="space-y-4" noValidate>
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">Email</label>
                <Input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!loginErrors.email} {...loginForm.register("email")} />
                {loginErrors.email && <p className="mt-1 text-xs text-destructive">{loginErrors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">Password</label>
                <div className="relative">
                  <Input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="pr-10" aria-invalid={!!loginErrors.password} {...loginForm.register("password")} />
                  <button type="button" className="absolute inset-y-0 right-2 flex items-center rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {loginErrors.password && <p className="mt-1 text-xs text-destructive">{loginErrors.password.message}</p>}
              </div>
              <Button type="submit" className="h-10 w-full" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          )}

          {!isSignup && apiMode === "mock" && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-center text-xs text-muted-foreground">Demo access · password: Password123!</p>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={() => void quickLoginDemo("STUDENT")} disabled={isLoading}>
                  <GraduationCap className="size-4" /> Student demo
                </Button>
                <Button type="button" variant="outline" onClick={() => void quickLoginDemo("MENTOR")} disabled={isLoading}>
                  <ShieldCheck className="size-4" /> Mentor demo
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "New to Programming Hero? "}
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
