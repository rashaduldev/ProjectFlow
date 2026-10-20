import { MentorDashboardView } from "@/components/mentor/mentor-dashboard-view"
import { AuthenticatedLayout } from "@/components/navigation/authenticated-layout"
import { ProtectedRoute } from "@/components/navigation/protected-route"

export default function MentorDashboardPage() {
  return <ProtectedRoute role="MENTOR"><AuthenticatedLayout><MentorDashboardView /></AuthenticatedLayout></ProtectedRoute>
}
