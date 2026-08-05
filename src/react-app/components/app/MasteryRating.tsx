import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleCheck } from "lucide-react"
import { fetcher } from "../../lib/fetcher"
import { queryKeys } from "../../lib/queryKeys"

const RATINGS = [
  { label: "Belum Tahu", result: "hard" as const, score: 0.1, color: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 border-red-200 dark:border-red-900/50" },
  { label: "Sedikit Tahu", result: "hard" as const, score: 0.3, color: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-900/50" },
  { label: "Cukup", result: "medium" as const, score: 0.5, color: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 border-yellow-200 dark:border-yellow-900/50" },
  { label: "Tahu", result: "medium" as const, score: 0.75, color: "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 border-teal-200 dark:border-teal-900/50" },
  { label: "Sangat Tahu", result: "easy" as const, score: 1.0, color: "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-200 dark:border-green-900/50" },
]

export function MasteryRating({
  noteId,
  currentMastery,
  onRated,
}: {
  noteId: string
  currentMastery: number
  onRated?: () => void
}) {
  const qc = useQueryClient()
  const reviewNote = useMutation({
    mutationFn: ({ id, mastery_score, result }: { id: string; mastery_score: number; result: "easy" | "medium" | "hard" }) =>
      fetcher<{ success: boolean }>(`/notes/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ mastery_score, result }),
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.notes() })
      qc.invalidateQueries({ queryKey: queryKeys.note(id) })
    },
  })
  const [rated, setRated] = useState(false)

  async function handleRate(score: number, result: "easy" | "medium" | "hard") {
    await reviewNote.mutateAsync({ id: noteId, mastery_score: score, result })
    setRated(true)
    onRated?.()
  }

  if (rated) {
    return (
      <div className="text-center py-8">
        <CircleCheck className="w-10 h-10 text-green-500 mx-auto mb-2" />
        <p className="text-brand-dark dark:text-brand-cream font-medium">Penguasaan tersimpan!</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="font-medium text-brand-dark dark:text-brand-cream text-sm">Nilai penguasaanmu</p>
        <span className="text-xs text-gray-400 dark:text-stone-500 shrink-0">
          Saat ini: {Math.round(currentMastery * 100)}%
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {RATINGS.map((r) => (
          <button
            key={r.label}
            onClick={() => handleRate(r.score, r.result)}
            disabled={reviewNote.isPending}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${r.color}`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
