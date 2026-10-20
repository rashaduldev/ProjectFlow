"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/auth-context"
import {
  LoginFormValues,
  RegisterFormValues,
  loginSchema,
  registerSchema,
} from "@/lib/validations/schemas"
import { UserRole } from "@/types/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  GraduationCap,
  ShieldCheck,
  LogIn,
  UserPlus,
  AlertCircle,
  Sparkles,
} from "lucide-react"

export function AuthCard() {
  const { login, register, authError, clearAuthError, quickLoginDemo, isLoading, apiMode } = useAuth()
  const [tab, setTab] = React.useState<"login" | "register">("login")

  // React Hook Form for Login with Zod
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // React Hook Form for Register with Zod
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  })

  const handleTabChange = (newTab: string) => {
    setTab(newTab as "login" | "register")
    clearAuthError()
    loginForm.clearErrors()
    registerForm.clearErrors()
  }

  const onLoginSubmit = async (data: LoginFormValues) => {
    await login(data.email.trim(), data.password)
  }

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    await register(data.name.trim(), data.email.trim(), data.password, data.role)
  }

  const currentRole = registerForm.watch("role")

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <Card className="shadow-lg border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <GraduationCap className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Programming Hero Portal
          </CardTitle>
          <CardDescription className="text-xs">
            Project Submission & Mentor Review Architecture
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* API Error Alert */}
          {authError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Authentication Notice</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{authError}</AlertDescription>
            </Alert>
          )}

          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="text-xs">
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                Log In
              </TabsTrigger>
              <TabsTrigger value="register" className="text-xs">
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="student@example.com"
                    {...loginForm.register("email")}
                    error={loginForm.formState.errors.email?.message}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register("password")}
                    error={loginForm.formState.errors.password?.message}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full text-xs" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Tanvir Ahmed"
                    {...registerForm.register("name")}
                    error={registerForm.formState.errors.name?.message}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="tanvir@example.com"
                    {...registerForm.register("email")}
                    error={registerForm.formState.errors.email?.message}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Password</label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    {...registerForm.register("password")}
                    error={registerForm.formState.errors.password?.message}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => registerForm.setValue("role", "STUDENT")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors ${
                        currentRole === "STUDENT"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      Student
                    </button>

                    <button
                      type="button"
                      onClick={() => registerForm.setValue("role", "MENTOR")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors ${
                        currentRole === "MENTOR"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Mentor
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full text-xs" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Quick Demo Logins for Evaluator */}
          <div className="pt-3 border-t border-border/80">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              Quick Fill Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLoginDemo("STUDENT")}
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
                onClick={() => quickLoginDemo("MENTOR")}
                className="text-xs h-8 gap-1.5"
                disabled={isLoading}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Mentor Demo
              </Button>
            </div>
            {apiMode === "live" && (
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Live API Mode: Connecting to Express backend at <code>http://localhost:5000/api</code>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
