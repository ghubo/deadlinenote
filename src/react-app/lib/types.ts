export interface Subject {
  id: string
  user_id: string
  name: string
  color: string
  semester: string | null
}

export interface Deadline {
  id: string
  subject_id: string
  user_id: string
  title: string
  type: "exam" | "assignment" | "quiz"
  due_date: number
  completed_at: number | null
  subject_name?: string
  subject_color?: string
}

export type NoteBlockType = "paragraph" | "heading" | "bullet"

export interface ParagraphBlock { type: "paragraph"; text: string }
export interface HeadingBlock   { type: "heading";   text: string; level: 2 | 3 }
export interface BulletBlock    { type: "bullet";    items: string[] }
export interface Flashcard      { type: "flashcard"; front: string; back: string }
export interface SmartSummarySection { heading: string; bullets: string[] }
export interface SmartSummary {
  title: string
  overview: string
  sections: SmartSummarySection[]
  keyTakeaways: string[]
}
export type NoteBlock = ParagraphBlock | HeadingBlock | BulletBlock

export interface Note {
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

export interface PomodoroSession {
  id: string
  user_id: string
  note_id: string | null
  subject_id: string | null
  duration_minutes: number
  started_at: number
  completed_at: number | null
  status: "active" | "completed" | "abandoned"
  note_title?: string | null
  subject_name?: string | null
}

export interface DashboardNote {
  id: string
  title: string
  subject_id: string
  subject_name: string
  subject_color: string
  last_reviewed_at: number | null
  review_count: number
  mastery_score: number
  urgency_score: number
  days_since_review: number
  next_review_at?: number | null
  deadline_proximity_days?: number | null
}

export interface DashboardDeadline extends Deadline {
  days_until: number
}

export interface DashboardData {
  notes: DashboardNote[]
  deadlines: DashboardDeadline[]
  stats: { totalMinutes: number; sessions: number }
}
