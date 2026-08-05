export const queryKeys = {
  notes: () => ["notes"] as const,
  note: (id: string) => ["notes", id] as const,
  deadlines: () => ["deadlines"] as const,
  subjects: () => ["subjects"] as const,
  sessions: () => ["sessions"] as const,
  dashboard: () => ["dashboard", new Date().getTimezoneOffset()] as const,
  stats: () => ["stats"] as const,
} as const
