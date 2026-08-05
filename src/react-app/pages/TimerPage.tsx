import { PomodoroTimer } from "../components/app/PomodoroTimer"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Timer } from "lucide-react"
import type { PomodoroSession } from "../lib/types"
import { fetcher } from "../lib/fetcher"
import { queryKeys } from "../lib/queryKeys"

const statusLabel: Record<string, string> = {
  completed: "Selesai",
  active: "Aktif",
  abandoned: "Dibatalkan",
}

const statusStyle: Record<string, string> = {
  completed: "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300",
  active: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  abandoned: "bg-gray-100 dark:bg-stone-800 text-gray-500 dark:text-stone-400",
}

export default function TimerPage() {
  const qc = useQueryClient()
  const { data: sessions, isPending: isLoadingSessions } = useQuery({
    queryKey: queryKeys.sessions(),
    queryFn: () => fetcher<PomodoroSession[]>("/sessions"),
  })
  const deleteSession = useMutation({
    mutationFn: (id: string) => fetcher<{ success: boolean }>(`/sessions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sessions() }),
  })

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-2xl mx-auto w-full min-w-0">
        <header className="mb-8">
          <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest">Timer</p>
          <h1 className="text-xl md:text-2xl font-semibold text-brand-dark dark:text-brand-cream mt-1">Pomodoro</h1>
        </header>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-gray-100 dark:border-stone-800 p-6 md:p-8 flex flex-col items-center mb-8">
          <PomodoroTimer />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-brand-dark dark:text-brand-cream">Riwayat Sesi</h2>
            {!isLoadingSessions && sessions && sessions.length > 0 && (
              <p className="text-xs text-gray-400 dark:text-stone-500">{sessions.length} sesi</p>
            )}
          </div>
          {isLoadingSessions && (
            <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800">
              <p className="text-sm text-gray-400 dark:text-stone-500">Memuat...</p>
            </div>
          )}
          {!isLoadingSessions && sessions?.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800">
              <Timer className="w-10 h-10 text-gray-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-stone-500">Belum ada sesi tercatat.</p>
              <p className="text-xs text-gray-400 dark:text-stone-500 mt-1">Mulai timer di atas untuk memulai sesi.</p>
            </div>
          )}
          {!isLoadingSessions && (
            <div className="flex flex-col gap-2">
            {sessions?.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-dark dark:text-brand-cream">
                    {s.duration_minutes} menit
                  </p>
                  {(s.note_title || s.subject_name) && (
                    <p className="text-xs text-gray-500 dark:text-stone-400 truncate">
                      {s.note_title ?? "Sesi belajar"}{s.subject_name ? ` · ${s.subject_name}` : ""}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-stone-500">
                    {new Date(s.started_at * 1000).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      statusStyle[s.status] ?? "bg-gray-100 dark:bg-stone-800 text-gray-500 dark:text-stone-400"
                    }`}
                  >
                    {statusLabel[s.status] ?? s.status}
                  </span>
                  <button
                    onClick={() => deleteSession.mutate(s.id)}
                    disabled={deleteSession.isPending}
                    className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-red px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
    </main>
  )
}
