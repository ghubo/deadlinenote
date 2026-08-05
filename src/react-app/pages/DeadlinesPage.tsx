import { useState } from "react"
import { Link } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UrgencyPill } from "../components/ui/UrgencyPill"
import { CalendarDays, GraduationCap } from "lucide-react"
import type { Deadline, Subject } from "../lib/types"
import { DEADLINE_TYPE_LABELS, DEADLINE_TYPE_OPTIONS } from "../lib/deadline-types"
import { fetcher } from "../lib/fetcher"
import { queryKeys } from "../lib/queryKeys"
import { dateInputToUnix, unixToDateInput } from "../lib/date"

export default function DeadlinesPage() {
  const qc = useQueryClient()

  const { data: deadlines, isLoading } = useQuery({
    queryKey: queryKeys.deadlines(),
    queryFn: () => fetcher<Deadline[]>("/deadlines"),
  })

  const { data: subjects, isLoading: isSubjectsLoading } = useQuery({
    queryKey: queryKeys.subjects(),
    queryFn: () => fetcher<Subject[]>("/subjects"),
  })

  const createDeadline = useMutation({
    mutationFn: (data: { subject_id: string; title: string; type: string; due_date: number }) =>
      fetcher<Deadline>("/deadlines", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deadlines() })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() })
    },
  })

  const deleteDeadline = useMutation({
    mutationFn: (id: string) => fetcher<{ success: boolean }>(`/deadlines/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deadlines() })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() })
    },
  })

  const updateDeadline = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string
      subject_id: string
      title: string
      type: "exam" | "assignment" | "quiz"
      due_date: number
    }) => fetcher<Deadline>(`/deadlines/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deadlines() })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() })
    },
  })

  const updateCompletion = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      fetcher<Deadline>(`/deadlines/${id}/completion`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deadlines() })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() })
    },
  })

  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    subject_id: "",
    title: "",
    type: "exam",
    due_date: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    subject_id: "",
    title: "",
    type: "exam",
    due_date: "",
  })
  const hasSubjects = (subjects?.length ?? 0) > 0
  const noSubjects = subjects?.length === 0

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!hasSubjects || !form.subject_id || !form.title || !form.due_date) return
    const dueDate = dateInputToUnix(form.due_date)
    await createDeadline.mutateAsync({
      subject_id: form.subject_id,
      title: form.title,
      type: form.type,
      due_date: dueDate,
    })
    setAdding(false)
    setForm({ subject_id: "", title: "", type: "exam", due_date: "" })
  }

  function startEdit(deadline: Deadline) {
    setEditingId(deadline.id)
    setEditForm({
      subject_id: deadline.subject_id,
      title: deadline.title,
      type: deadline.type,
      due_date: unixToDateInput(deadline.due_date),
    })
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId || !editForm.subject_id || !editForm.title || !editForm.due_date) return
    const dueDate = dateInputToUnix(editForm.due_date)
    await updateDeadline.mutateAsync({
      id: editingId,
      subject_id: editForm.subject_id,
      title: editForm.title,
      type: editForm.type as "exam" | "assignment" | "quiz",
      due_date: dueDate,
    })
    setEditingId(null)
  }

  const now = Math.floor(Date.now() / 1000)

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full min-w-0">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest">Jadwal</p>
            <h1 className="text-xl md:text-2xl font-semibold text-brand-dark dark:text-brand-cream mt-1">Deadline</h1>
          </div>
          {noSubjects ? (
            <Link
              to="/subjects"
              className="px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:opacity-90 shrink-0"
            >
              Tambah Mata Kuliah
            </Link>
          ) : (
            <button
              onClick={() => setAdding(true)}
              disabled={!hasSubjects}
              className="px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
            >
              + Tambah
            </button>
          )}
        </header>

        {adding && hasSubjects && (
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5 mb-6 flex flex-col gap-3"
          >
            <h2 className="font-medium text-brand-dark dark:text-brand-cream">Deadline Baru</h2>
            <div>
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Mata kuliah</label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}
                required
                className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
              >
                <option value="">Pilih mata kuliah...</option>
                {subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Nama ujian / tugas</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="mis. UTS Kalkulus II"
                required
                className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Jenis</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
              >
                {DEADLINE_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Tanggal</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                required
                className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createDeadline.isPending}
                className="px-4 py-2 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark text-sm rounded-lg hover:opacity-80 disabled:opacity-50"
              >
                {createDeadline.isPending ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-stone-800 text-gray-600 dark:text-stone-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-stone-700"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {isLoading && (
          <div className="text-center py-20 text-gray-400 dark:text-stone-500">Memuat...</div>
        )}

        {!isLoading && !isSubjectsLoading && noSubjects && (
          <div className="text-center py-20">
            <GraduationCap className="w-12 h-12 text-gray-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="font-medium text-brand-dark dark:text-brand-cream mb-1">Belum ada mata kuliah</p>
            <p className="text-sm text-gray-400 dark:text-stone-500 mb-5">
              Tambahkan mata kuliah terlebih dahulu sebelum membuat deadline.
            </p>
            <Link
              to="/subjects"
              className="inline-block px-6 py-2.5 bg-brand-red text-white text-sm rounded-lg hover:opacity-90"
            >
              Tambah Mata Kuliah
            </Link>
          </div>
        )}

        {!isLoading && deadlines?.length === 0 && hasSubjects && (
          <div className="text-center py-20">
            <CalendarDays className="w-12 h-12 text-gray-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-stone-500 mb-4">Belum ada deadline.</p>
            <button
              onClick={() => setAdding(true)}
              className="px-6 py-2.5 bg-brand-red text-white text-sm rounded-lg hover:opacity-90"
            >
              Tambah deadline pertama
            </button>
          </div>
        )}
        {(createDeadline.isError || updateDeadline.isError || deleteDeadline.isError || updateCompletion.isError) && (
          <div className="mb-4 rounded-lg border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-brand-red">
            {createDeadline.error?.message ||
              updateDeadline.error?.message ||
              deleteDeadline.error?.message ||
              updateCompletion.error?.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {deadlines?.map((d) => {
            const daysUntil = Math.round((d.due_date - now) / 86400)
            const isCompleted = d.completed_at != null
            return (
              <div
                key={d.id}
                className={`bg-white dark:bg-stone-900 rounded-xl border p-4 flex items-center justify-between gap-3 transition-colors ${
                  isCompleted
                    ? "border-teal-100 dark:border-teal-950/50 opacity-75"
                    : "border-gray-100 dark:border-stone-800"
                }`}
              >
                {editingId === d.id ? (
                  <form onSubmit={handleUpdate} className="flex-1 min-w-0 flex flex-col gap-2">
                    <select
                      value={editForm.subject_id}
                      onChange={(e) => setEditForm((f) => ({ ...f, subject_id: e.target.value }))}
                      required
                      className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
                    >
                      <option value="">Pilih mata kuliah...</option>
                      {subjects?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      required
                      className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                        className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
                      >
                        {DEADLINE_TYPE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={editForm.due_date}
                        onChange={(e) => setEditForm((f) => ({ ...f, due_date: e.target.value }))}
                        required
                        className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updateDeadline.isPending}
                        className="px-3 py-1.5 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark text-xs rounded-lg hover:opacity-80 disabled:opacity-50"
                      >
                        {updateDeadline.isPending ? "Menyimpan..." : "Simpan"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-stone-800 text-gray-600 dark:text-stone-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-stone-700"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-1 min-w-0 items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      disabled={updateCompletion.isPending}
                      onChange={(e) =>
                        updateCompletion.mutate({ id: d.id, completed: e.target.checked })
                      }
                      aria-label={
                        isCompleted
                          ? `Tandai ${d.title} belum selesai`
                          : `Tandai ${d.title} selesai`
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-red accent-brand-red disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <p
                          className={`font-medium text-sm truncate ${
                            isCompleted
                              ? "text-gray-400 dark:text-stone-500 line-through"
                              : "text-brand-dark dark:text-brand-cream"
                          }`}
                        >
                          {d.title}
                        </p>
                        {isCompleted && (
                          <span className="shrink-0 rounded-full bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:text-teal-300">
                            Selesai
                          </span>
                        )}
                      </div>
                    <p className="text-xs text-gray-400 dark:text-stone-500 mt-0.5 truncate">
                      {d.subject_name} · {DEADLINE_TYPE_LABELS[d.type] ?? d.type}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-stone-500 mt-0.5">
                      {new Date(d.due_date * 1000).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  {editingId === d.id || isCompleted ? null : <UrgencyPill daysUntil={daysUntil} />}
                  {editingId === d.id ? (
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-red px-2 py-1 rounded transition-colors"
                    >
                      Tutup
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(d)}
                        className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-dark dark:hover:text-brand-cream px-2 py-1 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteDeadline.mutate(d.id)}
                        disabled={deleteDeadline.isPending}
                        className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-red px-2 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
    </main>
  )
}
