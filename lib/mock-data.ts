import { Assignment, Submission } from "@/types/dashboard"

export const CURRENT_STUDENT = {
  id: "PH-B10-042",
  name: "Tanvir Ahmed",
  email: "tanvir.hero10@ph-community.dev",
  batch: "Batch 10 - Web Development",
  avatar: "TA",
}

export const CURRENT_EVALUATOR = {
  id: "INS-08",
  name: "Engr. Nayeem Chowdhury",
  role: "Senior Associate Web Instructor",
  email: "nayeem.instruct@programming-hero.com",
}

export const ASSIGNMENTS: Assignment[] = [
  {
    id: "assign-10",
    title: "CareerHub - Smart Job Application & Tracking Portal",
    milestone: "Milestone 10: Next.js & Modern Web Architectures",
    track: "Fullstack Web Track",
    totalMarks: 60,
    passingMarks: 50,
    deadline: "2026-10-25T23:59:59Z",
    description:
      "Build a modern job seeking and employer application portal. Features include role-based authentication, interactive job search with salary filters, applicant submission tracking, and real-time dashboard analytics.",
    requirements: [
      "Responsive design on mobile (320px+), tablet, and desktop.",
      "JWT-based or Auth.js authentication with role-protected routes.",
      "Live job application pipeline with status updates (Applied, Shortlisted, Rejected).",
      "Comprehensive README.md with live link, features, credentials, and run instructions.",
      "At least 15 meaningful Git commits with conventional commit messages.",
    ],
    recommendedRubric: [
      {
        criteria: "Architecture & Code Quality",
        maxMarks: 15,
        description: "Modular components, clean custom hooks, proper TypeScript interfaces, and separation of concerns.",
      },
      {
        criteria: "Core Feature Completeness",
        maxMarks: 20,
        description: "Search, filter, role-based application management, and protected dashboard routing.",
      },
      {
        criteria: "UI/UX & Responsiveness",
        maxMarks: 15,
        description: "Accessible WCAG-compliant design, Tailwind polish, dark mode consistency, smooth loading states.",
      },
      {
        criteria: "Git Hygiene & Documentation",
        maxMarks: 10,
        description: "Professional commit history, detailed README with test credentials, and zero console errors in production.",
      },
    ],
  },
  {
    id: "assign-11",
    title: "BookNest - Library Management & Book Borrowing System",
    milestone: "Milestone 11: MERN Architecture & Secure Rest APIs",
    track: "MERN Stack Track",
    totalMarks: 60,
    passingMarks: 50,
    deadline: "2026-10-28T23:59:59Z",
    description:
      "A complete library inventory management system where members can browse books, check availability, borrow within return deadlines, and leave verified reader reviews.",
    requirements: [
      "Secured API endpoints with token verification.",
      "Book borrowing system with quantity decrement logic and overdue calculations.",
      "Category filtering, pagination, and search by ISBN or author.",
      "Interactive reader rating and review modal.",
    ],
    recommendedRubric: [
      {
        criteria: "Architecture & Code Quality",
        maxMarks: 15,
        description: "Clean API integration, error boundaries, proper state management.",
      },
      {
        criteria: "Core Feature Completeness",
        maxMarks: 20,
        description: "Borrowing flow, inventory quantity sync, user book return dashboard.",
      },
      {
        criteria: "UI/UX & Responsiveness",
        maxMarks: 15,
        description: "Clean book showcase, responsive mobile layout, intuitive modals.",
      },
      {
        criteria: "Git Hygiene & Documentation",
        maxMarks: 10,
        description: "Backend & frontend repos properly linked, clear deployment steps.",
      },
    ],
  },
  {
    id: "assign-12",
    title: "GadgetVibe - Tech Gadgets E-commerce Marketplace",
    milestone: "Milestone 12: State Management & Stripe Checkout",
    track: "Frontend Advanced Track",
    totalMarks: 60,
    passingMarks: 50,
    deadline: "2026-11-02T23:59:59Z",
    description:
      "Interactive modern e-commerce storefront with cart persistence, multi-criteria filtering, wishlist, and simulated checkout flow with receipt generation.",
    requirements: [
      "Cart state synced with LocalStorage or backend cart API.",
      "Price range slider, brand checkboxes, and instant search.",
      "Order summary, checkout form validation, and fake payment processing.",
    ],
    recommendedRubric: [
      {
        criteria: "Architecture & Code Quality",
        maxMarks: 15,
        description: "Optimized component re-renders, reusable custom hooks.",
      },
      {
        criteria: "Core Feature Completeness",
        maxMarks: 20,
        description: "Cart calculations, discounts, checkout validation, order confirmation.",
      },
      {
        criteria: "UI/UX & Responsiveness",
        maxMarks: 15,
        description: "Modern product cards, sticky cart drawer, accessible notifications.",
      },
      {
        criteria: "Git Hygiene & Documentation",
        maxMarks: 10,
        description: "README explaining state architecture and setup instructions.",
      },
    ],
  },
]

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: "sub-101",
    assignmentId: "assign-10",
    assignmentTitle: "CareerHub - Smart Job Application & Tracking Portal",
    milestone: "Milestone 10",
    studentId: "PH-B10-042",
    studentName: "Tanvir Ahmed",
    studentEmail: "tanvir.hero10@ph-community.dev",
    submittedAt: "2026-10-18T14:30:00Z",
    updatedAt: "2026-10-18T14:30:00Z",
    liveUrl: "https://careerhub-portal-demo.vercel.app",
    githubClientUrl: "https://github.com/tanvir-ahmed-dev/careerhub-client",
    githubServerUrl: "https://github.com/tanvir-ahmed-dev/careerhub-server",
    videoDemoUrl: "https://loom.com/share/careerhub-walkthrough-demo",
    studentNotes:
      "Implemented role switcher (Applicant vs Employer). Added salary range slider with debounce and dark mode support using Tailwind CSS v4.",
    checklistCompleted: {
      publicRepo: true,
      readmeProvided: true,
      liveLinkActive: true,
      credentialsInReadme: true,
    },
    status: "passed",
    revisionCount: 0,
    evaluation: {
      evaluatorId: "INS-08",
      evaluatorName: "Engr. Nayeem Chowdhury",
      evaluatedAt: "2026-10-19T10:15:00Z",
      totalScore: 56,
      maxPossibleScore: 60,
      status: "passed",
      generalFeedback:
        "Outstanding submission, Tanvir! Your component architecture is very clean, and the state management for job filters is properly debounced. Minor visual polish recommended on mobile screen sizes below 360px.",
      strengths: [
        "Well-structured custom hooks for authentication and application status.",
        "Comprehensive README with test credentials for both applicant and employer roles.",
        "28 clear, atomic commits following standard Git commit conventions.",
      ],
      improvements: [
        "Consider wrapping table views with horizontal scroll containers for 320px screens.",
        "Add an error boundary around chart analytics to prevent whole-page crashes if data fails.",
      ],
      rubricScores: [
        {
          id: "r1",
          criteria: "Architecture & Code Quality",
          maxMarks: 15,
          score: 14,
          feedback: "Great separation between API layers and UI components.",
        },
        {
          id: "r2",
          criteria: "Core Feature Completeness",
          maxMarks: 20,
          score: 19,
          feedback: "All required user flows implemented smoothly with role-based guards.",
        },
        {
          id: "r3",
          criteria: "UI/UX & Responsiveness",
          maxMarks: 15,
          score: 14,
          feedback: "Aesthetic UI with subtle micro-interactions; minor padding overflow on 320px viewport.",
        },
        {
          id: "r4",
          criteria: "Git Hygiene & Documentation",
          maxMarks: 10,
          score: 9,
          feedback: "Excellent README and clean repository structure.",
        },
      ],
    },
    history: [
      {
        timestamp: "2026-10-18T14:30:00Z",
        status: "pending",
        note: "Initial submission by student.",
        githubClientUrl: "https://github.com/tanvir-ahmed-dev/careerhub-client",
        liveUrl: "https://careerhub-portal-demo.vercel.app",
      },
      {
        timestamp: "2026-10-19T10:15:00Z",
        status: "passed",
        note: "Evaluated by Engr. Nayeem Chowdhury (Score: 56/60 - Passed)",
        githubClientUrl: "https://github.com/tanvir-ahmed-dev/careerhub-client",
        liveUrl: "https://careerhub-portal-demo.vercel.app",
      },
    ],
  },
  {
    id: "sub-102",
    assignmentId: "assign-11",
    assignmentTitle: "BookNest - Library Management & Book Borrowing System",
    milestone: "Milestone 11",
    studentId: "PH-B10-089",
    studentName: "Sumaiya Rahman",
    studentEmail: "sumaiya.ph10@example.com",
    submittedAt: "2026-10-19T18:20:00Z",
    updatedAt: "2026-10-19T18:20:00Z",
    liveUrl: "https://booknest-ph-assignment.web.app",
    githubClientUrl: "https://github.com/sumaiya-dev/booknest-client",
    githubServerUrl: "https://github.com/sumaiya-dev/booknest-server",
    videoDemoUrl: "",
    studentNotes: "Added custom modal for return date selection and book categorization.",
    checklistCompleted: {
      publicRepo: true,
      readmeProvided: true,
      liveLinkActive: true,
      credentialsInReadme: false,
    },
    status: "in_review",
    revisionCount: 0,
    history: [
      {
        timestamp: "2026-10-19T18:20:00Z",
        status: "pending",
        note: "Initial submission by student.",
        githubClientUrl: "https://github.com/sumaiya-dev/booknest-client",
        liveUrl: "https://booknest-ph-assignment.web.app",
      },
      {
        timestamp: "2026-10-20T09:00:00Z",
        status: "in_review",
        note: "Review assigned and opened by Evaluator.",
        githubClientUrl: "https://github.com/sumaiya-dev/booknest-client",
        liveUrl: "https://booknest-ph-assignment.web.app",
      },
    ],
  },
  {
    id: "sub-103",
    assignmentId: "assign-12",
    assignmentTitle: "GadgetVibe - Tech Gadgets E-commerce Marketplace",
    milestone: "Milestone 12",
    studentId: "PH-B10-112",
    studentName: "Farhan Kabir",
    studentEmail: "farhan.kabir@example.com",
    submittedAt: "2026-10-20T11:45:00Z",
    updatedAt: "2026-10-20T11:45:00Z",
    liveUrl: "https://gadgetvibe-storefront.netlify.app",
    githubClientUrl: "https://github.com/farhankabir/gadgetvibe-react",
    studentNotes: "Cart functionality works with local storage. Filter by price slider is integrated.",
    checklistCompleted: {
      publicRepo: true,
      readmeProvided: true,
      liveLinkActive: true,
      credentialsInReadme: true,
    },
    status: "pending",
    revisionCount: 0,
    history: [
      {
        timestamp: "2026-10-20T11:45:00Z",
        status: "pending",
        note: "Initial submission received in evaluation queue.",
        githubClientUrl: "https://github.com/farhankabir/gadgetvibe-react",
        liveUrl: "https://gadgetvibe-storefront.netlify.app",
      },
    ],
  },
  {
    id: "sub-104",
    assignmentId: "assign-11",
    assignmentTitle: "BookNest - Library Management & Book Borrowing System",
    milestone: "Milestone 11",
    studentId: "PH-B10-042",
    studentName: "Tanvir Ahmed",
    studentEmail: "tanvir.hero10@ph-community.dev",
    submittedAt: "2026-10-16T10:00:00Z",
    updatedAt: "2026-10-17T16:00:00Z",
    liveUrl: "https://booknest-tanvir.surge.sh",
    githubClientUrl: "https://github.com/tanvir-ahmed-dev/booknest-library",
    studentNotes: "Submitted for Milestone 11 evaluation.",
    checklistCompleted: {
      publicRepo: true,
      readmeProvided: false,
      liveLinkActive: true,
      credentialsInReadme: false,
    },
    status: "needs_revision",
    revisionCount: 1,
    evaluation: {
      evaluatorId: "INS-08",
      evaluatorName: "Engr. Nayeem Chowdhury",
      evaluatedAt: "2026-10-17T16:00:00Z",
      totalScore: 38,
      maxPossibleScore: 60,
      status: "needs_revision",
      generalFeedback:
        "The live link works on direct landing, but refreshing on any internal route (e.g. /books/:id) throws a 404 error because SPA redirect routing rules (200.html or _redirects) are missing. Also, the README lacks test credentials.",
      strengths: [
        "Good visual design on the book carousel.",
        "Borrow button correctly updates quantity on client state.",
      ],
      improvements: [
        "Fix SPA reload 404 issue on Surge / hosting provider.",
        "Add a comprehensive README.md with test admin credentials.",
        "Prevent users from borrowing the same book twice if already borrowed.",
      ],
      rubricScores: [
        {
          id: "r1",
          criteria: "Architecture & Code Quality",
          maxMarks: 15,
          score: 10,
          feedback: "Good component separation, but API error states are unhandled in UI.",
        },
        {
          id: "r2",
          criteria: "Core Feature Completeness",
          maxMarks: 20,
          score: 13,
          feedback: "Route refreshing breaks with 404; duplicate borrow checks missing.",
        },
        {
          id: "r3",
          criteria: "UI/UX & Responsiveness",
          maxMarks: 15,
          score: 11,
          feedback: "Card grid collapses abruptly on mobile tablets.",
        },
        {
          id: "r4",
          criteria: "Git Hygiene & Documentation",
          maxMarks: 10,
          score: 4,
          feedback: "README is default create-react-app template with no project documentation.",
        },
      ],
    },
    history: [
      {
        timestamp: "2026-10-16T10:00:00Z",
        status: "pending",
        note: "Initial submission by student.",
        githubClientUrl: "https://github.com/tanvir-ahmed-dev/booknest-library",
        liveUrl: "https://booknest-tanvir.surge.sh",
      },
      {
        timestamp: "2026-10-17T16:00:00Z",
        status: "needs_revision",
        note: "Evaluated with score 38/60. Revision requested for SPA routing & README.",
        githubClientUrl: "https://github.com/tanvir-ahmed-dev/booknest-library",
        liveUrl: "https://booknest-tanvir.surge.sh",
      },
    ],
  },
]

export const INSTRUCTOR_FEEDBACK_PRESETS = {
  strengths: [
    "Clean component modularity and well-structured custom hooks.",
    "Responsive layout tested and verified smoothly on mobile (320px+).",
    "Comprehensive README with clear feature list and test credentials.",
    "Meaningful Git commit history with conventional commit messages.",
    "Graceful handling of loading spinners, skeletons, and empty states.",
    "Secure environment variable handling with no exposed secrets.",
  ],
  improvements: [
    "Fix mobile overflow issues on viewports narrower than 375px.",
    "SPA routing produces 404 on page reload — add rewrite configuration.",
    "Add toast notifications or inline feedback for failed network requests.",
    "Improve Git commit cadence; avoid single bulk 'final commit' submissions.",
    "Implement field-level form validation before triggering network calls.",
    "Include sample login credentials clearly at the top of the README.md.",
  ],
}

