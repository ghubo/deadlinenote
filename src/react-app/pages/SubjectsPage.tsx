import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { COLOR_OPTIONS, getColor } from "../lib/colors"
import { BookOpen } from "lucide-react"
import type { Subject } from "../lib/types"
import { fetcher } from "../lib/fetcher"
import { queryKeys } from "../lib/queryKeys"

const COLOR_META = COLOR_OPTIONS.map((val) => {
  const c = getColor(val)
  const labels: Record<string, string> = {
    blue: "Biru", red: "Merah", green: "Hijau", purple: "Ungu",
    orange: "Oranye", teal: "Tosca", pink: "Merah Muda", yellow: "Kuning",
  }
  return { value: val, label: labels[val] ?? val, ...c }
})

export default function SubjectsPage() {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: "", color: "blue", semester: "" })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const qc = useQueryClient()
  const { data: subjects, isLoading } = useQuery({
    queryKey: queryKeys.subjects(),
    queryFn: () => fetcher<Subject[]>("/subjects"),
  })
  const createSubject = useMutation({
    mutationFn: (body: { name: string; color: string; semester: string | null }) =>
      fetcher<Subject>("/subjects", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.subjects() }),
  })
  const deleteSubject = useMutation({
    mutationFn: (id: string) => fetcher<{ success: boolean }>(`/subjects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setDeleteId(null)
      qc.invalidateQueries({ queryKey: queryKeys.subjects() })
    },
  })
  const updateSubject = useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string
      name: string
      color: string
      semester: string | null
    }) => fetcher<Subject>(`/subjects/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.subjects() }),
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", color: "blue", semester: "" })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    createSubject.mutate(
      { name: form.name.trim(), color: form.color, semester: form.semester.trim() || null },
      { onSuccess: () => { setAdding(false); setForm({ name: "", color: "blue", semester: "" }) } },
    )
  }

  function startEdit(subject: Subject) {
    setEditingId(subject.id)
    setEditForm({
      name: subject.name,
      color: subject.color,
      semester: subject.semester ?? "",
    })
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId || !editForm.name.trim()) return
    await updateSubject.mutateAsync({
      id: editingId,
      name: editForm.name.trim(),
      color: editForm.color,
      semester: editForm.semester.trim() || null,
    })
    setEditingId(null)
  }

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full min-w-0">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest">Kelola</p>
            <h1 className="text-xl md:text-2xl font-semibold text-brand-dark dark:text-brand-cream mt-1">Mata Kuliah</h1>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:opacity-90 shrink-0"
          >
            + Tambah
          </button>
        </header>

        {adding && (
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5 mb-6 flex flex-col gap-4"
          >
            <h2 className="font-medium text-brand-dark dark:text-brand-cream">Mata Kuliah Baru</h2>
            <div>
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Nama mata kuliah</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="mis. Kalkulus II"
                required
                className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-2 block">Pilih warna</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_META.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                    className={`w-8 h-8 rounded-full transition-all ${c.dot} ${
                      form.color === c.value
                        ? "ring-2 ring-offset-2 dark:ring-offset-stone-950 ring-gray-400 dark:ring-stone-400 scale-110"
                        : "hover:scale-105 opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-stone-500 mt-1.5">
                Dipilih: <span className="font-medium text-brand-dark dark:text-brand-cream">{COLOR_META.find(c => c.value === form.color)?.label}</span>
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Semester (opsional)</label>
              <input
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                placeholder="mis. Ganjil 2025"
                className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createSubject.isPending}
                className="px-4 py-2 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark text-sm rounded-lg hover:opacity-80 disabled:opacity-50"
              >
                {createSubject.isPending ? "Menyimpan..." : "Simpan"}
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

        {!isLoading && subjects?.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-stone-500 mb-4">Belum ada mata kuliah.</p>
            <button
              onClick={() => setAdding(true)}
              className="px-6 py-2.5 bg-brand-red text-white text-sm rounded-lg hover:opacity-90"
            >
              Tambah mata kuliah pertama
            </button>
          </div>
        )}
        {deleteSubject.isError && (
          <div className="mb-4 rounded-lg border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-brand-red">
            {deleteSubject.error.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {subjects?.map((s) => {
            const c = getColor(s.color)
            return (
              <div
                key={s.id}
                className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-4 flex items-center justify-between gap-3"
              >
                {editingId === s.id ? (
                  <form onSubmit={handleUpdate} className="flex-1 min-w-0 flex flex-col gap-2">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_META.map((colorMeta) => (
                        <button
                          key={colorMeta.value}
                          type="button"
                          title={colorMeta.label}
                          onClick={() => setEditForm((f) => ({ ...f, color: colorMeta.value }))}
                          className={`w-7 h-7 rounded-full transition-all ${colorMeta.dot} ${
                            editForm.color === colorMeta.value
                              ? "ring-2 ring-offset-2 dark:ring-offset-stone-950 ring-gray-400 dark:ring-stone-400 scale-110"
                              : "hover:scale-105 opacity-70 hover:opacity-100"
                          }`}
                        />
                      ))}
                    </div>
                    <input
                      value={editForm.semester}
                      onChange={(e) => setEditForm((f) => ({ ...f, semester: e.target.value }))}
                      placeholder="Semester (opsional)"
                      className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updateSubject.isPending}
                        className="px-3 py-1.5 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark text-xs rounded-lg hover:opacity-80 disabled:opacity-50"
                      >
                        {updateSubject.isPending ? "Menyimpan..." : "Simpan"}
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
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 ${c.dot}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-brand-dark dark:text-brand-cream text-sm truncate">{s.name}</p>
                      {s.semester && (
                        <p className="text-xs text-gray-400 dark:text-stone-500 mt-0.5">{s.semester}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  {editingId === s.id ? null : (
                    <span className={`hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                      {COLOR_META.find(cc => cc.value === s.color)?.label ?? s.color}
                    </span>
                  )}
                  {editingId === s.id ? (
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-red px-2 py-1 rounded transition-colors"
                    >
                      Tutup
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(s)}
                        className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-dark dark:hover:text-brand-cream px-2 py-1 rounded transition-colors"
                      >
                        Edit
                      </button>
                      {deleteId === s.id ? (
                        <>
                          <button
                            onClick={() => deleteSubject.mutate(s.id)}
                            disabled={deleteSubject.isPending}
                            className="text-xs text-brand-red px-2 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            {deleteSubject.isPending ? "Menghapus..." : "Yakin hapus"}
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            disabled={deleteSubject.isPending}
                            className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-dark dark:hover:text-brand-cream px-2 py-1 rounded transition-colors"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteId(s.id)}
                          disabled={deleteSubject.isPending}
                          className="text-xs text-gray-400 dark:text-stone-500 hover:text-brand-red px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      )}
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
