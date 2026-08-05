import { AppError } from "../http"
import {
  completePomodoroSession,
  createPomodoroSession,
  deleteSession,
  getNoteById,
  getPomodoroSessionById,
  getPomodoroSessionsByUser,
} from "../db"
import { assertPomodoroDuration } from "./validation"
import { assertOwnedSubject } from "./subjects"

export async function listSessions(db: D1Database, userId: string) {
  return getPomodoroSessionsByUser(db, userId)
}

export async function createSessionForUser(
  db: D1Database,
  userId: string,
  input: { note_id?: string | null; subject_id?: string | null; duration_minutes: number }
) {
  assertPomodoroDuration(input.duration_minutes)

  const note = input.note_id ? await getNoteById(db, input.note_id, userId) : null
  if (input.note_id && !note) throw new AppError(404, "not_found", "Note not found")

  const subjectId = input.subject_id ?? note?.subject_id ?? null
  if (subjectId) await assertOwnedSubject(db, userId, subjectId)
  if (note && subjectId && note.subject_id !== subjectId) {
    throw new AppError(400, "bad_request", "note_id does not belong to subject_id")
  }

  return createPomodoroSession(
    db,
    userId,
    input.note_id ?? null,
    subjectId,
    input.duration_minutes
  )
}

export async function completeSessionForUser(db: D1Database, userId: string, id: string) {
  const session = await getPomodoroSessionById(db, id, userId)
  if (!session) throw new AppError(404, "not_found", "Session not found")
  if (session.status !== "active") throw new AppError(409, "conflict", "Session is not active")
  const completed = await completePomodoroSession(db, id, userId)
  if (!completed) throw new AppError(409, "conflict", "Session is not active")
}

export async function deleteSessionForUser(db: D1Database, userId: string, id: string) {
  const deleted = await deleteSession(db, id, userId)
  if (!deleted) throw new AppError(404, "not_found", "Session not found")
}
