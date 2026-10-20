import { DashboardProvider } from "@/context/dashboard-context"
import { DashboardView } from "@/components/dashboard/dashboard-view"

export const metadata = {
  title: "Project Submission & Review Dashboard | Programming Hero",
  description:
    "Standardized project submission, rubric grading, and feedback system for Programming Hero students and web instructors.",
}

export default function Page() {
  return (
    <DashboardProvider>
      <DashboardView />
    </DashboardProvider>
  )
}
