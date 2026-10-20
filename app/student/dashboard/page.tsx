import { StudentSubmissionsView } from "@/components/student/student-submissions-view"
import { AuthenticatedLayout } from "@/components/navigation/authenticated-layout"
import { ProtectedRoute } from "@/components/navigation/protected-route"

export default function StudentDashboardPage() {
  return <ProtectedRoute role="STUDENT"><AuthenticatedLayout><StudentSubmissionsView section="dashboard" /></AuthenticatedLayout></ProtectedRoute>
}
