import { didChange, generateId } from "../utils"

export const DEADLINE_TYPES = ["exam", "assignment", "quiz"] as const
export type DeadlineType = (typeof DEADLINE_TYPES)[number]

export type DeadlineRow = {
  id: string
  subject_id: string
  user_id: string
  title: string
  type: DeadlineType
  due_date: number
  completed_at: number | null
  subject_name?: string
  subject_color?: string
}

export async function getDeadlinesByUser(db: D1Database, userId: string) {
  return db
    .prepare(
      `SELECT d.*, s.name as subject_name, s.color as subject_color
       FROM deadlines d JOIN subjects s ON d.subject_id = s.id AND s.user_id = d.user_id
       WHERE d.user_id = ? ORDER BY d.due_date ASC`
    )
    .bind(userId)
    .all<DeadlineRow>()
}

export async function createDeadline(
  db: D1Database,
  userId: string,
  subjectId: string,
  title: string,
  type: DeadlineType,
  dueDate: number
): Promise<DeadlineRow> {
  const id = generateId()
  await db
    .prepare(
      "INSERT INTO deadlines (id, subject_id, user_id, title, type, due_date) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, subjectId, userId, title, type, dueDate)
    .run()

  return { id, subject_id: subjectId, user_id: userId, title, type, due_date: dueDate, completed_at: null }
}

export async function updateDeadline(
  db: D1Database,
  id: string,
  userId: string,
  subjectId: string,
  title: string,
  type: DeadlineType,
  dueDate: number
): Promise<DeadlineRow | null> {
  const result = await db
    .prepare(
      "UPDATE deadlines SET subject_id = ?, title = ?, type = ?, due_date = ? WHERE id = ? AND user_id = ?"
    )
    .bind(subjectId, title, type, dueDate, id, userId)
    .run()

  if (!didChange(result)) return null

  return db
    .prepare(
      `SELECT d.*, s.name as subject_name, s.color as subject_color
       FROM deadlines d LEFT JOIN subjects s ON d.subject_id = s.id AND s.user_id = d.user_id
       WHERE d.id = ? AND d.user_id = ?`
    )
    .bind(id, userId)
    .first<DeadlineRow>()
}

export async function updateDeadlineCompletion(
  db: D1Database,
  id: string,
  userId: string,
  completedAt: number | null
): Promise<DeadlineRow | null> {
  const result = await db
    .prepare("UPDATE deadlines SET completed_at = ? WHERE id = ? AND user_id = ?")
    .bind(completedAt, id, userId)
    .run()

  if (!didChange(result)) return null

  return db
    .prepare(
      `SELECT d.*, s.name as subject_name, s.color as subject_color
       FROM deadlines d LEFT JOIN subjects s ON d.subject_id = s.id AND s.user_id = d.user_id
       WHERE d.id = ? AND d.user_id = ?`
    )
    .bind(id, userId)
    .first<DeadlineRow>()
}

export async function deleteDeadline(db: D1Database, id: string, userId: string): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM deadlines WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run()

  return didChange(result)
}
