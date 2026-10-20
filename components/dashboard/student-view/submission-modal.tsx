"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Assignment, Submission } from "@/types/dashboard"
import { validateSafeUrl } from "@/lib/url-validator"
import { useDashboard } from "@/context/dashboard-context"
import {
  Globe,
  ShieldCheck,
  Video,
} from "lucide-react"
import { GithubIcon } from "@/components/ui/icons"

interface SubmissionModalProps {
  assignment: Assignment | null
  existingSubmission?: Submission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function SubmissionForm({
  assignment,
  existingSubmission,
  onClose,
  onSuccess,
}: {
  assignment: Assignment | null
  existingSubmission?: Submission | null
  onClose: () => void
  onSuccess?: () => void
}) {
  const { submitProject, resubmitProject } = useDashboard()
  const isResubmission = Boolean(existingSubmission && existingSubmission.status === "needs_revision")

  const [liveUrl, setLiveUrl] = React.useState(
    () => existingSubmission?.liveUrl || ""
  )
  const [githubClientUrl, setGithubClientUrl] = React.useState(
    () => existingSubmission?.githubClientUrl || ""
  )
  const [githubServerUrl, setGithubServerUrl] = React.useState(
    () => existingSubmission?.githubServerUrl || ""
  )
  const [videoDemoUrl, setVideoDemoUrl] = React.useState(
    () => existingSubmission?.videoDemoUrl || ""
  )
  const [studentNotes, setStudentNotes] = React.useState(() => {
    if (isResubmission && existingSubmission) {
      return `[Revision ${existingSubmission.revisionCount + 1}] Fixed requested issues: `
    }
    return existingSubmission?.studentNotes || ""
  })

  const [checklist, setChecklist] = React.useState(() => {
    if (existingSubmission?.checklistCompleted) {
      return existingSubmission.checklistCompleted
    }
    return {
      publicRepo: false,
      readmeProvided: false,
      liveLinkActive: false,
      credentialsInReadme: false,
    }
  })

  const [errors, setErrors] = React.useState<{ [key: string]: string }>({})
  const [generalError, setGeneralError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Live URL
    const liveValidation = validateSafeUrl(liveUrl)
    if (!liveValidation.isValid) {
      newErrors.liveUrl = liveValidation.error || "Please enter a valid live URL"
    }

    // GitHub Client URL
    const clientValidation = validateSafeUrl(githubClientUrl, { requireGitHub: true })
    if (!clientValidation.isValid) {
      newErrors.githubClientUrl =
        clientValidation.error || "Please enter a valid GitHub repository URL"
    }

    // GitHub Server URL (optional)
    if (githubServerUrl.trim()) {
      const serverValidation = validateSafeUrl(githubServerUrl, { requireGitHub: true })
      if (!serverValidation.isValid) {
        newErrors.githubServerUrl =
          serverValidation.error || "Please enter a valid GitHub repository URL"
      }
    }

    // Video URL (optional)
    if (videoDemoUrl.trim()) {
      const videoValidation = validateSafeUrl(videoDemoUrl)
      if (!videoValidation.isValid) {
        newErrors.videoDemoUrl =
          videoValidation.error || "Please enter a valid walkthrough link"
      }
    }

    // Checklist check (only for initial submission)
    if (!isResubmission) {
      if (!checklist.publicRepo || !checklist.readmeProvided || !checklist.liveLinkActive) {
        newErrors.checklist =
          "Please verify and complete all mandatory pre-submission checklist items."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)

    if (!validateForm()) {
      return
    }

    if (!assignment && !existingSubmission) return

    setIsSubmitting(true)

    try {
      if (isResubmission && existingSubmission) {
        const res = resubmitProject({
          submissionId: existingSubmission.id,
          liveUrl: liveUrl.trim(),
          githubClientUrl: githubClientUrl.trim(),
          githubServerUrl: githubServerUrl.trim() || undefined,
          videoDemoUrl: videoDemoUrl.trim() || undefined,
          studentNotes: studentNotes.trim() || undefined,
        })

        if (!res.success) {
          setGeneralError(res.message)
          setIsSubmitting(false)
          return
        }
      } else if (assignment) {
        const res = submitProject({
          assignmentId: assignment.id,
          liveUrl: liveUrl.trim(),
          githubClientUrl: githubClientUrl.trim(),
          githubServerUrl: githubServerUrl.trim() || undefined,
          videoDemoUrl: videoDemoUrl.trim() || undefined,
          studentNotes: studentNotes.trim() || undefined,
          checklistCompleted: checklist,
        })

        if (!res.success) {
          setGeneralError(res.message)
          setIsSubmitting(false)
          return
        }
      }

      setIsSubmitting(false)
      onClose()
      onSuccess?.()
    } catch {
      setGeneralError("An unexpected error occurred while saving the submission.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Submission Error</AlertTitle>
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Live Deployment Link */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-primary" />
          Live Deployment URL <span className="text-destructive">*</span>
        </label>
        <Input
          type="url"
          placeholder="https://my-project.vercel.app or https://my-project.web.app"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          error={errors.liveUrl}
          required
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Ensure this link is live and test it in an incognito window without login cookies.
        </p>
      </div>

      {/* GitHub Repositories Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
            <GithubIcon className="h-3.5 w-3.5 text-primary" />
            GitHub Client Repository <span className="text-destructive">*</span>
          </label>
          <Input
            type="url"
            placeholder="https://github.com/username/project-client"
            value={githubClientUrl}
            onChange={(e) => setGithubClientUrl(e.target.value)}
            error={errors.githubClientUrl}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
            <GithubIcon className="h-3.5 w-3.5 text-muted-foreground" />
            GitHub Server Repository{" "}
            <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
          </label>
          <Input
            type="url"
            placeholder="https://github.com/username/project-server"
            value={githubServerUrl}
            onChange={(e) => setGithubServerUrl(e.target.value)}
            error={errors.githubServerUrl}
          />
        </div>
      </div>

      {/* Walkthrough Video Link */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5">
          <Video className="h-3.5 w-3.5 text-muted-foreground" />
          Walkthrough Demo Video{" "}
          <span className="text-xs text-muted-foreground font-normal">
            (Optional - Loom / YouTube / Drive)
          </span>
        </label>
        <Input
          type="url"
          placeholder="https://www.loom.com/share/..."
          value={videoDemoUrl}
          onChange={(e) => setVideoDemoUrl(e.target.value)}
          error={errors.videoDemoUrl}
        />
      </div>

      {/* Student Notes / Changelog */}
      <div>
        <label className="block text-xs font-semibold mb-1.5">
          {isResubmission
            ? "Changelog / Explanation of Fixes"
            : "Notes for Evaluator (Optional)"}
        </label>
        <Textarea
          placeholder={
            isResubmission
              ? "Describe what changes you made to address the instructor's feedback..."
              : "Highlight any bonus features, challenges overcome, or setup instructions..."
          }
          value={studentNotes}
          onChange={(e) => setStudentNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Pre-submission Checklist */}
      {!isResubmission && (
        <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Pre-Submission Integrity Checklist
            </h4>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checklist.publicRepo}
                onChange={(e) =>
                  setChecklist((c) => ({ ...c, publicRepo: e.target.checked }))
                }
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <span>
                My GitHub repository is <strong>Public</strong> and can be cloned by instructors without permissions.
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checklist.readmeProvided}
                onChange={(e) =>
                  setChecklist((c) => ({ ...c, readmeProvided: e.target.checked }))
                }
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <span>
                The repository includes a detailed <strong>README.md</strong> with features and run steps.
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checklist.liveLinkActive}
                onChange={(e) =>
                  setChecklist((c) => ({ ...c, liveLinkActive: e.target.checked }))
                }
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <span>
                I verified the <strong>Live Link</strong> works and refreshes correctly without 404 errors.
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checklist.credentialsInReadme}
                onChange={(e) =>
                  setChecklist((c) => ({ ...c, credentialsInReadme: e.target.checked }))
                }
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <span>
                Test login credentials (if any) are written clearly in the README or notes.
              </span>
            </label>
          </div>

          {errors.checklist && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.checklist}
            </p>
          )}
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Submitting..."
            : isResubmission
              ? "Submit Revision"
              : "Submit Project"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function SubmissionModal({
  assignment,
  existingSubmission,
  open,
  onOpenChange,
  onSuccess,
}: SubmissionModalProps) {
  const isResubmission = Boolean(existingSubmission && existingSubmission.status === "needs_revision")

  const title = isResubmission
    ? `Resubmit Project: ${existingSubmission?.assignmentTitle || assignment?.title}`
    : `Submit Project: ${assignment?.title}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {assignment?.milestone || existingSubmission?.milestone}
            </span>
          </div>
          <DialogTitle className="text-xl mt-1">{title}</DialogTitle>
          <DialogDescription>
            {isResubmission
              ? "Address the instructor's feedback and provide your updated deployment and repository links."
              : "Carefully review all links and verify they are publicly accessible before submitting for grading."}
          </DialogDescription>
        </DialogHeader>

        <SubmissionForm
          key={existingSubmission?.id || assignment?.id || "form-new"}
          assignment={assignment}
          existingSubmission={existingSubmission}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}

