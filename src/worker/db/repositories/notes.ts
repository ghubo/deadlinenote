import { didChange, generateId, nowUnix } from "../utils"

export type NoteRow = {
  id: string
  user_id: string
  subject_id: string
  title: string
  content: string
  tags: string | null
  last_reviewed_at: number | null
  review_count: number
  mastery_score: number
  created_at: number
  updated_at: number
  subject_name?: string
  subject_color?: string
  next_review_at?: number | null
}

export async function getNotesByUser(db: D1Database, userId: string) {
  return db
    .prepare(
      `SELECT n.*, s.name as subject_name, s.color as subject_color,
              CASE
                WHEN rl.reviewed_at IS NULL THEN NULL
                WHEN rl.result = 'easy' THEN rl.reviewed_at + (7 * 86400)
                WHEN rl.result = 'medium' THEN rl.reviewed_at + (3 * 86400)
                ELSE rl.reviewed_at + (1 * 86400)
              END AS next_review_at
       FROM notes n JOIN subjects s ON n.subject_id = s.id AND s.user_id = n.user_id
       LEFT JOIN (
         SELECT r.note_id, r.reviewed_at, r.result
         FROM review_logs r
         INNER JOIN (
           SELECT note_id, MAX(reviewed_at) AS max_reviewed_at
           FROM review_logs
           WHERE user_id = ?
           GROUP BY note_id
         ) lr ON lr.note_id = r.note_id AND lr.max_reviewed_at = r.reviewed_at
         WHERE r.user_id = ?
       ) rl ON rl.note_id = n.id
       WHERE n.user_id = ? ORDER BY n.updated_at DESC`
    )
    .bind(userId, userId, userId)
    .all<NoteRow>()
}

export async function getNoteById(db: D1Database, id: string, userId: string) {
  return db
    .prepare(
      `SELECT n.*, s.name as subject_name, s.color as subject_color,
              CASE
                WHEN rl.reviewed_at IS NULL THEN NULL
                WHEN rl.result = 'easy' THEN rl.reviewed_at + (7 * 86400)
                WHEN rl.result = 'medium' THEN rl.reviewed_at + (3 * 86400)
                ELSE rl.reviewed_at + (1 * 86400)
              END AS next_review_at
       FROM notes n LEFT JOIN subjects s ON n.subject_id = s.id AND s.user_id = n.user_id
       LEFT JOIN (
         SELECT r.note_id, r.reviewed_at, r.result
         FROM review_logs r
         INNER JOIN (
           SELECT note_id, MAX(reviewed_at) AS max_reviewed_at
           FROM review_logs
           WHERE user_id = ?
           GROUP BY note_id
         ) lr ON lr.note_id = r.note_id AND lr.max_reviewed_at = r.reviewed_at
         WHERE r.user_id = ?
       ) rl ON rl.note_id = n.id
       WHERE n.id = ? AND n.user_id = ?`
    )
    .bind(userId, userId, id, userId)
    .first<NoteRow>()
}

export async function createNote(
  db: D1Database,
  userId: string,
  subjectId: string,
  title: string,
  content: string,
  tags: string | null
): Promise<NoteRow> {
  const id = generateId()
  const now = nowUnix()
  await db
    .prepare(
      "INSERT INTO notes (id, user_id, subject_id, title, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, userId, subjectId, title, content, tags, now, now)
    .run()

  return {
    id,
    user_id: userId,
    subject_id: subjectId,
    title,
    content,
    tags,
    last_reviewed_at: null,
    review_count: 0,
    mastery_score: 0,
    created_at: now,
    updated_at: now,
  }
}

export async function updateNote(
  db: D1Database,
  id: string,
  userId: string,
  title: string,
  content: string,
  tags: string | null
): Promise<NoteRow | null> {
  const now = nowUnix()
  const result = await db
    .prepare(
      "UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = ? WHERE id = ? AND user_id = ?"
    )
    .bind(title, content, tags, now, id, userId)
    .run()

  if (!didChange(result)) return null

  return getNoteById(db, id, userId)
}

export async function deleteNote(db: D1Database, id: string, userId: string): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM notes WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run()

  return didChange(result)
}

export async function updateNoteReview(
  db: D1Database,
  id: string,
  userId: string,
  masteryScore: number
): Promise<boolean> {
  const now = nowUnix()
  const result = await db
    .prepare(
      `UPDATE notes
       SET last_reviewed_at = ?,
           review_count = review_count + 1,
           mastery_score = ?,
           updated_at = ?
       WHERE id = ? AND user_id = ?`
     )
    .bind(now, masteryScore, now, id, userId)
    .run()

  return didChange(result)
}
