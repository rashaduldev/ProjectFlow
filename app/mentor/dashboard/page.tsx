"use client"

import * as React from "react"
import Link from "next/link"
import { useMentorStats } from "@/lib/hooks/use-submissions"
import { MentorStatsCards } from "@/components/mentor/mentor-stats-cards"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  RefreshCw,
  ClipboardList,
  Award,
  BookOpen,
  AlertCircle,
  ArrowRight,
  Layers,
} from "lucide-react"

export default function MentorDashboardPage() {
  const { data: stats = null, isLoading, error, refetch, isRefetching } = useMentorStats()

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Mentor Overview
            </h1>
            <Badge variant="outline" className="text-[10px]">
              Academic Desk
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time aggregated submission statistics and academic evaluation metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh Stats
          </Button>

          <Link href="/mentor/submissions">
            <Button size="sm" className="text-xs gap-1.5 h-8">
              <ClipboardList className="h-3.5 w-3.5" />
              Submissions Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold">Stats Error</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">
            {error instanceof Error ? error.message : "Failed to load aggregated statistics."}
          </AlertDescription>
        </Alert>
      )}

      {/* 4 Aggregated Statistics Cards */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
          <Layers className="h-3.5 w-3.5 text-primary" />
          Aggregated Submission Metrics
        </h2>
        <MentorStatsCards stats={stats} isLoading={isLoading} />
      </div>

      {/* Throughput Analytics & Guidelines */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Award className="h-4 w-4 text-primary" />
              Evaluation Throughput
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="rounded-lg border border-border p-3.5 bg-muted/20 space-y-1">
              <span className="font-semibold text-foreground block">Pass Rate Percentage</span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Total Evaluated: <strong>{(stats?.totalApproved ?? 0) + (stats?.totalRejected ?? 0)}</strong>. Overall approval rate is{" "}
                <strong>
                  {stats && stats.totalApproved + stats.totalRejected > 0
                    ? Math.round((stats.totalApproved / (stats.totalApproved + stats.totalRejected)) * 100)
                    : 0}
                  %
                </strong>.
              </p>
            </div>

            <div className="rounded-lg border border-border p-3.5 bg-muted/20 space-y-1">
              <span className="font-semibold text-foreground block">Queue Status</span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Currently <strong>{stats?.totalPending ?? 0} projects</strong> are waiting for evaluation. Process submissions in FIFO order to meet SLA turnaround targets.
              </p>
            </div>

            <Link href="/mentor/submissions" className="inline-block pt-1">
              <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                <span>Go to Pending Submissions Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              Evaluation Benchmark Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-foreground/90 leading-relaxed">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
              <li>Inspect repository structure, component modularity, and Git commit hygiene.</li>
              <li>Verify that live deployment links resolve and internal routes reload without 404 errors.</li>
              <li>Check README.md for project overview and sample login credentials.</li>
              <li>When rejecting, mentors must provide clear, constructive feedback on what needs to be fixed.</li>
            </ul>

            <div className="rounded-lg border border-border bg-background p-3 text-[11px] text-muted-foreground">
              Confirmation dialogs are required before changing status to prevent accidental actions.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
