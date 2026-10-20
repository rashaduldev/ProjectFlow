"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/auth-context"
import { api, ApiConnectionError, ApiHttpError } from "@/lib/api/client"
import { Submission } from "@/types/api"
import { SubmissionFormValues, submissionSchema } from "@/lib/validations/schemas"
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
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react"

interface ProjectSubmissionFormProps {
  existingSubmissions: Submission[]
  onSubmissionSuccess: (newSubmission: Submission) => void
}

export function ProjectSubmissionForm({
  existingSubmissions,
  onSubmissionSuccess,
}: ProjectSubmissionFormProps) {
  const { user } = useAuth()
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
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

  const watchedProjectName = watch("projectName")
  const watchedGithubUrl = watch("githubUrl")

  // Real-time client-side duplicate check
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
      return `Duplicate warning: You already have a pending submission for "${found.projectName}". Submitting duplicate pending entries is blocked.`
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

    setIsSubmitting(true)

    try {
      const created = await api.submissions.create(
        {
          projectName: data.projectName.trim(),
          githubUrl: data.githubUrl.trim(),
          liveUrl: data.liveUrl.trim(),
          description: data.description.trim(),
        },
        user
      )

      setSuccessMessage(`Project "${created.projectName}" was submitted successfully for mentor review.`)
      reset()
      onSubmissionSuccess(created)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err: unknown) {
      if (err instanceof ApiConnectionError || err instanceof ApiHttpError) {
        setApiError(err.message)
      } else if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError("Failed to submit project.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          Submit a Project for Mentor Review
        </CardTitle>
        <CardDescription className="text-xs">
          Provide your project repository and live URL. Duplicate submissions are automatically protected.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* API Error Alert */}
        {apiError && (
          <Alert variant="destructive" className="py-2.5">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Submission Notice</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">{apiError}</AlertDescription>
          </Alert>
        )}

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <Alert variant="warning" className="py-2.5">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Duplicate Submission Blocked</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">{duplicateWarning}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert variant="success" className="py-2.5">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Success</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">{successMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* 1. Project Name */}
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
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
          </div>

          {/* 2 & 3. GitHub & Live URLs */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
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
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Live Project URL <span className="text-destructive">*</span>
              </label>
              <Input
                type="url"
                placeholder="https://my-app.vercel.app"
                {...register("liveUrl")}
                error={errors.liveUrl?.message}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 4. Project Description */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Project Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Describe core features, tech stack, and test credentials (at least 15 characters)..."
              {...register("description")}
              error={errors.description?.message}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground">
              {isSubmitting ? "Validating & submitting..." : "All 4 fields are validated with Zod."}
            </span>
            <Button
              type="submit"
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
  )
}
