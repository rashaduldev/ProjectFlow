"use client"

import * as React from "react"
import { AssignmentCards } from "./assignment-cards"
import { StudentSubmissionList } from "./student-submission-list"
import { StatsOverview } from "../stats-overview"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Sparkles } from "lucide-react"

export function StudentDashboard() {
  const [activeTab, setActiveTab] = React.useState("assignments")

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-border bg-linear-to-r from-primary/10 via-card to-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Welcome back, Tanvir! 👋
              </h2>
              <span className="text-xs bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full">
                Batch 10
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Track your course assignment milestones, submit project repositories with live deployment URLs, and review detailed rubric scores and instructor feedback.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-background/80 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span>Pass benchmark: <strong>50 / 60 marks</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <StatsOverview />

      {/* Main Tabbed Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-2">
          <TabsTrigger value="assignments">
            Available Assignments
          </TabsTrigger>
          <TabsTrigger value="history">
            My Submissions & Grades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <AssignmentCards />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <StudentSubmissionList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
