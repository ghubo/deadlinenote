import { didChange, generateId, nowUnix } from "../utils"

export type PomodoroSessionRow = {
  id: string
  user_id: string
  note_id: string | null
  subject_id: string | null
  note_title?: string | null
  subject_name?: string | null
  duration_minutes: number
  started_at: number
  completed_at: number | null
  status: "active" | "completed" | "abandoned"
}

export async function getPomodoroSessionsByUser(db: D1Database, userId: string) {
  return db
    .prepare(
      `SELECT
         ps.*,
         n.title AS note_title,
         COALESCE(ss.name, sn.name) AS subject_name
       FROM pomodoro_sessions ps
       LEFT JOIN notes n ON ps.note_id = n.id AND n.user_id = ps.user_id
       LEFT JOIN subjects ss ON ps.subject_id = ss.id AND ss.user_id = ps.user_id
       LEFT JOIN subjects sn ON n.subject_id = sn.id AND sn.user_id = ps.user_id
       WHERE ps.user_id = ?
       ORDER BY ps.started_at DESC
       LIMIT 100`
    )
    .bind(userId)
    .all<PomodoroSessionRow>()
}

export async function getTodaySessionStats(
  db: D1Database,
  userId: string,
  timezoneOffsetMinutes = 0
) {
  const nowMs = Date.now()
  const localMs = nowMs - timezoneOffsetMinutes * 60_000
  const local = new Date(localMs)
  const startUtc =
    (Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) +
      timezoneOffsetMinutes * 60_000) /
    1000
  const endUtc = startUtc + 86400
  return db
    .prepare(
      `SELECT
         COALESCE(SUM(duration_minutes), 0) AS totalMinutes,
         COUNT(*) AS sessions
       FROM pomodoro_sessions
       WHERE user_id = ?
         AND status = 'completed'
         AND completed_at IS NOT NULL
         AND completed_at >= ?
         AND completed_at < ?`
    )
    .bind(userId, startUtc, endUtc)
    .first<{ totalMinutes: number | string | null; sessions: number | string | null }>()
}

export async function createPomodoroSession(
  db: D1Database,
  userId: string,
  noteId: string | null,
  subjectId: string | null,
  durationMinutes: number
): Promise<PomodoroSessionRow> {
  const id = generateId()
  const now = nowUnix()
  await db
    .prepare(
      "INSERT INTO pomodoro_sessions (id, user_id, note_id, subject_id, duration_minutes, started_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, userId, noteId, subjectId, durationMinutes, now)
    .run()

  return {
    id,
    user_id: userId,
    note_id: noteId,
    subject_id: subjectId,
    duration_minutes: durationMinutes,
    started_at: now,
    completed_at: null,
    status: "active",
  }
}

export async function completePomodoroSession(
  db: D1Database,
  id: string,
  userId: string
): Promise<boolean> {
  const now = nowUnix()
  const result = await db
    .prepare(
      "UPDATE pomodoro_sessions SET completed_at = ?, status = 'completed' WHERE id = ? AND user_id = ? AND status = 'active'"
    )
    .bind(now, id, userId)
    .run()

  return didChange(result)
}

export async function getPomodoroSessionById(
  db: D1Database,
  id: string,
  userId: string
): Promise<PomodoroSessionRow | null> {
  return db
    .prepare("SELECT * FROM pomodoro_sessions WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .first<PomodoroSessionRow>()
}

export async function deleteSession(db: D1Database, id: string, userId: string): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM pomodoro_sessions WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run()

  return didChange(result)
}
