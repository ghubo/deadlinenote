import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { useParams, useNavigate } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { NoteEditor } from "../components/app/NoteEditor"
import { FlashcardStudy } from "../components/app/FlashcardStudy"
import { SmartSummaryView } from "../components/app/SmartSummaryView"
import { PomodoroTimer } from "../components/app/PomodoroTimer"
import type { Flashcard, Note, SmartSummary } from "../lib/types"
import { Layers, Pencil, Plus, Sparkles, X } from "lucide-react"
import { ApiError, fetcher } from "../lib/fetcher"
import { queryKeys } from "../lib/queryKeys"

type StudyMode = "edit" | "flashcards" | "summary"
type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error"

const AUTOSAVE_DELAY_MS = 1000

const GENERATE_ERROR_MESSAGES: Record<string, string> = {
  ai_invalid_response: "Generator menghasilkan format tidak valid. Coba lagi.",
  ai_empty_response: "Generator tidak mengembalikan hasil. Coba lagi.",
  ai_generation_failed:
    "Generator sedang bermasalah. Coba lagi beberapa saat lagi.",
}

function getGenerateErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 502 && error.code in GENERATE_ERROR_MESSAGES) {
      return GENERATE_ERROR_MESSAGES[error.code]
    }
    return fallback
  }
  return `${fallback} Periksa koneksi internet Anda lalu coba lagi.`
}

function parseNoteTags(tags: string | null | undefined) {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function tagsEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false
  return left.every((tag, index) => tag === right[index])
}

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: note, isLoading } = useQuery({
    queryKey: queryKeys.note(id ?? ""),
    queryFn: () => fetcher<Note>(`/notes/${id}`),
    enabled: !!id,
  })
  const updateNote = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string
      title: string
      content: string
      tags?: string[]
    }) =>
      fetcher<Note>(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedNote, { id }) => {
      qc.setQueryData(queryKeys.note(id), updatedNote)
      qc.invalidateQueries({ queryKey: queryKeys.notes(), exact: true })
    },
  })
  const deleteNote = useMutation({
    mutationFn: (noteId: string) =>
      fetcher<{ success: boolean }>(`/notes/${noteId}`, { method: "DELETE" }),
    onSuccess: () => {
      navigate("/notes")
      qc.invalidateQueries({ queryKey: queryKeys.notes(), exact: true })
    },
  })
  const generateSummary = useMutation({
    mutationFn: (noteId: string) =>
      fetcher<SmartSummary>(`/notes/${noteId}/generate-summary`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
  })
  const generateFlashcards = useMutation({
    mutationFn: (noteId: string) =>
      fetcher<Flashcard[]>(`/notes/${noteId}/generate-flashcards`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
  })
  const [studyMode, setStudyMode] = useState<StudyMode>("edit")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [tagAnnouncement, setTagAnnouncement] = useState("")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([])
  const [generatedSummary, setGeneratedSummary] =
    useState<SmartSummary | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const savedSnapshotRef = useRef<{
    noteId: string
    title: string
    content: string
    tags: string[]
  } | null>(null)
  const latestDraftRef = useRef({ title: "", content: "", tags: [] as string[] })
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleDelete() {
    await deleteNote.mutateAsync(id!)
  }

  const parsedTags = useMemo(() => {
    return parseNoteTags(note?.tags)
  }, [note?.tags])

  const hasUnsavedChanges = useMemo(() => {
    const saved = savedSnapshotRef.current
    if (!saved || saved.noteId !== note?.id) return false
    return (
      title !== saved.title ||
      content !== saved.content ||
      !tagsEqual(tags, saved.tags)
    )
  }, [content, note?.id, tags, title])

  useEffect(() => {
    latestDraftRef.current = { title, content, tags }
  }, [content, tags, title])

  useEffect(() => {
    if (!note) return
    setTitle(note.title)
    setContent(note.content)
    setTags(parsedTags)
    setTagInput("")
    setSaveStatus("idle")
    setSaveError(null)
    savedSnapshotRef.current = {
      noteId: note.id,
      title: note.title,
      content: note.content,
      tags: parsedTags,
    }
  }, [note?.id])

  const clearAutosaveTimeout = useCallback(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
      autosaveTimeoutRef.current = null
    }
  }, [])

  const saveDraft = useCallback(
    async (source: "auto" | "manual") => {
      if (!id || !title.trim() || !hasUnsavedChanges) return

      clearAutosaveTimeout()
      const submitted = { title, content, tags: [...tags] }
      setSaveStatus("saving")
      setSaveError(null)

      try {
        const updatedNote = await updateNote.mutateAsync({
          id,
          title: submitted.title,
          content: submitted.content,
          tags: submitted.tags,
        })
        const updatedTags = parseNoteTags(updatedNote.tags)
        savedSnapshotRef.current = {
          noteId: updatedNote.id,
          title: updatedNote.title,
          content: updatedNote.content,
          tags: updatedTags,
        }
        const latestDraft = latestDraftRef.current
        if (
          latestDraft.title === submitted.title &&
          latestDraft.content === submitted.content &&
          tagsEqual(latestDraft.tags, submitted.tags)
        ) {
          setTitle(updatedNote.title)
          setContent(updatedNote.content)
          setTags(updatedTags)
        }
        setSaveStatus("saved")
      } catch (error) {
        setSaveStatus("error")
        setSaveError(
          source === "auto"
            ? "Gagal autosave. Coba klik Simpan."
            : error instanceof Error
              ? error.message
              : "Gagal menyimpan catatan."
        )
      }
    },
    [
      clearAutosaveTimeout,
      content,
      hasUnsavedChanges,
      id,
      tags,
      title,
      updateNote,
    ]
  )

  useEffect(() => {
    clearAutosaveTimeout()
    if (
      studyMode !== "edit" ||
      !hasUnsavedChanges ||
      !title.trim() ||
      updateNote.isPending
    ) {
      if (!hasUnsavedChanges && saveStatus !== "saved") {
        setSaveStatus("idle")
        setSaveError(null)
      }
      return
    }

    setSaveStatus("pending")
    setSaveError(null)
    autosaveTimeoutRef.current = setTimeout(() => {
      void saveDraft("auto")
    }, AUTOSAVE_DELAY_MS)

    return clearAutosaveTimeout
  }, [
    clearAutosaveTimeout,
    hasUnsavedChanges,
    saveDraft,
    saveStatus,
    studyMode,
    title,
    updateNote.isPending,
  ])

  useEffect(() => {
    return clearAutosaveTimeout
  }, [clearAutosaveTimeout])

  async function handleManualSave() {
    await saveDraft("manual")
  }

  function appendTags(values: string[]) {
    setTags((prev) => {
      const existingTags = new Set(prev)
      const additions: string[] = []
      for (const value of values) {
        const cleaned = value.trim()
        if (!cleaned || existingTags.has(cleaned)) continue
        existingTags.add(cleaned)
        additions.push(cleaned)
      }
      if (additions.length === 0) return prev
      return [...prev, ...additions]
    })
  }

  function handleAddTag() {
    const nextTag = normalizedTagInput
    if (!nextTag) return
    appendTags([nextTag])
    setTagInput("")
  }

  function handleRemoveTag(index: number) {
    const removedTag = tags[index]
    setTags((prev) => prev.filter((_, i) => i !== index))
    if (removedTag) {
      setTagAnnouncement(`Tag ${removedTag} dihapus`)
    }
  }

  function handleTagInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      handleAddTag()
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setTagInput("")
      return
    }
    if (event.key === "Backspace" && !tagInput && tags.length > 0) {
      event.preventDefault()
      const removedTag = tags[tags.length - 1]
      setTags((prev) => prev.slice(0, -1))
      if (removedTag) {
        setTagAnnouncement(`Tag ${removedTag} dihapus`)
      }
    }
  }

  function handleTagInputChange(value: string) {
    if (!value.includes(",")) {
      setTagInput(value)
      return
    }
    const parts = value.split(",")
    const currentInput = parts.pop() ?? ""
    appendTags(parts)
    setTagInput(currentInput)
  }

  const normalizedTagInput = tagInput.trim()

  function handleReturnToEdit() {
    setStudyMode("edit")
    setGenerateError(null)
  }

  async function handleStartSummary() {
    if (!note) return

    setGenerateError(null)
    try {
      const summary = await generateSummary.mutateAsync(note.id)
      setGeneratedSummary(summary)
      setStudyMode("summary")
    } catch (error) {
      setGenerateError(
        getGenerateErrorMessage(error, "Gagal membuat Smart Summary.")
      )
      if (!generatedSummary) {
        setStudyMode("edit")
      }
    }
  }

  async function handleStartFlashcards() {
    if (!note) return

    setGenerateError(null)
    try {
      const flashcards = await generateFlashcards.mutateAsync(note.id)
      setGeneratedFlashcards(flashcards)
      setStudyMode("flashcards")
    } catch (error) {
      setGenerateError(getGenerateErrorMessage(error, "Gagal membuat flashcard."))
      setGeneratedFlashcards([])
      setStudyMode("edit")
    }
  }

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full min-w-0">
      {isLoading && (
        <div className="text-center py-20 text-gray-400 dark:text-stone-500">Memuat...</div>
      )}
      {note && (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-xs uppercase tracking-widest text-gray-400 dark:text-stone-500">
                {note.subject_name}
              </p>
              <div className="flex shrink-0 items-center gap-2 sm:hidden">
                {studyMode !== "edit" && (
                  <button
                    onClick={handleReturnToEdit}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-dark dark:border-brand-cream bg-brand-dark dark:bg-brand-cream px-2.5 py-1.5 text-xs text-white dark:text-brand-dark"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Mode Edit
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-lg border border-gray-200 dark:border-stone-700 px-3 py-1.5 text-xs text-brand-red hover:border-brand-red"
                >
                  Hapus
                </button>
              </div>
            </div>
            <div
              className={`gap-2 ${
                studyMode === "edit"
                  ? "grid w-full grid-cols-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end"
                  : "hidden sm:flex sm:flex-wrap sm:justify-end"
              }`}
            >
              {studyMode === "edit" ? (
                <>
                  <button
                    onClick={handleStartFlashcards}
                    disabled={
                      generateFlashcards.isPending || generateSummary.isPending
                    }
                    className="inline-flex w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-stone-700 px-2 py-1.5 text-[11px] text-gray-600 dark:text-stone-300 hover:border-brand-dark dark:hover:border-brand-cream disabled:opacity-50 sm:w-auto sm:px-3 sm:text-xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {generateFlashcards.isPending
                      ? "Membuat..."
                      : "Generate Flashcard"}
                  </button>
                  <button
                    onClick={handleStartSummary}
                    disabled={
                      generateSummary.isPending || generateFlashcards.isPending
                    }
                    className="inline-flex w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-stone-700 px-2 py-1.5 text-[11px] text-gray-600 dark:text-stone-300 hover:border-brand-dark dark:hover:border-brand-cream disabled:opacity-50 sm:w-auto sm:px-3 sm:text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {generateSummary.isPending
                      ? "Membuat..."
                      : "Smart Summary"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleReturnToEdit}
                  className="hidden items-center gap-1.5 rounded-lg border border-brand-dark dark:border-brand-cream bg-brand-dark dark:bg-brand-cream px-3 py-1.5 text-xs text-white dark:text-brand-dark sm:inline-flex"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Mode Edit
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(true)}
                className="hidden rounded-lg border border-gray-200 dark:border-stone-700 px-3 py-1.5 text-xs text-brand-red hover:border-brand-red sm:inline-flex"
              >
                Hapus
              </button>
            </div>
          </div>

          {/* Mastery bar always visible */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-3 mb-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400 dark:text-stone-500">Penguasaan</p>
                <p className="text-xs font-medium text-brand-dark dark:text-brand-cream">
                  {Math.round(note.mastery_score * 100)}%
                </p>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-red rounded-full transition-all"
                  style={{ width: `${Math.round(note.mastery_score * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400 dark:text-stone-500">
                Diperbarui setelah sesi Flashcard.
              </p>
            </div>
            {note.last_reviewed_at && (
              <div className="text-xs text-gray-400 dark:text-stone-500 shrink-0 text-right">
                <p>
                  Review:{" "}
                  {new Date(note.last_reviewed_at * 1000).toLocaleDateString(
                    "id-ID"
                  )}
                </p>
                {note.next_review_at && (
                  <p>
                    Next:{" "}
                    {new Date(note.next_review_at * 1000).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          {studyMode === "edit" && (
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-3 mb-4">
              <label className="text-xs text-gray-500 dark:text-stone-400 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-red/20 bg-brand-red/10 pl-2.5 pr-1.5 py-1 text-xs font-medium leading-none text-brand-dark dark:text-brand-cream"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(i)}
                      className="inline-flex items-center justify-center rounded-full text-brand-dark/60 hover:text-brand-dark dark:hover:text-brand-cream"
                      aria-label={`Hapus tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-800 px-3 py-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagInputChange(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Tambah tag"
                    aria-label="Tambah tag"
                    className="min-w-28 flex-1 bg-transparent text-xs text-brand-dark dark:text-brand-cream outline-none placeholder:text-gray-400 dark:placeholder:text-stone-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!normalizedTagInput}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-stone-700 text-gray-500 dark:text-stone-400 hover:border-brand-dark dark:hover:border-brand-cream hover:text-brand-dark dark:hover:text-brand-cream disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                  aria-label="Tambah tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {tagAnnouncement}
              </p>
            </div>
          )}
          {generateError && (
            <div className="mb-4 text-sm text-brand-red">{generateError}</div>
          )}
          {deleteNote.isError && (
            <div className="mb-4 text-sm text-brand-red">
              {deleteNote.error.message}
            </div>
          )}
          {confirmDelete && (
            <div className="mb-4 rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4">
              <p className="text-sm font-medium text-brand-dark dark:text-brand-cream">
                Hapus catatan ini?
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-stone-400">
                Tindakan ini akan menghapus catatan dan riwayat review terkait.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleteNote.isPending}
                  className="px-3 py-1.5 rounded-lg bg-brand-red text-white text-xs disabled:opacity-50"
                >
                  {deleteNote.isPending ? "Menghapus..." : "Ya, hapus"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleteNote.isPending}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 text-gray-600 dark:text-stone-300 text-xs border border-gray-200 dark:border-stone-700"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2">
              {studyMode === "flashcards" ? (
                <FlashcardStudy
                  noteId={note.id}
                  flashcards={generatedFlashcards}
                  currentMastery={note.mastery_score}
                  isRegenerating={generateFlashcards.isPending}
                  onRegenerate={handleStartFlashcards}
                />
              ) : studyMode === "summary" && generatedSummary ? (
                <SmartSummaryView
                  summary={generatedSummary}
                  isRegenerating={generateSummary.isPending}
                  onRegenerate={handleStartSummary}
                />
              ) : (
                <NoteEditor
                  noteId={note.id}
                  title={title}
                  content={content}
                  onTitleChange={setTitle}
                  onContentChange={setContent}
                  onSave={handleManualSave}
                  isSaving={updateNote.isPending}
                  hasUnsavedChanges={hasUnsavedChanges}
                  saveStatus={saveStatus}
                  saveError={saveError}
                />
              )}
            </div>
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5 h-fit">
              <h2 className="font-medium text-brand-dark dark:text-brand-cream mb-4 text-sm">
                Timer Belajar
              </h2>
              <PomodoroTimer noteId={note.id} subjectId={note.subject_id} />
            </div>
          </div>
        </>
      )}
    </main>
  )
}
