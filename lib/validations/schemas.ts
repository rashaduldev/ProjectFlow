import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(50, "Full name cannot exceed 50 characters."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const submissionSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters.")
    .max(80, "Project name cannot exceed 80 characters."),
  githubUrl: z
    .string()
    .trim()
    .min(1, "GitHub repository URL is required.")
    .max(2048, "GitHub URL cannot exceed 2,048 characters.")
    .url("Must be a valid URL (e.g., https://github.com/user/repo).")
    .refine((url) => {
      try {
        const parsed = new URL(url)
        const hostname = parsed.hostname.toLowerCase()
        return (
          (parsed.protocol === "http:" || parsed.protocol === "https:") &&
          (hostname === "github.com" || hostname.endsWith(".github.com"))
        )
      } catch {
        return false
      }
    }, "Must be a valid GitHub repository URL ending with github.com"),
  liveUrl: z
    .string()
    .trim()
    .min(1, "Live project URL is required.")
    .max(2048, "Live URL cannot exceed 2,048 characters.")
    .url("Must be a valid URL (e.g., https://my-app.vercel.app).")
    .refine((url) => {
      try {
        const parsed = new URL(url)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
      } catch {
        return false
      }
    }, "Live URL must use http:// or https:// protocol"),
  description: z
    .string()
    .trim()
    .min(15, "Please provide a descriptive summary of your project (at least 15 characters).")
    .max(1000, "Description cannot exceed 1000 characters."),
})

export type SubmissionFormValues = z.infer<typeof submissionSchema>

