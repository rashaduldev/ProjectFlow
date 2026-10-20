# Express.js + Prisma Backend API Contract

This document defines the RESTful API contract for the Project Submission and Review Dashboard.
The frontend integrates directly with these endpoints.

## Base Configuration
- **Base URL**: `process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer token sent in `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints

### Register User
- **Method**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Tanvir Ahmed",
  "email": "tanvir@example.com",
  "password": "Password123!",
  "role": "STUDENT" // "STUDENT" | "MENTOR"
}
```
- **Success Response** (`201 Created`):
```json
{
  "user": {
    "id": "usr_101",
    "name": "Tanvir Ahmed",
    "email": "tanvir@example.com",
    "role": "STUDENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (invalid email, weak password, missing fields).
  - `409 Conflict`: User with email already exists.

---

### Login User
- **Method**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "tanvir@example.com",
  "password": "Password123!"
}
```
- **Success Response** (`200 OK`):
```json
{
  "user": {
    "id": "usr_101",
    "name": "Tanvir Ahmed",
    "email": "tanvir@example.com",
    "role": "STUDENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid credentials.

---

### Get Authenticated User Profile
- **Method**: `GET /auth/me`
- **Access**: Protected (`STUDENT` or `MENTOR`)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response** (`200 OK`):
```json
{
  "user": {
    "id": "usr_101",
    "name": "Tanvir Ahmed",
    "email": "tanvir@example.com",
    "role": "STUDENT"
  }
}
```

---

## 2. Student Submissions Endpoints

### Submit Project
- **Method**: `POST /submissions`
- **Access**: Protected (`STUDENT` only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "projectName": "CareerHub Job Portal",
  "githubUrl": "https://github.com/student/careerhub",
  "liveUrl": "https://careerhub.vercel.app",
  "description": "Full-stack job application tracker with role-based auth and filterable listings."
}
```
- **Success Response** (`201 Created`):
```json
{
  "id": "sub_501",
  "projectName": "CareerHub Job Portal",
  "githubUrl": "https://github.com/student/careerhub",
  "liveUrl": "https://careerhub.vercel.app",
  "description": "Full-stack job application tracker with role-based auth and filterable listings.",
  "status": "PENDING",
  "studentId": "usr_101",
  "studentName": "Tanvir Ahmed",
  "studentEmail": "tanvir@example.com",
  "createdAt": "2026-10-20T12:00:00.000Z",
  "updatedAt": "2026-10-20T12:00:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (malformed URL, empty description).
  - `409 Conflict`: Duplicate submission ("A pending submission for this project or repository already exists.").

---

### Get Student's Own Submissions
- **Method**: `GET /submissions/my-submissions`
- **Access**: Protected (`STUDENT` only)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response** (`200 OK`):
```json
[
  {
    "id": "sub_501",
    "projectName": "CareerHub Job Portal",
    "githubUrl": "https://github.com/student/careerhub",
    "liveUrl": "https://careerhub.vercel.app",
    "description": "Full-stack job application tracker...",
    "status": "PENDING", // "PENDING" | "APPROVED" | "REJECTED"
    "mentorFeedback": null,
    "createdAt": "2026-10-20T12:00:00.000Z",
    "updatedAt": "2026-10-20T12:00:00.000Z"
  }
]
```

---

## 3. Mentor Submissions Endpoints

### Get Aggregated Statistics
- **Method**: `GET /submissions/stats`
- **Access**: Protected (`MENTOR` only)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response** (`200 OK`):
```json
{
  "totalPending": 12,
  "totalApproved": 45,
  "totalRejected": 8,
  "totalSubmissions": 65
}
```

---

### Get Paginated Submissions with Server-Side Filtering
- **Method**: `GET /submissions`
- **Access**: Protected (`MENTOR` only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional, default: `1`): Current page index
  - `limit` (optional, default: `10`): Items per page
  - `status` (optional): Filter by `"APPROVED"`, `"REJECTED"`, or `"PENDING"`
  - `search` (optional): Text search across project name or student name
- **Success Response** (`200 OK`):
```json
{
  "data": [
    {
      "id": "sub_501",
      "projectName": "CareerHub Job Portal",
      "githubUrl": "https://github.com/student/careerhub",
      "liveUrl": "https://careerhub.vercel.app",
      "description": "Full-stack job application tracker...",
      "status": "PENDING",
      "studentId": "usr_101",
      "studentName": "Tanvir Ahmed",
      "studentEmail": "tanvir@example.com",
      "mentorFeedback": null,
      "createdAt": "2026-10-20T12:00:00.000Z",
      "updatedAt": "2026-10-20T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 65,
    "page": 1,
    "limit": 10,
    "totalPages": 7
  }
}
```

---

### Approve or Reject Submission
- **Method**: `PATCH /submissions/:id/status`
- **Access**: Protected (`MENTOR` only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "status": "APPROVED", // "APPROVED" | "REJECTED"
  "feedback": "Clean repository structure and all requirements met!" // optional
}
```
- **Success Response** (`200 OK`):
```json
{
  "id": "sub_501",
  "projectName": "CareerHub Job Portal",
  "status": "APPROVED",
  "mentorFeedback": "Clean repository structure and all requirements met!",
  "reviewedAt": "2026-10-20T13:00:00.000Z",
  "reviewedBy": "Engr. Nayeem Chowdhury",
  "updatedAt": "2026-10-20T13:00:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid status value.
  - `403 Forbidden`: User is not a mentor.
  - `404 Not Found`: Submission with `:id` not found.

