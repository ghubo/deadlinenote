import { getDeadlinesByUser, getNotesByUser, getSubjectsByUser } from "../db"

export async function getExportData(db: D1Database, userId: string) {
  const [notes, deadlines, subjects] = await Promise.all([
    getNotesByUser(db, userId),
    getDeadlinesByUser(db, userId),
    getSubjectsByUser(db, userId),
  ])

  return {
    exported_at: new Date().toISOString(),
    notes: notes.results,
    deadlines: deadlines.results,
    subjects: subjects.results,
  }
}
