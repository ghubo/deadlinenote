import { didChange, generateId } from "../utils"

export type SubjectRow = {
  id: string
  user_id: string
  name: string
  color: string
  semester: string | null
}

export async function getSubjectsByUser(db: D1Database, userId: string) {
  return db
    .prepare("SELECT * FROM subjects WHERE user_id = ?")
    .bind(userId)
    .all<SubjectRow>()
}

export async function getSubjectById(db: D1Database, id: string, userId: string) {
  return db
    .prepare("SELECT * FROM subjects WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .first<SubjectRow>()
}

export async function createSubject(
  db: D1Database,
  userId: string,
  name: string,
  color: string,
  semester: string | null
): Promise<SubjectRow> {
  const id = generateId()
  await db
    .prepare("INSERT INTO subjects (id, user_id, name, color, semester) VALUES (?, ?, ?, ?, ?)")
    .bind(id, userId, name, color, semester)
    .run()

  return { id, user_id: userId, name, color, semester }
}

export async function updateSubject(
  db: D1Database,
  id: string,
  userId: string,
  name: string,
  color: string,
  semester: string | null
): Promise<SubjectRow | null> {
  const result = await db
    .prepare("UPDATE subjects SET name = ?, color = ?, semester = ? WHERE id = ? AND user_id = ?")
    .bind(name, color, semester, id, userId)
    .run()

  if (!didChange(result)) return null

  return getSubjectById(db, id, userId)
}

export async function countSubjectDependencies(db: D1Database, id: string, userId: string) {
  const notes = await db
    .prepare("SELECT COUNT(*) AS count FROM notes WHERE subject_id = ? AND user_id = ?")
    .bind(id, userId)
    .first<{ count: number | string | null }>()
  const deadlines = await db
    .prepare("SELECT COUNT(*) AS count FROM deadlines WHERE subject_id = ? AND user_id = ?")
    .bind(id, userId)
    .first<{ count: number | string | null }>()

  return {
    notes: Number(notes?.count ?? 0),
    deadlines: Number(deadlines?.count ?? 0),
  }
}

export async function deleteSubject(db: D1Database, id: string, userId: string): Promise<boolean> {
  const result = await db
    .prepare("DELETE FROM subjects WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run()

  return didChange(result)
}
