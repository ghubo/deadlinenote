import { generateId, nowUnix } from "../utils"

export type ContactMessageRow = {
  id: string
  name: string
  email: string
  message: string
  created_at: number
}

export async function createContactMessage(
  db: D1Database,
  name: string,
  email: string,
  message: string
): Promise<ContactMessageRow> {
  const id = generateId()
  const now = nowUnix()

  await db
    .prepare(
      "INSERT INTO contact_messages (id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(id, name, email, message, now)
    .run()

  return { id, name, email, message, created_at: now }
}

export async function incrementContactRateLimit(
  db: D1Database,
  key: string,
  windowSeconds: number
) {
  const now = nowUnix()
  const existing = await db
    .prepare("SELECT count, reset_at FROM contact_rate_limits WHERE key = ?")
    .bind(key)
    .first<{ count: number | string; reset_at: number | string }>()

  if (!existing || Number(existing.reset_at) <= now) {
    const resetAt = now + windowSeconds
    await db
      .prepare(
        "INSERT OR REPLACE INTO contact_rate_limits (key, count, reset_at) VALUES (?, 1, ?)"
      )
      .bind(key, resetAt)
      .run()
    return { count: 1, resetAt }
  }

  const count = Number(existing.count) + 1
  const resetAt = Number(existing.reset_at)
  await db
    .prepare("UPDATE contact_rate_limits SET count = ? WHERE key = ?")
    .bind(count, key)
    .run()
  return { count, resetAt }
}
