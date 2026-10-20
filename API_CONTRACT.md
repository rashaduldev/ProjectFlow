# Production Full-Stack Project Submission Dashboard — Backend API Contract

This document specifies the RESTful API contract for the **Express.js + TypeScript + Prisma + PostgreSQL** backend.
The Next.js App Router frontend integrates with these exact endpoints.

## 1. Environment & Global Configuration

- **Base URL Variable**: `NEXT_PUBLIC_API_URL` in `.env.local`
- **Default Base URL**: `http://localhost:5000/api`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <jwt_token>` (for token-based requests)
- **Cookie Authentication**:
  - Frontend requests configure `credentials: "include"`.
  - Backend may set secure, `HttpOnly`, `SameSite=Strict/Lax` JWT session cookies (`jwt` or `token`).
  - CORS must configure `credentials: true` and `origin: "http://localhost:3000"`.

---

## 2. Authentication Endpoints

### Student Registration
- **Route**: `POST /auth/signup` (Alias: `POST /auth/register`)
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Tanvir Ahmed",
  "email": "tanvir@example.com",
  "password": "Password123!",
  "role": "STUDENT"
}
```
*Note*: Self-registration is restricted to students. Mentor accounts must not be self-registered.
- **Success Response** (`201 Created`):
```json
{
  "user": {
    "id": "usr_student_101",
    "name": "Tanvir Ahmed",
    "email": "tanvir@example.com",
    "role": "STUDENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (invalid email, password < 6 characters).
  - `409 Conflict`: Email already registered.

---

### User Login
- **Route**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "student@example.com",
  "password": "Password123!"
}
```
- **Success Response** (`200 OK`):
```json
{
  "user": {
    "id": "usr_student_101",
    "name": "Tanvir Ahmed",
    "email": "student@example.com",
    "role": "STUDENT" // or "MENTOR"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid credentials.

---

### Current Session Profile
- **Route**: `GET /auth/me`
- **Access**: Protected (`STUDENT` or `MENTOR`)
- **Success Response** (`200 OK`):
```json
{
  "user": {
    "id": "usr_student_101",
    "name": "Tanvir Ahmed",
    "email": "student@example.com",
    "role": "STUDENT"
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid session/token.

---

## 3. Student Submissions Endpoints

### Create Project Submission
- **Route**: `POST /submissions`
- **Access**: Protected (`STUDENT` only)
- **Request Body**:
```json
{
  "projectName": "CareerHub Job Portal",
  "githubUrl": "https://github.com/student/careerhub",
  "liveUrl": "https://careerhub.vercel.app",
  "description": "Fullstack job application tracker with role-based dashboards and filterable listings."
}
```
- **Success Response** (`201 Created`):
```json
{
  "id": "sub_501",
  "projectName": "CareerHub Job Portal",
  "githubUrl": "https://github.com/student/careerhub",
  "liveUrl": "https://careerhub.vercel.app",
  "description": "Fullstack job application tracker...",
  "status": "PENDING",
  "studentId": "usr_student_101",
  "studentName": "Tanvir Ahmed",
  "studentEmail": "student@example.com",
  "createdAt": "2026-10-20T12:00:00.000Z",
  "updatedAt": "2026-10-20T12:00:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing or invalid field syntax.
  - `409 Conflict`: Duplicate submission already pending for this project name or repository.

---

### Get Student's Own Submissions
- **Route**: `GET /submissions/my` (Alias: `GET /submissions/my-submissions`)
- **Access**: Protected (`STUDENT` only)
- **Success Response** (`200 OK`):
```json
[
  {
    "id": "sub_501",
    "projectName": "CareerHub Job Portal",
    "githubUrl": "https://github.com/student/careerhub",
    "liveUrl": "https://careerhub.vercel.app",
    "description": "Fullstack job application tracker...",
    "status": "PENDING", // "PENDING" | "APPROVED" | "REJECTED"
    "mentorFeedback": null,
    "createdAt": "2026-10-20T12:00:00.000Z",
    "updatedAt": "2026-10-20T12:00:00.000Z"
  }
]
```

---

## 4. Mentor Submissions Endpoints

### Aggregated Metrics
- **Route**: `GET /mentor/stats` (Alias: `GET /submissions/stats`)
- **Access**: Protected (`MENTOR` only)
- **Success Response** (`200 OK`):
```json
{
  "totalPending": 14,
  "totalApproved": 52,
  "totalRejected": 9,
  "totalSubmissions": 75
}
```

---

### Paginated Submissions with Server-Side Filtering
- **Route**: `GET /mentor/submissions` (Alias: `GET /submissions`)
- **Access**: Protected (`MENTOR` only)
- **Query Parameters**:
  - `page` (number, default: `1`): Current page index
  - `limit` (number, default: `10`): Items per page
  - `status` (string, optional): `"APPROVED"`, `"REJECTED"`, or `"PENDING"`
  - `search` (string, optional): Search keyword
- **Success Response** (`200 OK`):
```json
{
  "data": [
    {
      "id": "sub_501",
      "projectName": "CareerHub Job Portal",
      "githubUrl": "https://github.com/student/careerhub",
      "liveUrl": "https://careerhub.vercel.app",
      "description": "Fullstack job application tracker...",
      "status": "PENDING",
      "studentId": "usr_student_101",
      "studentName": "Tanvir Ahmed",
      "studentEmail": "student@example.com",
      "mentorFeedback": null,
      "reviewedBy": null,
      "reviewedAt": null,
      "createdAt": "2026-10-20T12:00:00.000Z",
      "updatedAt": "2026-10-20T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 75,
    "page": 1,
    "limit": 10,
    "totalPages": 8
  }
}
```

---

### Approve or Reject Submission
- **Route**: `PATCH /mentor/submissions/:id/status` (Alias: `PATCH /submissions/:id/status`)
- **Access**: Protected (`MENTOR` only)
- **Request Body**:
```json
{
  "status": "APPROVED", // "APPROVED" | "REJECTED"
  "feedback": "Clean repository structure and all requirements met!"
}
```
- **Success Response** (`200 OK`):
```json
{
  "id": "sub_501",
  "projectName": "CareerHub Job Portal",
  "status": "APPROVED",
  "mentorFeedback": "Clean repository structure and all requirements met!",
  "reviewedAt": "2026-10-20T13:30:00.000Z",
  "reviewedBy": "Nayeem Chowdhury",
  "updatedAt": "2026-10-20T13:30:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid status value.
  - `403 Forbidden`: User is not authorized as a mentor.
  - `404 Not Found`: Submission with `:id` not found.
