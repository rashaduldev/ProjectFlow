"use client"

import * as React from "react"
import { ExternalLink, Copy, Check, Video, Globe } from "lucide-react"
import { GithubIcon } from "@/components/ui/icons"
import { validateSafeUrl } from "@/lib/url-validator"
import { cn } from "@/lib/utils"

interface SafeExternalLinkProps {
  url: string
  label: string
  type?: "live" | "github" | "video" | "generic"
  className?: string
  showCopy?: boolean
}

export function SafeExternalLink({
  url,
  label,
  type = "generic",
  className,
  showCopy = true,
}: SafeExternalLinkProps) {
  const [copied, setCopied] = React.useState(false)
  const validation = validateSafeUrl(url)

  if (!validation.isValid || !validation.sanitizedUrl) {
    return (
      <span className="text-xs text-muted-foreground italic">
        Invalid link provided
      </span>
    )
  }

  const cleanUrl = validation.sanitizedUrl

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(cleanUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderIcon = () => {
    switch (type) {
      case "github":
        return <GithubIcon className="h-3.5 w-3.5" />
      case "video":
        return <Video className="h-3.5 w-3.5" />
      case "live":
        return <Globe className="h-3.5 w-3.5" />
      default:
        return <ExternalLink className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <a
        href={cleanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
        title={`Open ${cleanUrl} in new tab`}
      >
        {renderIcon()}
        <span>{label}</span>
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Copy URL to clipboard"
          aria-label={`Copy ${label} URL`}
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  )
}
