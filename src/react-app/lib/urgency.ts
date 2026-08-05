export type UrgencyLevel = "critical" | "warning" | "safe"

export function getUrgencyLevel(daysUntil: number): UrgencyLevel {
  if (daysUntil <= 3) return "critical"
  if (daysUntil <= 7) return "warning"
  return "safe"
}

export function getUrgencyBg(level: UrgencyLevel): string {
  switch (level) {
    case "critical":
      return "bg-red-100 dark:bg-red-950/40 text-urgency-critical"
    case "warning":
      return "bg-amber-100 dark:bg-amber-950/40 text-urgency-warning"
    case "safe":
      return "bg-teal-100 dark:bg-teal-950/40 text-urgency-safe dark:text-teal-300"
  }
}

export function formatDaysUntil(days: number): string {
  if (days < 0) return "Sudah lewat"
  if (days === 0) return "Hari ini!"
  if (days === 1) return "Besok"
  return `${days} hari lagi`
}
