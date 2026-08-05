import { AlarmClock, X } from "lucide-react"
import { Deadline } from "../../lib/types"
import { DEADLINE_TYPE_LABELS } from "../../lib/deadline-types"

interface Props {
  noteName: string
  daysUntil: number
  deadlineType: Deadline["type"]
  onDismiss: () => void
}

export function ReminderAlert({
  noteName,
  daysUntil,
  deadlineType,
  onDismiss,
}: Props) {
  return (
    <div className="flex items-start gap-3 bg-brand-muted dark:bg-stone-800 border-l-2 border-brand-red rounded-xl p-4">
      <AlarmClock className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-brand-dark dark:text-brand-cream">Waktunya review!</p>
        <p className="text-xs text-gray-500 dark:text-stone-400 mt-0.5">
          <strong>{noteName}</strong> belum dibuka —{" "}
          {DEADLINE_TYPE_LABELS[deadlineType] || deadlineType} {daysUntil} hari
          lagi.
        </p>
      </div>
      <button onClick={onDismiss} className="text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
