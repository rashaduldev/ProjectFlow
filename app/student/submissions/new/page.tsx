import { StudentSubmissionsView } from "@/components/student/student-submissions-view"
import { AuthenticatedLayout } from "@/components/navigation/authenticated-layout"
import { ProtectedRoute } from "@/components/navigation/protected-route"

export default function NewSubmissionPage() {
  return <ProtectedRoute role="STUDENT"><AuthenticatedLayout><StudentSubmissionsView section="new" /></AuthenticatedLayout></ProtectedRoute>
}
