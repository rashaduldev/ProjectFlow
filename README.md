# Programming Hero Project Review Dashboard

An App Router dashboard with separate student and mentor areas, student signup, login, and a mock mode for local UI review.

## Routes

- `/login` and `/signup` are public authentication pages. Public signup creates student accounts only.
- `/student/dashboard`, `/student/submissions/new`, and `/student/submissions` require a student session.
- `/mentor/dashboard` and `/mentor/submissions` require a mentor session.
- `/` sends signed-in users to their role dashboard and signed-out users to `/login`.

Route guards improve navigation, but the Express API must independently validate the session, role, and resource ownership on every protected request.

## Authentication and API configuration

The Express contract in `API_CONTRACT.md` returns a JWT in the login/register response and expects `Authorization: Bearer <token>` on protected requests. This frontend uses same-origin Next.js route handlers as a backend-for-frontend adapter: handlers keep that JWT in an HttpOnly cookie and attach the bearer header when forwarding requests. The browser never receives or stores the JWT. `/auth/me` is called on load to verify the session; decoding a JWT or trusting a browser-supplied role is not used for authentication.

Set `API_URL` on the Next.js server to the Express API base URL, for example `http://localhost:5000/api`; `.env.example` documents both `API_URL` and the compatibility fallback `NEXT_PUBLIC_API_URL`. `API_URL` is preferred and server-only. The session cookie uses `SameSite=Lax`, `HttpOnly`, and `Secure` in production, with an eight-hour lifetime. Serve the app over HTTPS in production.

Because the browser talks only to the Next.js origin, Express CORS does not need to allow the browser origin for this flow; the Next.js server calls Express server-to-server. If the frontend is changed to call Express directly, configure Express CORS for the exact frontend origin with credentials enabled, allow the `Authorization` and `Content-Type` headers, and do not use a wildcard origin with credentials. The backend contract currently does not issue cookies; the Next.js adapter is the component that creates the browser session cookie.

The backend must return `{ user, token }` from `POST /auth/login` and `POST /auth/register`, and `{ user }` from `GET /auth/me`. Register receives a server-enforced `role: "STUDENT"`; mentor accounts must be provisioned through a trusted backend/admin process.

The default demo mode is a clearly labeled local simulator. Demo sessions do not persist across reloads and must not be used as production authentication. Choose Live Express API in the app to use the configured backend.
