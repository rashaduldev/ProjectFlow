"use client"

import * as React from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  BookOpen,
  LogOut,
  Radio,
  Server,
} from "lucide-react"

interface MentorSidebarProps {
  activeView: "queue" | "stats" | "policy"
  onViewChange: (view: "queue" | "stats" | "policy") => void
  onRefreshStats?: () => void
}

export function MentorSidebar({
  activeView,
  onViewChange,
}: MentorSidebarProps) {
  const { user, logout, quickLoginDemo, apiMode, setApiMode } = useAuth()

  return (
    <aside className="w-full lg:w-64 bg-card/80 border-b lg:border-b-0 lg:border-r border-border/80 shrink-0 flex flex-col justify-between p-4 lg:p-5 lg:min-h-[calc(100vh-4.5rem)]">
      <div className="space-y-6">
        {/* Mentor Workspace Branding */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-xs">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-xs uppercase tracking-wider block text-foreground">
              Mentor Workspace
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Academic Review Desk
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 tracking-wider">
            Navigation
          </span>

          <button
            type="button"
            onClick={() => onViewChange("queue")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeView === "queue"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Submissions Queue</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange("stats")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeView === "stats"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Statistics & Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange("policy")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeView === "policy"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Review Guidelines</span>
          </button>
        </div>

        {/* API Transport Selector */}
        <div className="rounded-lg border border-border p-3 bg-muted/20 space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Backend Integration
          </span>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setApiMode("mock")}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                apiMode === "mock"
                  ? "bg-background text-foreground font-semibold border border-border shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-emerald-500" />
              <span>Simulated Contract</span>
            </button>

            <button
              type="button"
              onClick={() => setApiMode("live")}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                apiMode === "live"
                  ? "bg-background text-foreground font-semibold border border-border shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Server className="h-3.5 w-3.5 text-blue-500" />
              <span>Live Express API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mentor Profile Footer */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || "ME"}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">{user?.name || "Mentor"}</span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {user?.email || "mentor@example.com"}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Log out"
            className="size-7 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Quick Demo Switcher */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => quickLoginDemo("STUDENT")}
          className="w-full text-xs h-7 gap-1.5 text-primary"
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Switch to Student View
        </Button>
      </div>
    </aside>
  )
}

