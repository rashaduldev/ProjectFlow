import { backendAuth, getSessionToken, jsonError } from "@/lib/api/server-auth"

export async function GET() {
  const token = await getSessionToken()
  if (!token) return jsonError("Sign in to continue.", 401)

  let upstream: Response
  try {
    upstream = await backendAuth("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    return jsonError("Authentication service is unavailable. Check the configured Express API.", 503)
  }
  const body = await upstream.json().catch(() => ({ message: "Unable to verify session." }))
  return Response.json(body, { status: upstream.status })
}
