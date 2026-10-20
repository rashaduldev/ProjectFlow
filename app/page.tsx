import { AuthProvider } from "@/context/auth-context"
import { MainDashboard } from "@/components/navigation/main-dashboard"

export const metadata = {
  title: "Project Submission and Review Dashboard | Programming Hero",
  description:
    "Engineering assessment dashboard for students and mentors with authentication, project submission, duplicate protection, and server-side filtering.",
}

export default function Page() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  )
}
