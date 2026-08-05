export const DEADLINE_TYPE_OPTIONS = [
  { value: "exam", label: "Ujian" },
  { value: "assignment", label: "Tugas" },
  { value: "quiz", label: "Kuis" },
] as const

export const DEADLINE_TYPE_LABELS: Record<string, string> = {
  exam: "Ujian",
  assignment: "Tugas",
  quiz: "Kuis",
}
