import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(60, "Full name cannot exceed 60 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Please enter a valid email address."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long.")
      .max(100, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type SignupFormValues = z.infer<typeof signupSchema>

// Aliases for compatibility
export const registerSchema = signupSchema
export type RegisterFormValues = SignupFormValues

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
    .url("Please enter a valid URL (e.g. https://github.com/user/project).")
    .refine((url) => {
      try {
        const parsed = new URL(url)
        return (
          (parsed.protocol === "http:" || parsed.protocol === "https:") &&
          parsed.hostname.toLowerCase().endsWith("github.com")
        )
      } catch {
        return false
      }
    }, "Must be a valid GitHub repository URL (https://github.com/...)"),
  liveUrl: z
    .string()
    .trim()
    .min(1, "Live deployment URL is required.")
    .url("Please enter a valid URL (e.g. https://my-project.vercel.app).")
    .refine((url) => {
      try {
        const parsed = new URL(url)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
      } catch {
        return false
      }
    }, "Live project URL must use http:// or https://"),
  description: z
    .string()
    .trim()
    .min(15, "Project description must be at least 15 characters long.")
    .max(1500, "Description cannot exceed 1500 characters."),
})

export type SubmissionFormValues = z.infer<typeof submissionSchema>
