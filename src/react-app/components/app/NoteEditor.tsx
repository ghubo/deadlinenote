import { useEffect, useRef, useState } from "react"
import { Camera, ImagePlus, ScanText, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { ApiError, fetcher } from "../../lib/fetcher"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_NOTE_LENGTH = 50_000
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

function getImageType(file: File) {
  if (file.type === "image/jpg") return "image/jpeg"
  if (ACCEPTED_IMAGE_TYPES.has(file.type)) return file.type
  if (/\.jpe?g$/i.test(file.name)) return "image/jpeg"
  if (/\.png$/i.test(file.name)) return "image/png"
  if (/\.webp$/i.test(file.name)) return "image/webp"
  return null
}

interface Props {
  noteId: string
  title: string
  content: string
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onSave: () => void
  isSaving?: boolean
  hasUnsavedChanges?: boolean
  saveStatus?: "idle" | "pending" | "saving" | "saved" | "error"
  saveError?: string | null
}

function getOcrErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "Gagal membaca gambar. Periksa koneksi lalu coba lagi."
  }

  const messages: Record<string, string> = {
    invalid_image: error.message,
    image_too_large: "Ukuran gambar maksimal 5 MB.",
    ocr_no_text: "Tidak ada teks yang dapat dibaca pada gambar.",
    ai_invalid_response: "Hasil pembacaan tidak valid. Coba gambar lain.",
    ocr_failed: "Layanan pembacaan gambar sedang bermasalah.",
    rate_limited: "Terlalu banyak permintaan. Coba lagi beberapa saat nanti.",
  }
  return messages[error.code] ?? error.message
}

export function NoteEditor({
  noteId,
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  isSaving,
  hasUnsavedChanges = false,
  saveStatus = "idle",
  saveError = null,
}: Props) {
  const [showOcrDialog, setShowOcrDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [ocrText, setOcrText] = useState("")
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const isMobile = window.matchMedia("(max-width: 639px)").matches

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function clearSelectedImage() {
    setSelectedImage(null)
    setImagePreview(null)
    setOcrText("")
    setOcrError(null)
    if (galleryInputRef.current) galleryInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  function closeOcrDialog() {
    clearSelectedImage()
    setShowOcrDialog(false)
  }

  async function handleImageSelected(file?: File) {
    if (!file) return
    setOcrError(null)
    setOcrText("")

    const imageType = getImageType(file)
    if (!imageType) {
      const format = file.type || file.name.split(".").pop()?.toUpperCase()
      setOcrError(
        format
          ? `Format ${format} belum didukung. Gunakan JPEG, PNG, atau WebP.`
          : "Format gambar tidak dikenali. Gunakan JPEG, PNG, atau WebP."
      )
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setOcrError("Ukuran gambar maksimal 5 MB.")
      return
    }

    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
    setIsExtracting(true)
    try {
      const uploaded = await fetcher<{ key: string }>(
        `/notes/${noteId}/ocr-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": imageType,
            "X-Image-Size": String(file.size),
          },
          body: file,
        }
      )
      const result = await fetcher<{ text: string }>(
        `/notes/${noteId}/extract-text`,
        {
          method: "POST",
          body: JSON.stringify({ imageKey: uploaded.key }),
        }
      )
      setOcrText(result.text)
    } catch (error) {
      setOcrError(getOcrErrorMessage(error))
    } finally {
      setIsExtracting(false)
    }
  }

  function insertOcrText() {
    const text = ocrText.trim()
    if (!text) {
      setOcrError("Hasil teks masih kosong.")
      return
    }

    const nextContent = content.trimEnd()
      ? `${content.trimEnd()}\n\n${text}`
      : text
    if (nextContent.length > MAX_NOTE_LENGTH) {
      setOcrError("Hasil ini membuat catatan melebihi batas 50.000 karakter.")
      return
    }

    onContentChange(nextContent)
    closeOcrDialog()
  }

  const saveStatusText =
    saveStatus === "saving"
      ? "Menyimpan..."
      : saveStatus === "pending"
        ? "Belum disimpan"
        : saveStatus === "saved"
          ? "Tersimpan"
          : saveStatus === "error"
            ? (saveError ?? "Gagal autosave. Coba klik Simpan.")
            : null

  const saveStatusClass =
    saveStatus === "error"
      ? "text-brand-red"
      : saveStatus === "pending"
        ? "text-amber-600 dark:text-amber-300"
        : "text-gray-400 dark:text-stone-500"

  return (
    <div className="flex flex-col gap-4">
      <input
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Judul catatan..."
        className="w-full border-b border-transparent bg-transparent pb-1 text-xl font-semibold text-brand-dark outline-none placeholder:text-gray-300 focus:border-gray-200 dark:text-brand-cream dark:placeholder:text-stone-600"
      />

      <textarea
        aria-label="Isi catatan"
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="Tulis isi catatan..."
        className="min-h-[320px] w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm text-gray-700 outline-none placeholder:text-gray-300 dark:border-stone-700 dark:text-stone-300 dark:placeholder:text-stone-600"
      />

      {saveStatusText && (
        <p className={`text-xs ${saveStatusClass}`} aria-live="polite">
          {saveStatusText}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-2">
        <button
          onClick={onSave}
          disabled={isSaving || !title.trim() || !hasUnsavedChanges}
          className="rounded-lg border border-transparent bg-brand-red px-6 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => setShowOcrDialog(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-brand-dark dark:border-stone-700 dark:text-stone-300 dark:hover:border-brand-cream"
        >
          <ScanText className="h-4 w-4" />
          Ambil teks dari gambar
        </button>
      </div>

      <AnimatePresence>
        {showOcrDialog && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ocr-dialog-title"
            className="fixed inset-0 z-[60] flex h-[100dvh] items-end justify-center bg-black/50 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="fixed inset-x-0 bottom-0 max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl dark:bg-stone-900 sm:static sm:max-w-2xl sm:rounded-2xl sm:pb-5"
              initial={{ y: isMobile ? "100%" : 0 }}
              animate={{ y: 0 }}
              exit={{ y: isMobile ? "100%" : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="ocr-dialog-title"
                  className="font-semibold text-brand-dark dark:text-brand-cream"
                >
                  Ambil teks dari gambar
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-stone-400">
                  JPEG, PNG, atau WebP. Maksimal 5 MB.
                </p>
              </div>
              <button
                type="button"
                onClick={closeOcrDialog}
                className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-dark dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-brand-cream"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!selectedImage && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-5 text-sm text-brand-dark transition-colors hover:border-brand-dark hover:bg-gray-50 dark:border-stone-700 dark:text-brand-cream dark:hover:border-brand-cream dark:hover:bg-stone-800"
                >
                  <Camera className="h-6 w-6" />
                  Ambil foto
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-5 text-sm text-brand-dark transition-colors hover:border-brand-dark hover:bg-gray-50 dark:border-stone-700 dark:text-brand-cream dark:hover:border-brand-cream dark:hover:bg-stone-800"
                >
                  <ImagePlus className="h-6 w-6" />
                  Pilih gambar
                </button>
              </div>
            )}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
              onChange={(event) =>
                void handleImageSelected(event.target.files?.[0])
              }
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) =>
                void handleImageSelected(event.target.files?.[0])
              }
            />

            {selectedImage && (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-stone-800">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview gambar catatan"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-dark dark:text-brand-cream">
                      {selectedImage.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-stone-400">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {isExtracting && (
                  <p className="text-sm text-gray-500 dark:text-stone-400">
                    Membaca teks dari gambar...
                  </p>
                )}

                {ocrText && !isExtracting && (
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-stone-300">
                      Periksa dan koreksi hasil
                    </label>
                    <textarea
                      value={ocrText}
                      onChange={(event) => setOcrText(event.target.value)}
                      className="min-h-56 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 outline-none focus:border-brand-dark dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300 dark:focus:border-brand-cream"
                    />
                  </div>
                )}
              </div>
            )}

            {ocrError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red dark:bg-red-950/30">
                {ocrError}
              </p>
            )}

            {selectedImage && !isExtracting && (
              <div className="mt-5 flex flex-wrap gap-2">
                {ocrText && (
                  <button
                    type="button"
                    onClick={insertOcrText}
                    className="rounded-lg bg-brand-dark px-4 py-2 text-sm text-white transition-opacity hover:opacity-85 dark:bg-brand-cream dark:text-brand-dark"
                  >
                    Sisipkan ke catatan
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-brand-dark hover:bg-gray-50 hover:text-brand-dark dark:border-stone-700 dark:text-stone-300 dark:hover:border-brand-cream dark:hover:bg-stone-800 dark:hover:text-brand-cream"
                >
                  Coba gambar lain
                </button>
                <button
                  type="button"
                  onClick={closeOcrDialog}
                  className="rounded-lg px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-dark dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-brand-cream"
                >
                  Batal
                </button>
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
