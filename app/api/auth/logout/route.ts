import { clearSession } from "@/lib/api/server-auth"

export async function POST() {
  await clearSession()
  return Response.json({ success: true })
}
