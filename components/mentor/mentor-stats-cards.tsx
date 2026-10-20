"use client"

import * as React from "react"
import { SubmissionStats } from "@/types/api"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, CheckCircle2, XCircle, Layers } from "lucide-react"

interface MentorStatsCardsProps {
  stats: SubmissionStats | null
  isLoading: boolean
}

export function MentorStatsCards({ stats, isLoading }: MentorStatsCardsProps) {
  const pending = stats?.totalPending ?? 0
  const approved = stats?.totalApproved ?? 0
  const rejected = stats?.totalRejected ?? 0
  const total = stats?.totalSubmissions ?? 0

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Pending */}
      <Card className="p-4 bg-amber-500/5 border-amber-500/20 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            Total Pending
          </span>
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {isLoading ? <Skeleton className="h-8 w-12" /> : pending}
          </span>
          <span className="text-xs text-amber-600/80 dark:text-amber-400/80">
            awaiting review
          </span>
        </div>
      </Card>

      {/* 2. Total Approved */}
      <Card className="p-4 bg-emerald-500/5 border-emerald-500/20 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            Total Approved
          </span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {isLoading ? <Skeleton className="h-8 w-12" /> : approved}
          </span>
          <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
            passed
          </span>
        </div>
      </Card>

      {/* 3. Total Rejected */}
      <Card className="p-4 bg-destructive/5 border-destructive/20 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-destructive">
            Total Rejected
          </span>
          <XCircle className="h-4 w-4 text-destructive" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-destructive">
            {isLoading ? <Skeleton className="h-8 w-12" /> : rejected}
          </span>
          <span className="text-xs text-destructive/80">
            revision requested
          </span>
        </div>
      </Card>

      {/* 4. Total Submissions */}
      <Card className="p-4 bg-card shadow-xs border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            Total Submissions
          </span>
          <Layers className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {isLoading ? <Skeleton className="h-8 w-12" /> : total}
          </span>
          <span className="text-xs text-muted-foreground">
            across all batches
          </span>
        </div>
      </Card>
    </div>
  )
}

