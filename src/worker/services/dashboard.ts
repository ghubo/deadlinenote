import { getDeadlinesByUser, getNotesByUser, getTodaySessionStats } from "../db"

const PAST_DEADLINE_CUTOFF_DAYS = -1

export async function getDashboardData(
  db: D1Database,
  userId: string,
  timezoneOffsetMinutes = 0
) {
  const now = Math.floor(Date.now() / 1000)

  const [deadlinesResult, notesResult] = await Promise.all([
    getDeadlinesByUser(db, userId),
    getNotesByUser(db, userId),
  ])

  const nearestDeadlineBySubject = new Map<string, number>()
  const activeDeadlines = deadlinesResult.results.filter((deadline) => deadline.completed_at == null)

  for (const deadline of activeDeadlines) {
    const daysUntil = (deadline.due_date - now) / 86400
    if (daysUntil < PAST_DEADLINE_CUTOFF_DAYS) continue
    const existing = nearestDeadlineBySubject.get(deadline.subject_id)
    if (existing == null || daysUntil < existing) {
      nearestDeadlineBySubject.set(deadline.subject_id, daysUntil)
    }
  }

  const notes = notesResult.results.map((note) => {
    const daysSinceReview = note.last_reviewed_at ? (now - note.last_reviewed_at) / 86400 : 14
    const nearestSubjectDeadlineDays = nearestDeadlineBySubject.get(note.subject_id)
    const deadlineProximityScore =
      nearestSubjectDeadlineDays == null
        ? 0
        : nearestSubjectDeadlineDays <= 0
        ? 4
        : nearestSubjectDeadlineDays <= 2
        ? 3
        : nearestSubjectDeadlineDays <= 7
        ? 2
        : nearestSubjectDeadlineDays <= 14
        ? 1
        : 0
    const urgencyScore = (1 - note.mastery_score) * 10 + daysSinceReview * 0.5 + deadlineProximityScore

    return {
      ...note,
      urgency_score: urgencyScore,
      days_since_review: Math.round(daysSinceReview),
      deadline_proximity_days:
        nearestSubjectDeadlineDays == null ? null : Math.round(nearestSubjectDeadlineDays),
    }
  })

  notes.sort((a, b) => b.urgency_score - a.urgency_score)

  const deadlines = activeDeadlines
    .filter((deadline) => deadline.due_date >= now - 86400)
    .map((deadline) => ({
      ...deadline,
      days_until: Math.round((deadline.due_date - now) / 86400),
    }))

  const statsRaw = await getTodaySessionStats(db, userId, timezoneOffsetMinutes)
  const stats = {
    totalMinutes: Number(statsRaw?.totalMinutes ?? 0),
    sessions: Number(statsRaw?.sessions ?? 0),
  }

  return { notes, deadlines, stats }
}
