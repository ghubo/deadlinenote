import {
  getUrgencyLevel,
  getUrgencyBg,
  formatDaysUntil,
} from "../../lib/urgency"

interface Props {
  daysUntil: number
}

export function UrgencyPill({ daysUntil }: Props) {
  const level = getUrgencyLevel(daysUntil)
  const cls = getUrgencyBg(level)
  return (
    <span
      className={`inline-flex items-center text-nowrap px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {formatDaysUntil(daysUntil)}
    </span>
  )
}
