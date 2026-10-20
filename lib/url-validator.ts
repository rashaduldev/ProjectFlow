/**
 * Security-focused URL Validation and Sanitization
 * Enforces http/https protocols and protects against javascript: / data: pseudo-protocol attacks.
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  sanitizedUrl?: string
}

export function validateSafeUrl(rawUrl: string, options?: { requireGitHub?: boolean }): ValidationResult {
  const trimmed = rawUrl.trim()

  if (!trimmed) {
    return { isValid: false, error: "URL cannot be empty." }
  }

  // Prevent prototype pollution or script execution via protocols
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return {
      isValid: false,
      error: "Security violation: Only standard HTTP and HTTPS protocols are allowed.",
    }
  }

  try {
    const parsed = new URL(trimmed)

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        error: "URL must begin with http:// or https://",
      }
    }

    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return {
        isValid: false,
        error: "URL must contain a valid domain name.",
      }
    }

    if (options?.requireGitHub) {
      const isGithub = parsed.hostname.toLowerCase().endsWith("github.com")
      if (!isGithub) {
        return {
          isValid: false,
          error: "Repository URL must be a valid github.com link.",
        }
      }
    }

    return {
      isValid: true,
      sanitizedUrl: parsed.href,
    }
  } catch {
    return {
      isValid: false,
      error: "Please enter a valid, well-formed URL (e.g., https://my-project.vercel.app)",
    }
  }
}

/**
 * Strips potentially dangerous tags or attributes from plain strings before rendering.
 */
export function sanitizeText(text: string): string {
  if (!text) return ""
  return text
    .replace(/[<>]/g, "") // basic tag stripping for text areas
    .trim()
}

