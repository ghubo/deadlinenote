import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router"
import { DeadlineCard } from "../components/app/DeadlineCard"
import { StatCard } from "../components/ui/StatCard"
import { ProgressBar } from "../components/ui/ProgressBar"
import { PomodoroTimer } from "../components/app/PomodoroTimer"
import { ReminderAlert } from "../components/app/ReminderAlert"
import { useSession } from "../lib/auth-client"
import { fetcher } from "../lib/fetcher"
import { queryKeys } from "../lib/queryKeys"
import { timezoneOffsetQuery } from "../lib/date"
import type { DashboardData } from "../lib/types"

// Trigger reminder only after a note has been unattended for several days.
const MIN_DAYS_SINCE_REVIEW_FOR_REMINDER = 3
// Limit reminder to near-term deadlines where action is most urgent.
const MAX_DAYS_UNTIL_DEADLINE_FOR_REMINDER = 7

function masteryLabel(score: number): string {
  if (score >= 0.8) return "Dikuasai"
  if (score >= 0.5) return "Sedang"
  if (score >= 0.2) return "Perlu review"
  return "Belum belajar"
}

function masteryBadge(score: number): string {
  if (score >= 0.8) return "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
  if (score >= 0.5) return "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300"
  return "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300"
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () =>
      fetcher<DashboardData>(`/dashboard?${timezoneOffsetQuery()}`),
  })
  const [dismissedReminderKey, setDismissedReminderKey] = useState<
    string | null
  >(null)

  const reminderCandidate = useMemo(() => {
    if (!data) return null

    const nearestDeadlineBySubject = new Map<
      string,
      DashboardData["deadlines"][number]
    >()

    for (const deadline of data.deadlines) {
      if (
        deadline.days_until < 0 ||
        deadline.days_until > MAX_DAYS_UNTIL_DEADLINE_FOR_REMINDER
      ) {
        continue
      }

      const current = nearestDeadlineBySubject.get(deadline.subject_id)

      if (!current || deadline.days_until < current.days_until) {
        nearestDeadlineBySubject.set(deadline.subject_id, deadline)
      }
    }

    for (const note of data.notes) {
      if (note.days_since_review < MIN_DAYS_SINCE_REVIEW_FOR_REMINDER) {
        continue
      }

      const deadline = nearestDeadlineBySubject.get(note.subject_id)
      if (!deadline) continue

      return {
        key: `${note.id}:${deadline.id}:${deadline.days_until}`,
        noteName: note.title,
        daysUntil: deadline.days_until,
        deadlineType: deadline.type,
      }
    }

    return null
  }, [data])

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full min-w-0">
      <header className="mb-6">
        <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest">
          Dashboard
        </p>
        <h1 className="text-xl md:text-2xl font-semibold text-brand-dark dark:text-brand-cream mt-1">
          Selamat datang, {session?.user?.name?.split(" ")[0] ?? "Mahasiswa"} 👋
        </h1>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-gray-400 dark:text-stone-500">
          Memuat...
        </div>
      )}

      {data && (
        <>
          {reminderCandidate &&
            dismissedReminderKey !== reminderCandidate.key && (
              <div className="mb-4">
                <ReminderAlert
                  noteName={reminderCandidate.noteName}
                  daysUntil={reminderCandidate.daysUntil}
                  deadlineType={reminderCandidate.deadlineType}
                  onDismiss={() =>
                    setDismissedReminderKey(reminderCandidate.key)
                  }
                />
              </div>
            )}
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <StatCard
              label="Menit belajar hari ini"
              value={data.stats.totalMinutes}
            />
            <StatCard label="Sesi Pomodoro" value={data.stats.sessions} />
            <StatCard
              label="Catatan aktif"
              value={data.notes.length}
              className="col-span-2 md:col-span-1"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Prioritized notes */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-brand-dark dark:text-brand-cream">
                  Prioritas Belajar
                </h2>
                <Link
                  to="/notes"
                  className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-red"
                >
                  Lihat semua →
                </Link>
              </div>
              {data.notes.length === 0 && (
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-6 text-center">
                  <p className="text-sm text-gray-400 dark:text-stone-500 mb-2">
                    Belum ada catatan.
                  </p>
                  <Link
                    to="/notes"
                    className="text-sm text-brand-red hover:underline"
                  >
                    Buat catatan pertama →
                  </Link>
                </div>
              )}
              {data.notes.slice(0, 5).map((note) => (
                <Link key={note.id} to={`/notes/${note.id}`}>
                  <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-brand-dark dark:text-brand-cream text-sm truncate">
                          {note.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-stone-500 mt-0.5 truncate">
                          {note.subject_name}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${masteryBadge(note.mastery_score)}`}
                      >
                        {masteryLabel(note.mastery_score)}
                      </span>
                    </div>
                    <ProgressBar value={note.mastery_score} className="mt-3" />
                    <p className="text-xs text-gray-400 dark:text-stone-500 mt-1.5">
                      {note.days_since_review === 0
                        ? "Direview hari ini"
                        : `${note.days_since_review} hari tidak direview`}
                      {note.next_review_at
                        ? ` · Next ${new Date(note.next_review_at * 1000).toLocaleDateString("id-ID")}`
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-4">
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5">
                <h2 className="font-medium text-brand-dark dark:text-brand-cream mb-4 text-sm">
                  Timer Belajar
                </h2>
                <PomodoroTimer />
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium text-brand-dark dark:text-brand-cream text-sm">
                    Deadline Terdekat
                  </h2>
                  <Link
                    to="/deadlines"
                    className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-red"
                  >
                    Semua →
                  </Link>
                </div>
                <div className="flex flex-col gap-2">
                  {data.deadlines.slice(0, 3).map((d) => (
                    <DeadlineCard key={d.id} deadline={d} />
                  ))}
                  {data.deadlines.length === 0 && (
                    <div className="text-center py-3">
                      <p className="text-xs text-gray-400 dark:text-stone-500 mb-2">
                        Belum ada deadline.
                      </p>
                      <Link
                        to="/deadlines"
                        className="text-xs text-brand-red hover:underline"
                      >
                        + Tambah deadline
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
