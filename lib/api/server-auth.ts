import "server-only"

import { cookies } from "next/headers"

export const SESSION_COOKIE = "ph_session"
const API_BASE_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "")

export async function backendAuth(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  })
}

export async function setSession(token: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  })
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE)
}

export function jsonError(message: string, status: number) {
  return Response.json({ message }, { status })
}
