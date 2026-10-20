"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/auth-context"
import { useCreateSubmission, useMySubmissions } from "@/lib/hooks/use-submissions"
import { SubmissionFormValues, submissionSchema } from "@/lib/validations/schemas"
import { ApiConnectionError, ApiHttpError } from "@/lib/api/client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GithubIcon } from "@/components/ui/icons"
import {
  Globe,
  FileText,
  Send,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react"

export default function NewSubmissionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: existingSubmissions = [] } = useMySubmissions(user?.id)
  const createMutation = useCreateSubmission()

  const [apiError, setApiError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      projectName: "",
      githubUrl: "",
      liveUrl: "",
      description: "",
    },
  })

  const watchedProjectName = useWatch({ control, name: "projectName" })
  const watchedGithubUrl = useWatch({ control, name: "githubUrl" })

  // Real-time client-side duplicate prevention check
  const duplicateWarning = React.useMemo(() => {
    if (!watchedProjectName?.trim() && !watchedGithubUrl?.trim()) return null

    const pName = watchedProjectName?.trim().toLowerCase()
    const gUrl = watchedGithubUrl?.trim().toLowerCase()

    const found = existingSubmissions.find(
      (s) =>
        s.status === "PENDING" &&
        (s.projectName.toLowerCase() === pName || (gUrl && s.githubUrl.toLowerCase() === gUrl))
    )

    if (found) {
      return `Duplicate Entry Blocked: A pending submission for "${found.projectName}" already exists in the queue.`
    }
    return null
  }, [watchedProjectName, watchedGithubUrl, existingSubmissions])

  const onSubmit = async (data: SubmissionFormValues) => {
    setApiError(null)
    setSuccessMessage(null)

    if (duplicateWarning) {
      setApiError(duplicateWarning)
      return
    }

    if (!user) {
      setApiError("You must be signed in as a student to submit a project.")
      return
    }

    try {
      const created = await createMutation.mutateAsync({
        payload: {
          projectName: data.projectName.trim(),
          githubUrl: data.githubUrl.trim(),
          liveUrl: data.liveUrl.trim(),
          description: data.description.trim(),
        },
        currentUser: user,
      })

      setSuccessMessage(`Project "${created.projectName}" was submitted successfully. Redirecting...`)
      reset()
      setTimeout(() => {
        router.push("/student/submissions")
      }, 1200)
    } catch (err: unknown) {
      if (err instanceof ApiConnectionError || err instanceof ApiHttpError) {
        setApiError(err.message)
      } else if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError("Failed to submit project. Please try again.")
      }
    }
  }

  const isSubmitting = createMutation.isPending

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back button */}
      <div>
        <Link
          href="/student/submissions"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to My Submissions</span>
        </Link>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader className="pb-3 border-b border-border/80">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Send className="h-4 w-4 text-primary" />
            Submit New Project
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your project details below for academic mentor evaluation. All four fields are strictly validated with Zod.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          {/* API Error Alert */}
          {apiError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Submission Notice</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Duplicate Submission Warning */}
          {duplicateWarning && (
            <Alert variant="warning" className="py-2.5">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Duplicate Check Warning</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{duplicateWarning}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert variant="success" className="py-2.5">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Submission Received</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. Project Name */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Project Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. CareerHub Job Portal"
                {...register("projectName")}
                error={errors.projectName?.message}
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                A concise and descriptive name for your application (3 to 80 characters).
              </p>
            </div>

            {/* 2. GitHub Repository URL */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground flex items-center gap-1.5">
                <GithubIcon className="h-3.5 w-3.5 text-primary" />
                GitHub Repository URL <span className="text-destructive">*</span>
              </label>
              <Input
                type="url"
                placeholder="https://github.com/username/project"
                {...register("githubUrl")}
                error={errors.githubUrl?.message}
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Must be a public repository on <code>github.com</code> with HTTP/HTTPS protocol.
              </p>
            </div>

            {/* 3. Live Deployment URL */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Live Project Deployment URL <span className="text-destructive">*</span>
              </label>
              <Input
                type="url"
                placeholder="https://my-app.vercel.app"
                {...register("liveUrl")}
                error={errors.liveUrl?.message}
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Verify that your live deployment is active and internal routes reload without 404 errors.
              </p>
            </div>

            {/* 4. Project Description */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                Project Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Describe key features, technical stack, architecture patterns, and sample login credentials (at least 15 characters)..."
                {...register("description")}
                error={errors.description?.message}
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {/* Pre-submission Integrity Notice */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Submission Guidelines
              </span>
              <ul className="text-[11px] text-muted-foreground list-disc pl-5 space-y-0.5">
                <li>Repository must be public and readable by mentors.</li>
                <li>README.md should specify features and test admin/user credentials.</li>
                <li>Duplicate submissions for identical projects will be rejected.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link href="/student/submissions">
                <Button type="button" variant="outline" size="sm" className="text-xs">
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !!duplicateWarning}
                className="text-xs gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? "Submitting..." : "Submit Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
