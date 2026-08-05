import { useState } from "react"
import { Link } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Subject, Note } from "../lib/types"
import { getColor } from "../lib/colors"
import { GraduationCap, FileText } from "lucide-react"
import { fetcher } from "../lib/fetcher"
import { queryKeys } from "../lib/queryKeys"

export default function NotesPage() {
  const qc = useQueryClient()

  const { data: notes, isLoading } = useQuery({
    queryKey: queryKeys.notes(),
    queryFn: () => fetcher<Note[]>("/notes"),
  })

  const { data: subjects, isLoading: isSubjectsLoading } = useQuery({
    queryKey: queryKeys.subjects(),
    queryFn: () => fetcher<Subject[]>("/subjects"),
  })

  const createNote = useMutation({
    mutationFn: (data: { subject_id: string; title: string; content: string; tags: string[] }) =>
      fetcher<Note>("/notes", {
        method: "POST",
        body: JSON.stringify({
          subject_id: data.subject_id,
          title: data.title,
          content: data.content,
          tags: data.tags.length > 0 ? data.tags : null,
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notes() }),
  })
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ subject_id: "", title: "", tags: "" })
  const hasSubjects = (subjects?.length ?? 0) > 0
  const noSubjects = subjects?.length === 0

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject_id || !form.title) return
    await createNote.mutateAsync({
      subject_id: form.subject_id,
      title: form.title,
      content: "",
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
    setCreating(false)
    setForm({ subject_id: "", title: "", tags: "" })
  }

  // Group notes by subject
  const grouped: { subject: Subject; notes: Note[] }[] = []
  if (notes && subjects) {
    for (const subject of subjects) {
      const subjectNotes = notes.filter((n) => n.subject_id === subject.id)
      if (subjectNotes.length > 0) {
        grouped.push({ subject, notes: subjectNotes })
      }
    }
    // Notes without a matching subject (edge case)
    const knownSubjectIds = new Set(subjects.map((s) => s.id))
    const orphaned = notes.filter((n) => !knownSubjectIds.has(n.subject_id))
    if (orphaned.length > 0) {
      grouped.push({
        subject: { id: "", user_id: "", name: "Lainnya", color: "blue", semester: null },
        notes: orphaned,
      })
    }
  }

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full min-w-0">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest">Catatan</p>
            <h1 className="text-xl md:text-2xl font-semibold text-brand-dark dark:text-brand-cream mt-1">Semua Catatan</h1>
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
              onClick={() => setCreating(true)}
              disabled={!hasSubjects}
              className="px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
            >
              + Catatan Baru
            </button>
          )}
        </header>

        {creating && hasSubjects && (
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5 mb-6 flex flex-col gap-3"
          >
            <h2 className="font-medium text-brand-dark dark:text-brand-cream">Catatan Baru</h2>
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
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Judul catatan</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="mis. Pertemuan 3 — Integral"
                required
                className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Tags (opsional)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="mis. uts, bab-2"
                className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createNote.isPending}
                className="px-4 py-2 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark text-sm rounded-lg hover:opacity-80 disabled:opacity-50"
              >
                {createNote.isPending ? "Membuat..." : "Buat"}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
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
              Tambahkan mata kuliah terlebih dahulu sebelum membuat catatan.
            </p>
            <Link
              to="/subjects"
              className="inline-block px-6 py-2.5 bg-brand-red text-white text-sm rounded-lg hover:opacity-90"
            >
              Tambah Mata Kuliah
            </Link>
          </div>
        )}

        {notes?.length === 0 && subjects && subjects.length > 0 && !isLoading && (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-stone-500 mb-4">Belum ada catatan.</p>
            <button
              onClick={() => setCreating(true)}
              className="px-6 py-2.5 bg-brand-red text-white text-sm rounded-lg hover:opacity-90"
            >
              Buat catatan pertama
            </button>
          </div>
        )}
        {createNote.isError && (
          <div className="mb-4 rounded-lg border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-brand-red">
            {createNote.error.message}
          </div>
        )}

        <div className="flex flex-col gap-8">
          {grouped.map(({ subject, notes: subjectNotes }) => {
            const { dot, bg, text } = getColor(subject.color)
            return (
              <div key={subject.id}>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                  <h2 className="font-medium text-brand-dark dark:text-brand-cream">{subject.name}</h2>
                  {subject.semester && (
                    <span className="text-xs text-gray-400 dark:text-stone-500">· {subject.semester}</span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${bg} ${text}`}>
                    {subjectNotes.length}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {subjectNotes.map((note) => (
                    <Link
                      key={note.id}
                      to={`/notes/${note.id}`}
                      className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-4 hover:border-gray-200 transition-colors block"
                    >
                      <p className="font-medium text-brand-dark dark:text-brand-cream text-sm truncate">{note.title}</p>
                      {note.tags && (() => {
                        try {
                          const tags = JSON.parse(note.tags) as string[]
                          return tags.length > 0 ? (
                            <div className="flex gap-1.5 mt-2.5 flex-wrap">
                              {tags.slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center rounded-full border border-brand-red/20 bg-brand-red/10 px-2.5 py-1 text-xs font-medium leading-none text-brand-dark dark:text-brand-cream"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null
                        } catch { return null }
                      })()}
                      <div className="mt-3 h-1.5 bg-gray-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-red rounded-full"
                          style={{ width: `${Math.round(note.mastery_score * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-stone-500 mt-1">
                        {Math.round(note.mastery_score * 100)}% dikuasai
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
    </main>
  )
}
