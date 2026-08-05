import { generateId, nowUnix } from "../utils"

export const REVIEW_RESULTS = ["easy", "medium", "hard"] as const
export type ReviewResult = (typeof REVIEW_RESULTS)[number]

export async function createReviewLog(
  db: D1Database,
  userId: string,
  noteId: string,
  result: ReviewResult
): Promise<void> {
  const id = generateId()
  const now = nowUnix()
  await db
    .prepare("INSERT INTO review_logs (id, user_id, note_id, reviewed_at, result) VALUES (?, ?, ?, ?, ?)")
    .bind(id, userId, noteId, now, result)
    .run()
}
