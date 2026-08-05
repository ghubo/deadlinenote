import type { Deadline } from "../../lib/types"
import { UrgencyPill } from "../ui/UrgencyPill"
import { DEADLINE_TYPE_LABELS } from "../../lib/deadline-types"

interface Props {
  deadline: Deadline & { days_until: number }
}

export function DeadlineCard({ deadline }: Props) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-4 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex-1">
        <p className="font-medium text-brand-dark dark:text-brand-cream text-sm">{deadline.title}</p>
        <p className="text-xs text-gray-500 dark:text-stone-400 mt-0.5">
          {deadline.subject_name} ·{" "}
          {DEADLINE_TYPE_LABELS[deadline.type] ?? deadline.type}
        </p>
      </div>
      <UrgencyPill daysUntil={deadline.days_until} />
    </div>
  )
}
