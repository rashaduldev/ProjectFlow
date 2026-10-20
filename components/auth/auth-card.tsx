"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { UserRole } from "@/types/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { GraduationCap, ShieldCheck, LogIn, UserPlus, AlertCircle, Sparkles } from "lucide-react"

export function AuthCard() {
  const { login, register, authError, clearAuthError, quickLoginDemo, isLoading, apiMode } = useAuth()

  const [tab, setTab] = React.useState<"login" | "register">("login")

  // Login form
  const [loginEmail, setLoginEmail] = React.useState("")
  const [loginPassword, setLoginPassword] = React.useState("")

  // Register form
  const [regName, setRegName] = React.useState("")
  const [regEmail, setRegEmail] = React.useState("")
  const [regPassword, setRegPassword] = React.useState("")
  const [regRole, setRegRole] = React.useState<UserRole>("STUDENT")

  // Form field errors
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})

  const handleTabChange = (newTab: string) => {
    setTab(newTab as "login" | "register")
    clearAuthError()
    setFormErrors({})
  }

  const validateLogin = () => {
    const errors: Record<string, string> = {}
    if (!loginEmail.trim()) {
      errors.loginEmail = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      errors.loginEmail = "Enter a valid email address."
    }
    if (!loginPassword) {
      errors.loginPassword = "Password is required."
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateRegister = () => {
    const errors: Record<string, string> = {}
    if (!regName.trim()) {
      errors.regName = "Full name is required."
    }
    if (!regEmail.trim()) {
      errors.regEmail = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      errors.regEmail = "Enter a valid email address."
    }
    if (!regPassword) {
      errors.regPassword = "Password is required."
    } else if (regPassword.length < 6) {
      errors.regPassword = "Password must be at least 6 characters."
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLogin()) return
    await login(loginEmail.trim(), loginPassword)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return
    await register(regName.trim(), regEmail.trim(), regPassword, regRole)
  }

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
              <AlertTitle className="text-xs font-semibold">Authentication Error</AlertTitle>
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
              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="student@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    error={formErrors.loginEmail}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    error={formErrors.loginPassword}
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
              <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Tanvir Ahmed"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    error={formErrors.regName}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="tanvir@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    error={formErrors.regEmail}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Password</label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    error={formErrors.regPassword}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole("STUDENT")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors ${
                        regRole === "STUDENT"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      Student
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole("MENTOR")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors ${
                        regRole === "MENTOR"
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
                Live API Mode: Ensure Express backend runs on <code>http://localhost:5000/api</code>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

