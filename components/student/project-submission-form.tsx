"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { api, ApiConnectionError, ApiHttpError } from "@/lib/api/client"
import { Submission } from "@/types/api"
import { validateSafeUrl } from "@/lib/url-validator"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GithubIcon } from "@/components/ui/icons"
import { Globe, FileText, Send, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react"

interface ProjectSubmissionFormProps {
  existingSubmissions: Submission[]
  onSubmissionSuccess: (newSubmission: Submission) => void
}

export function ProjectSubmissionForm({
  existingSubmissions,
  onSubmissionSuccess,
}: ProjectSubmissionFormProps) {
  const { user } = useAuth()

  // 4 required fields
  const [projectName, setProjectName] = React.useState("")
  const [githubUrl, setGithubUrl] = React.useState("")
  const [liveUrl, setLiveUrl] = React.useState("")
  const [description, setDescription] = React.useState("")

  // Form state
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Real-time client-side duplicate check
  const duplicateWarning = React.useMemo(() => {
    if (!projectName.trim() && !githubUrl.trim()) return null

    const pName = projectName.trim().toLowerCase()
    const gUrl = githubUrl.trim().toLowerCase()

    const found = existingSubmissions.find(
      (s) =>
        s.status === "PENDING" &&
        (s.projectName.toLowerCase() === pName || (gUrl && s.githubUrl.toLowerCase() === gUrl))
    )

    if (found) {
      return `Duplicate warning: You already have a pending submission for "${found.projectName}". Submitting another duplicate is prevented.`
    }
    return null
  }, [projectName, githubUrl, existingSubmissions])

  const validate = () => {
    const errs: Record<string, string> = {}

    if (!projectName.trim()) {
      errs.projectName = "Project name is required."
    } else if (projectName.trim().length < 3) {
      errs.projectName = "Project name must be at least 3 characters."
    }

    const githubValidation = validateSafeUrl(githubUrl, { requireGitHub: true })
    if (!githubValidation.isValid) {
      errs.githubUrl = githubValidation.error || "Please enter a valid GitHub repository URL."
    }

    const liveValidation = validateSafeUrl(liveUrl)
    if (!liveValidation.isValid) {
      errs.liveUrl = liveValidation.error || "Please enter a valid live deployment URL."
    }

    if (!description.trim()) {
      errs.description = "Project description is required."
    } else if (description.trim().length < 15) {
      errs.description = "Please provide a descriptive overview (at least 15 characters)."
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setSuccessMessage(null)

    // Check UI duplicate prevention
    if (duplicateWarning) {
      setApiError(duplicateWarning)
      return
    }

    if (!validate()) return
    if (!user) {
      setApiError("You must be logged in as a student to submit a project.")
      return
    }

    setIsSubmitting(true)

    try {
      const created = await api.submissions.create(
        {
          projectName: projectName.trim(),
          githubUrl: githubUrl.trim(),
          liveUrl: liveUrl.trim(),
          description: description.trim(),
        },
        user
      )

      setSuccessMessage(`Project "${created.projectName}" submitted successfully for mentor review!`)
      setProjectName("")
      setGithubUrl("")
      setLiveUrl("")
      setDescription("")
      setErrors({})
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Project Name */}
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Project Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. CareerHub Job Portal"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              error={errors.projectName}
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
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                error={errors.githubUrl}
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
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                error={errors.liveUrl}
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
              placeholder="Describe the core features, technologies used, and test credentials (if any)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground">
              {isSubmitting ? "Submitting securely..." : "All 4 fields are required."}
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
