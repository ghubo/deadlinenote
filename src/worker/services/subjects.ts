import { AppError } from "../http"
import {
  countSubjectDependencies,
  createSubject,
  deleteSubject,
  getSubjectById,
  getSubjectsByUser,
  updateSubject,
} from "../db"
import { normalizeNullableText, normalizeText, LIMITS } from "./validation"

const subjectColors = ["blue", "red", "green", "purple", "orange", "teal", "pink", "yellow"] as const
type SubjectColor = (typeof subjectColors)[number]
const colorSet = new Set<string>(subjectColors)

function normalizeColor(color: string): SubjectColor {
  if (!colorSet.has(color)) {
    throw new AppError(400, "bad_request", "color is invalid")
  }
  return color as SubjectColor
}

export async function listSubjects(db: D1Database, userId: string) {
  return getSubjectsByUser(db, userId)
}

export async function createSubjectForUser(
  db: D1Database,
  userId: string,
  input: { name: string; color: string; semester?: string | null }
) {
  return createSubject(
    db,
    userId,
    normalizeText(input.name, LIMITS.name, "name"),
    normalizeColor(input.color),
    normalizeNullableText(input.semester, LIMITS.semester, "semester")
  )
}

export async function updateSubjectForUser(
  db: D1Database,
  userId: string,
  id: string,
  input: { name: string; color: string; semester?: string | null }
) {
  const subject = await updateSubject(
    db,
    id,
    userId,
    normalizeText(input.name, LIMITS.name, "name"),
    normalizeColor(input.color),
    normalizeNullableText(input.semester, LIMITS.semester, "semester")
  )
  if (!subject) throw new AppError(404, "not_found", "Subject not found")
  return subject
}

export async function deleteSubjectForUser(db: D1Database, userId: string, id: string) {
  const subject = await getSubjectById(db, id, userId)
  if (!subject) throw new AppError(404, "not_found", "Subject not found")

  const dependencies = await countSubjectDependencies(db, id, userId)
  if (dependencies.notes > 0 || dependencies.deadlines > 0) {
    throw new AppError(409, "conflict", "Delete all notes/deadlines in this subject first.")
  }

  const deleted = await deleteSubject(db, id, userId)
  if (!deleted) throw new AppError(404, "not_found", "Subject not found")
}

export async function assertOwnedSubject(db: D1Database, userId: string, subjectId: string) {
  const subject = await getSubjectById(db, subjectId, userId)
  if (!subject) throw new AppError(404, "not_found", "Subject not found")
  return subject
}
