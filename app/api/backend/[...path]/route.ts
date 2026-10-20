import { backendAuth, getSessionToken, jsonError } from "@/lib/api/server-auth"

type RouteContext = { params: Promise<{ path: string[] }> }

async function proxy(request: Request, context: RouteContext) {
  const url = new URL(request.url)
  const origin = request.headers.get("origin")
  if (origin && origin !== url.origin) return jsonError("Invalid request origin.", 403)

  const { path } = await context.params
  if (path.length === 0 || path[0] !== "submissions" || path.some((part) => part === "..")) {
    return jsonError("Unknown API route.", 404)
  }

  const token = await getSessionToken()
  if (!token) return jsonError("Sign in to continue.", 401)

  let upstream: Response
  try {
    upstream = await backendAuth(`/${path.map(encodeURIComponent).join("/")}${url.search}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}` },
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    })
  } catch {
    return jsonError("The configured Express API is unavailable.", 503)
  }

  const responseHeaders = new Headers()
  const contentType = upstream.headers.get("content-type")
  if (contentType) responseHeaders.set("content-type", contentType)
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}

export const GET = proxy
export const POST = proxy
export const PATCH = proxy
export const DELETE = proxy
