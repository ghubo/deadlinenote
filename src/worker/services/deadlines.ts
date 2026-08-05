import { AppError } from "../http"
import {
  createDeadline,
  DEADLINE_TYPES,
  deleteDeadline,
  getDeadlinesByUser,
  updateDeadlineCompletion,
  updateDeadline,
  type DeadlineType,
} from "../db"
import { LIMITS, normalizeText } from "./validation"
import { assertOwnedSubject } from "./subjects"

function normalizeDeadlineType(type: DeadlineType) {
  if (!DEADLINE_TYPES.includes(type)) {
    throw new AppError(400, "bad_request", "type is invalid")
  }
  return type
}

export async function listDeadlines(db: D1Database, userId: string) {
  return getDeadlinesByUser(db, userId)
}

export async function createDeadlineForUser(
  db: D1Database,
  userId: string,
  input: { subject_id: string; title: string; type: DeadlineType; due_date: number }
) {
  await assertOwnedSubject(db, userId, input.subject_id)
  return createDeadline(
    db,
    userId,
    input.subject_id,
    normalizeText(input.title, LIMITS.title, "title"),
    normalizeDeadlineType(input.type),
    input.due_date
  )
}

export async function updateDeadlineForUser(
  db: D1Database,
  userId: string,
  id: string,
  input: { subject_id: string; title: string; type: DeadlineType; due_date: number }
) {
  await assertOwnedSubject(db, userId, input.subject_id)
  const deadline = await updateDeadline(
    db,
    id,
    userId,
    input.subject_id,
    normalizeText(input.title, LIMITS.title, "title"),
    normalizeDeadlineType(input.type),
    input.due_date
  )
  if (!deadline) throw new AppError(404, "not_found", "Deadline not found")
  return deadline
}

export async function updateDeadlineCompletionForUser(
  db: D1Database,
  userId: string,
  id: string,
  completed: boolean
) {
  const completedAt = completed ? Math.floor(Date.now() / 1000) : null
  const deadline = await updateDeadlineCompletion(db, id, userId, completedAt)
  if (!deadline) throw new AppError(404, "not_found", "Deadline not found")
  return deadline
}

export async function deleteDeadlineForUser(db: D1Database, userId: string, id: string) {
  const deleted = await deleteDeadline(db, id, userId)
  if (!deleted) throw new AppError(404, "not_found", "Deadline not found")
}
