"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/auth-context"
import { SignupFormValues, signupSchema } from "@/lib/validations/schemas"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  ShieldCheck,
} from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const { signup, authError, clearAuthError, isLoading, user } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      if (user.role === "MENTOR") {
        router.push("/mentor/dashboard")
      } else {
        router.push("/student/dashboard")
      }
    }
  }, [user, router])

  const onSubmit = async (data: SignupFormValues) => {
    clearAuthError()
    const newUser = await signup(data.name.trim(), data.email.trim(), data.password)
    if (newUser) {
      router.push("/student/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-border">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-xs">
              <UserPlus className="size-6" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Create Student Account
            </CardTitle>
            <CardDescription className="text-xs">
              Join Programming Hero to submit projects and receive mentor reviews
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {authError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">Registration Error</AlertTitle>
                <AlertDescription className="text-xs mt-0.5">{authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Tanvir Ahmed"
                  autoComplete="name"
                  {...register("name")}
                  error={errors.name?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="tanvir@example.com"
                  autoComplete="email"
                  {...register("email")}
                  error={errors.email?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  Password <span className="text-destructive">*</span>{" "}
                  <span className="text-[11px] text-muted-foreground font-normal">
                    (min 6 characters)
                  </span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  Confirm Password <span className="text-destructive">*</span>
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Role policy disclaimer */}
              <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2 border border-border">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Self-registration enrolls accounts with the <strong>Student</strong> role. Mentor accounts are provisioned by academic administration.
                </span>
              </div>

              <Button type="submit" className="w-full text-xs gap-1.5" disabled={isLoading}>
                <UserPlus className="h-3.5 w-3.5" />
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-border pt-4 pb-4 flex justify-center text-xs text-muted-foreground">
            <span>
              Already registered?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in to your account
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
