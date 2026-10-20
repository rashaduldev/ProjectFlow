"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDashboard } from "@/context/dashboard-context"
import { SubmissionStatus } from "@/types/dashboard"
import { cn } from "@/lib/utils"

export function QueueFilterBar() {
  const { filters, setFilters, assignments } = useDashboard()

  const statusOptions: { label: string; value: "all" | SubmissionStatus }[] = [
    { label: "All Submissions", value: "all" },
    { label: "Pending Review", value: "pending" },
    { label: "In Review", value: "in_review" },
    { label: "Needs Revision", value: "needs_revision" },
    { label: "Passed", value: "passed" },
  ]

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by student name, ID, or assignment..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            className="pl-9 text-xs"
          />
        </div>

        {/* Assignment filter dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={filters.assignmentId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, assignmentId: e.target.value }))
            }
            className="h-9 rounded-md border border-input bg-transparent px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Filter by Assignment"
          >
            <option value="all">All Assignments</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title.split("-")[0].trim()} ({a.milestone.split(":")[0].trim()})
              </option>
            ))}
          </select>

          {/* Sort order */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                sortBy: e.target.value as typeof filters.sortBy,
              }))
            }
            className="h-9 rounded-md border border-input bg-transparent px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Sort Order"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First (Queue FIFO)</option>
            <option value="score_desc">Highest Score</option>
            <option value="score_asc">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        <span className="text-[11px] font-medium text-muted-foreground mr-1">
          Status:
        </span>
        {statusOptions.map((opt) => {
          const isActive = filters.status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setFilters((f) => ({ ...f, status: opt.value }))
              }
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
