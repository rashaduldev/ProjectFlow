"use client"

import * as React from "react"
import { StatsOverview } from "../stats-overview"
import { QueueFilterBar } from "./queue-filter-bar"
import { SubmissionTable } from "./submission-table"
import { CheckCircle2 } from "lucide-react"

export function InstructorDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Instructor Evaluation Desk 📋
              </h2>
              <span className="text-xs bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full">
                Associate Web Instructor
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Inspect student project repositories, verify live deployment links, assess submissions against standardized rubric criteria, and deliver high-impact feedback.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-background/80 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Rubric Standard: <strong>60 Marks Total</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <StatsOverview />

      {/* Search & Filters */}
      <QueueFilterBar />

      {/* Evaluation Queue Table */}
      <SubmissionTable />
    </div>
  )
}
