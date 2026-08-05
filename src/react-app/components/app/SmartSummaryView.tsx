import { useEffect, useMemo, useState } from "react"
import { Check, Copy, FileText, RefreshCw, Sparkles } from "lucide-react"
import type { SmartSummary } from "../../lib/types"

interface Props {
  summary: SmartSummary
  isRegenerating?: boolean
  onRegenerate?: () => void
}

type CopyState = "idle" | "copied" | "error"

function formatSummaryForCopy(summary: SmartSummary) {
  const lines: string[] = []

  if (summary.title.trim()) lines.push(summary.title.trim())
  if (summary.overview.trim()) {
    if (lines.length > 0) lines.push("")
    lines.push(summary.overview.trim())
  }

  for (const section of summary.sections) {
    lines.push("", section.heading)
    for (const bullet of section.bullets) {
      lines.push(`- ${bullet}`)
    }
  }

  if (summary.keyTakeaways.length > 0) {
    lines.push("", "Key takeaways")
    for (const takeaway of summary.keyTakeaways) {
      lines.push(`- ${takeaway}`)
    }
  }

  return lines.join("\n").trim()
}

export function SmartSummaryView({
  summary,
  isRegenerating = false,
  onRegenerate,
}: Props) {
  const [copyState, setCopyState] = useState<CopyState>("idle")
  const copyText = useMemo(() => formatSummaryForCopy(summary), [summary])
  const hasContent = copyText.length > 0

  useEffect(() => {
    if (copyState === "idle") return
    const timeout = window.setTimeout(() => setCopyState("idle"), 1800)
    return () => window.clearTimeout(timeout)
  }, [copyState])

  async function handleCopy() {
    if (!hasContent) return
    try {
      await navigator.clipboard.writeText(copyText)
      setCopyState("copied")
    } catch {
      setCopyState("error")
    }
  }

  if (!hasContent) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-gray-100 dark:border-stone-800 bg-white dark:bg-stone-900 px-5 py-8 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-stone-600" />
          <p className="text-sm font-medium text-brand-dark dark:text-brand-cream">
            Smart Summary belum bisa dibuat.
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500 dark:text-stone-400">
            Catatan ini mungkin masih kosong atau belum punya materi yang cukup
            untuk diringkas.
          </p>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-stone-700 px-3 py-1.5 text-xs font-medium text-brand-dark dark:text-brand-cream hover:border-brand-dark dark:hover:border-brand-cream disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`}
              />
              {isRegenerating ? "Generating..." : "Regenerate"}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <article className="flex flex-col gap-4">
      <div className="rounded-xl border border-brand-red/15 bg-white dark:bg-stone-900 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-red">
              <Sparkles className="h-3.5 w-3.5" />
              Smart Summary
            </p>
            <h1 className="mt-2 text-xl font-semibold leading-snug text-brand-dark dark:text-brand-cream">
              {summary.title || "Ringkasan catatan"}
            </h1>
          </div>
          <div className="flex shrink-0 gap-2">
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-medium text-gray-600 dark:text-stone-300 hover:border-brand-dark dark:hover:border-brand-cream hover:text-brand-dark dark:hover:text-brand-cream disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isRegenerating ? "animate-spin" : ""
                  }`}
                />
                {isRegenerating ? "Generating..." : "Regenerate"}
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!hasContent}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-medium text-gray-600 dark:text-stone-300 hover:border-brand-dark dark:hover:border-brand-cream hover:text-brand-dark dark:hover:text-brand-cream disabled:opacity-50"
            >
              {copyState === "copied" ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copyState === "copied"
                ? "Copied"
                : copyState === "error"
                ? "Copy failed"
                : "Copy"}
            </button>
          </div>
        </div>

        {summary.overview && (
          <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-stone-300">
            {summary.overview}
          </p>
        )}
      </div>

      {summary.sections.map((section, index) => (
        <section
          key={`${section.heading}-${index}`}
          className="rounded-xl border border-gray-100 dark:border-stone-800 bg-white dark:bg-stone-900 p-5"
        >
          <h2 className="text-sm font-semibold text-brand-dark dark:text-brand-cream">
            {section.heading}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {section.bullets.map((bullet, bulletIndex) => (
              <li
                key={`${bullet}-${bulletIndex}`}
                className="flex gap-2 text-sm leading-relaxed text-gray-600 dark:text-stone-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {summary.keyTakeaways.length > 0 && (
        <section className="rounded-xl border border-brand-red/15 bg-brand-muted dark:bg-stone-800 p-5">
          <h2 className="text-sm font-semibold text-brand-dark dark:text-brand-cream">
            Key takeaways
          </h2>
          <div className="mt-3 grid gap-2">
            {summary.keyTakeaways.map((takeaway, index) => (
              <p
                key={`${takeaway}-${index}`}
                className="rounded-lg bg-white/75 dark:bg-stone-900/75 px-3 py-2 text-sm leading-relaxed text-gray-700 dark:text-stone-300"
              >
                {takeaway}
              </p>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
