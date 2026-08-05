import { AppError } from "../http"
import { createContactMessage, incrementContactRateLimit } from "../db"
import { LIMITS, normalizeText } from "./validation"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60
const MAX_MESSAGES_PER_WINDOW = 5

function rateLimitKey(value: string) {
  return value.trim().toLowerCase()
}

export async function submitContactMessage(
  db: D1Database,
  input: { name: string; email: string; message: string; website?: string | null },
  clientIp: string
) {
  if (input.website?.trim()) {
    return
  }

  const name = normalizeText(input.name, LIMITS.name, "name")
  const email = normalizeText(input.email, LIMITS.contactEmail, "email").toLowerCase()
  const message = normalizeText(input.message, LIMITS.contactMessage, "message")
  if (!EMAIL_RE.test(email)) throw new AppError(400, "bad_request", "email format is invalid")
  if (message.length < 20) {
    throw new AppError(400, "bad_request", "message must be at least 20 characters")
  }

  const keys = [`ip:${rateLimitKey(clientIp || "unknown")}`, `email:${rateLimitKey(email)}`]
  for (const key of keys) {
    const result = await incrementContactRateLimit(db, key, RATE_LIMIT_WINDOW_SECONDS)
    if (result.count > MAX_MESSAGES_PER_WINDOW) {
      throw new AppError(429, "rate_limited", "Too many contact messages. Try again later.")
    }
  }

  await createContactMessage(db, name, email, message)
}
