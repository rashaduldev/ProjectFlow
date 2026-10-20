import * as React from "react"
import { Clock, Eye, AlertCircle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SubmissionStatus } from "@/types/dashboard"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: SubmissionStatus
  className?: string
  showIcon?: boolean
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="warning" className={cn("gap-1 font-medium", className)}>
          {showIcon && <Clock className="h-3 w-3" />}
          <span>Pending Review</span>
        </Badge>
      )
    case "in_review":
      return (
        <Badge variant="info" className={cn("gap-1 font-medium", className)}>
          {showIcon && <Eye className="h-3 w-3" />}
          <span>In Review</span>
        </Badge>
      )
    case "needs_revision":
      return (
        <Badge variant="destructive" className={cn("gap-1 font-medium", className)}>
          {showIcon && <AlertCircle className="h-3 w-3" />}
          <span>Needs Revision</span>
        </Badge>
      )
    case "passed":
      return (
        <Badge variant="success" className={cn("gap-1 font-medium", className)}>
          {showIcon && <CheckCircle2 className="h-3 w-3" />}
          <span>Passed</span>
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

