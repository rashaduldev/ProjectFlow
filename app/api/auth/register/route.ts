import { backendAuth, jsonError, setSession } from "@/lib/api/server-auth"

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string
    email?: string
    password?: string
  }
  let upstream: Response
  try {
    upstream = await backendAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...body, role: "STUDENT" }),
    })
  } catch {
    return jsonError("Authentication service is unavailable. Check the configured Express API.", 503)
  }
  const result = (await upstream.json().catch(() => ({}))) as {
    user?: unknown
    token?: unknown
    message?: string
    errors?: unknown
  }

  if (!upstream.ok) {
    return Response.json(
      { message: result.message ?? "Unable to create your account.", errors: result.errors },
      { status: upstream.status }
    )
  }
  if (typeof result.token !== "string" || !result.user) {
    return jsonError("The authentication service returned an invalid response.", 502)
  }

  await setSession(result.token)
  return Response.json({ user: result.user }, { status: 201 })
}
