"use client"

import * as React from "react"
import Link from "next/link"
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
  ShieldAlert,
} from "lucide-react"

interface ProjectSubmissionFormProps {
  onSubmissionSuccess: (newSubmission: Submission) => void
}

export function ProjectSubmissionForm({
  onSubmissionSuccess,
}: ProjectSubmissionFormProps) {
  const { user } = useAuth()
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const submitLock = React.useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      projectName: "",
      githubUrl: "",
      liveUrl: "",
      description: "",
    },
  })

  const onSubmit = async (data: SubmissionFormValues) => {
    if (submitLock.current) return
    submitLock.current = true
    setApiError(null)
    setSuccessMessage(null)

    if (!user) {
      setApiError("You must be signed in as a student to submit a project.")
      submitLock.current = false
      return
    }

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
      if (err instanceof ApiHttpError) {
        const fieldNames = ["projectName", "githubUrl", "liveUrl", "description"] as const
        for (const field of fieldNames) {
          const message = err.errors?.[field]?.[0]
          if (message) setError(field, { type: "server", message })
        }
        if (err.statusCode === 409) {
          setApiError(`This submission conflicts with an existing pending submission. ${err.message}`)
        } else if (err.statusCode === 401) {
          setApiError("Your session has expired. Sign in again before submitting.")
        } else {
          const fieldMessages = err.errors ? Object.values(err.errors).flat().join(" ") : ""
          setApiError(fieldMessages ? `${err.message} ${fieldMessages}` : err.message)
        }
      } else if (err instanceof ApiConnectionError) {
        setApiError(err.message)
      } else if (err instanceof Error) {
        setApiError(/duplicate|409/i.test(err.message)
          ? `This submission conflicts with an existing pending submission. ${err.message}`
          : err.message)
      } else {
        setApiError("Failed to submit project.")
      }
    } finally {
      submitLock.current = false
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
          Provide your repository and live URL. The server checks for conflicts and confirms successful submissions.
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

        {/* Success Alert */}
        {successMessage && (
          <Alert variant="success" className="py-2.5">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Success</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">{successMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          {/* 1. Project Name */}
          <div>
            <label htmlFor="project-name" className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Project Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="project-name"
              type="text"
              placeholder="e.g. CareerHub Job Portal"
              maxLength={80}
              {...register("projectName")}
              error={errors.projectName?.message}
              disabled={isSubmitting}
            />
          </div>

          {/* 2 & 3. GitHub & Live URLs */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="github-url" className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
                <GithubIcon className="h-3.5 w-3.5 text-primary" />
                GitHub Repository URL <span className="text-destructive">*</span>
              </label>
              <Input
                id="github-url"
                type="url"
                placeholder="https://github.com/username/project"
                maxLength={2048}
                {...register("githubUrl")}
                error={errors.githubUrl?.message}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="live-url" className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Live Project URL <span className="text-destructive">*</span>
              </label>
              <Input
                id="live-url"
                type="url"
                placeholder="https://my-app.vercel.app"
                maxLength={2048}
                {...register("liveUrl")}
                error={errors.liveUrl?.message}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 4. Project Description */}
          <div>
            <label htmlFor="project-description" className="block text-xs font-semibold mb-1">
              Project Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="project-description"
              placeholder="Describe core features, tech stack, and test credentials (at least 15 characters)..."
              {...register("description")}
              error={errors.description?.message}
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground">
              {isSubmitting ? "Submitting your project…" : "All fields are required."}
            </span>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "Submitting…" : "Submit Project"}
            </Button>
          </div>
          {apiError && apiError.includes("session has expired") && (
            <p className="text-right text-xs"><Link href="/login" className="font-medium text-primary underline underline-offset-4">Go to sign in</Link></p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
