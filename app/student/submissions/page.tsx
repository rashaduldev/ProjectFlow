import { StudentSubmissionsView } from "@/components/student/student-submissions-view"
import { AuthenticatedLayout } from "@/components/navigation/authenticated-layout"
import { ProtectedRoute } from "@/components/navigation/protected-route"

export default function StudentSubmissionsPage() {
  return <ProtectedRoute role="STUDENT"><AuthenticatedLayout><StudentSubmissionsView section="submissions" /></AuthenticatedLayout></ProtectedRoute>
}
