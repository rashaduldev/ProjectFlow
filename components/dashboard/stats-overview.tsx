"use client"

import * as React from "react"
import {
  Award,
  CheckCircle2,
  Clock,
  FileCode2,
  Layers,
  RotateCcw,
  TrendingUp,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { useDashboard } from "@/context/dashboard-context"

export function StatsOverview() {
  const { role, studentStats, instructorStats } = useDashboard()

  if (role === "student") {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* Total Submitted */}
        <Card className="p-4 bg-card/60 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Submitted Projects
            </span>
            <FileCode2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{studentStats.totalSubmitted}</span>
            <span className="text-xs text-muted-foreground">in current course</span>
          </div>
        </Card>

        {/* Passed Projects */}
        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Passed / Approved
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {studentStats.passedCount}
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
              verified
            </span>
          </div>
        </Card>

        {/* Revisions Needed */}
        <Card className="p-4 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Needs Revision
            </span>
            <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {studentStats.needsRevisionCount}
            </span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80">
              action required
            </span>
          </div>
        </Card>

        {/* Average Score */}
        <Card className="p-4 bg-card/60 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Average Score
            </span>
            <Award className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {studentStats.averageScore > 0 ? `${studentStats.averageScore} / 60` : "N/A"}
            </span>
            <span className="text-xs text-muted-foreground">overall</span>
          </div>
        </Card>
      </div>
    )
  }

  // Instructor Stats
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
      {/* Total Submissions Queue */}
      <Card className="p-4 bg-card/60 backdrop-blur-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Total Submissions
          </span>
          <Layers className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">{instructorStats.totalSubmissions}</span>
          <span className="text-xs text-muted-foreground">all batches</span>
        </div>
      </Card>

      {/* Pending Reviews */}
      <Card className="p-4 bg-amber-500/5 border-amber-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
            Pending Review
          </span>
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {instructorStats.pendingReviewCount}
          </span>
          <span className="text-xs text-amber-600/80 dark:text-amber-400/80">
            waiting
          </span>
        </div>
      </Card>

      {/* In Review */}
      <Card className="p-4 bg-blue-500/5 border-blue-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
            In Progress
          </span>
          <FileCode2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {instructorStats.inReviewCount}
          </span>
          <span className="text-xs text-blue-600/80 dark:text-blue-400/80">
            open
          </span>
        </div>
      </Card>

      {/* Pass Rate */}
      <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
            Pass Rate
          </span>
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {instructorStats.passRatePercentage}%
          </span>
          <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
            evaluated
          </span>
        </div>
      </Card>

      {/* Average Score Awarded */}
      <Card className="p-4 bg-card/60 backdrop-blur-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Avg Score Awarded
          </span>
          <Award className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {instructorStats.averageScore} / 60
          </span>
          <span className="text-xs text-muted-foreground">mean</span>
        </div>
      </Card>
    </div>
  )
}
