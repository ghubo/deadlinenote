import { AppError } from "../http"

export const LIMITS = {
  name: 120,
  title: 160,
  semester: 80,
  tag: 40,
  tags: 20,
  tagsJson: 2000,
  noteContent: 50_000,
  aiContent: 20_000,
  ocrImageBytes: 5 * 1024 * 1024,
  contactEmail: 254,
  contactMessage: 4_000,
  pomodoroMin: 5,
  pomodoroMax: 180,
} as const

export function assertMaxLength(value: string, max: number, field: string) {
  if (value.length > max) {
    throw new AppError(400, "bad_request", `${field} must be ${max} characters or fewer`)
  }
}

export function normalizeText(value: string, max: number, field: string) {
  const normalized = value.trim()
  if (!normalized) throw new AppError(400, "bad_request", `${field} is required`)
  assertMaxLength(normalized, max, field)
  return normalized
}

export function normalizeNullableText(
  value: string | null | undefined,
  max: number,
  field: string
) {
  const normalized = value?.trim()
  if (!normalized) return null
  assertMaxLength(normalized, max, field)
  return normalized
}

export function normalizeTags(tags: string[] | null | undefined) {
  if (!tags || tags.length === 0) return null
  const unique = new Set<string>()
  for (const tag of tags) {
    const normalized = tag.trim()
    if (!normalized) continue
    assertMaxLength(normalized, LIMITS.tag, "tag")
    unique.add(normalized)
  }
  const result = [...unique].slice(0, LIMITS.tags)
  if (result.length === 0) return null
  const json = JSON.stringify(result)
  assertMaxLength(json, LIMITS.tagsJson, "tags")
  return json
}

export function assertPomodoroDuration(durationMinutes: number) {
  if (
    !Number.isFinite(durationMinutes) ||
    durationMinutes < LIMITS.pomodoroMin ||
    durationMinutes > LIMITS.pomodoroMax
  ) {
    throw new AppError(
      400,
      "bad_request",
      `duration_minutes must be between ${LIMITS.pomodoroMin} and ${LIMITS.pomodoroMax}`
    )
  }
}
