import { useQuery } from "@tanstack/react-query"
import type { Subject, DashboardNote, DashboardData } from "../lib/types"
import { StatCard } from "../components/ui/StatCard"
import { ProgressBar } from "../components/ui/ProgressBar"
import { getColor } from "../lib/colors"
import { BarChart3 } from "lucide-react"
import { fetcher } from "../lib/fetcher"
import { queryKeys } from "../lib/queryKeys"
import { timezoneOffsetQuery } from "../lib/date"

interface SubjectStat {
  subject: Subject
  notes: DashboardNote[]
  avgMastery: number
}

export default function StatsPage() {
  const { data, isLoading: isStatsLoading } = useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => fetcher<DashboardData>(`/dashboard?${timezoneOffsetQuery()}`),
  })
  const { data: subjects, isLoading: isSubjectsLoading } = useQuery({
    queryKey: queryKeys.subjects(),
    queryFn: () => fetcher<Subject[]>("/subjects"),
  })
  const isLoading = isStatsLoading || isSubjectsLoading

  // Overall average = average of all notes' mastery_score
  const avgMastery =
    data && data.notes.length > 0
      ? data.notes.reduce((acc, n) => acc + n.mastery_score, 0) / data.notes.length
      : 0

  // Per-subject: average = average of notes in that subject
  const subjectStats: SubjectStat[] =
    data && subjects
      ? subjects
          .map((s) => {
            const subjectNotes = data.notes.filter((n) => n.subject_id === s.id)
            if (subjectNotes.length === 0) return null
            const avg =
              subjectNotes.reduce((acc, n) => acc + n.mastery_score, 0) / subjectNotes.length
            return { subject: s, notes: subjectNotes, avgMastery: avg }
          })
          .filter((x): x is SubjectStat => x !== null)
      : []

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-3xl mx-auto w-full min-w-0">
      <header className="mb-6">
        <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest">Statistik</p>
        <h1 className="text-xl md:text-2xl font-semibold text-brand-dark dark:text-brand-cream mt-1">Progress Belajar</h1>
      </header>

      {isLoading && (
        <div className="text-center py-20 text-gray-400 dark:text-stone-500">Memuat...</div>
      )}

      {!isLoading && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <StatCard label="Total catatan" value={data.notes.length} />
            <StatCard label="Total deadline" value={data.deadlines.length} />
            <StatCard
              label="Rata-rata penguasaan"
              value={`${Math.round(avgMastery * 100)}%`}
              className="col-span-2 md:col-span-1"
            />
          </div>

          {/* Per-subject summary bar */}
          {subjectStats.length > 0 && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-gray-100 dark:border-stone-800 p-5 mb-4">
              <h2 className="font-medium text-brand-dark dark:text-brand-cream mb-4">Ringkasan Per Mata Kuliah</h2>
              <div className="flex flex-col gap-4">
                {subjectStats.map((entry) => {
                  const { dot } = getColor(entry.subject.color)
                  return (
                    <div key={entry.subject.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                          <p className="text-sm font-medium text-brand-dark dark:text-brand-cream truncate">
                            {entry.subject.name}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-stone-500 shrink-0">
                            {entry.notes.length} catatan
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-stone-300 shrink-0 ml-2">
                          {Math.round(entry.avgMastery * 100)}%
                        </p>
                      </div>
                      <ProgressBar value={entry.avgMastery} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Per-subject expanded with notes */}
          {subjectStats.length > 0 && (
            <div className="flex flex-col gap-4">
              {subjectStats.map((entry) => {
                const { bg, text, dot, border } = getColor(entry.subject.color)
                return (
                  <div
                    key={entry.subject.id}
                    className={`bg-white dark:bg-stone-900 rounded-2xl border p-5 ${border}`}
                  >
                    {/* Subject header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
                        <h3 className="font-medium text-brand-dark dark:text-brand-cream">{entry.subject.name}</h3>
                        {entry.subject.semester && (
                          <span className="text-xs text-gray-400 dark:text-stone-500">{entry.subject.semester}</span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${bg} ${text}`}>
                        {Math.round(entry.avgMastery * 100)}%
                      </span>
                    </div>

                    {/* Notes inside subject */}
                    <div className="flex flex-col gap-3">
                      {entry.notes.map((note) => (
                        <div key={note.id}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-brand-dark dark:text-brand-cream truncate">{note.title}</p>
                            <p className="text-xs font-medium text-gray-500 dark:text-stone-400 shrink-0 ml-2">
                              {Math.round(note.mastery_score * 100)}%
                            </p>
                          </div>
                          <ProgressBar value={note.mastery_score} />
                          <p className="text-xs text-gray-400 dark:text-stone-500 mt-0.5">
                            {note.days_since_review === 0
                              ? "Direview hari ini"
                              : note.last_reviewed_at
                              ? `${note.days_since_review} hari lalu`
                              : "Belum pernah direview"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {data.notes.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-gray-100 dark:border-stone-800">
              <BarChart3 className="w-12 h-12 text-gray-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-stone-500">Belum ada catatan untuk ditampilkan.</p>
            </div>
          )}
        </>
      )}
    </main>
  )
}
