import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react"
import type { Flashcard } from "../../lib/types"
import { MasteryRating } from "./MasteryRating"

interface Props {
  noteId: string
  flashcards: Flashcard[]
  currentMastery: number
  isRegenerating?: boolean
  onRegenerate?: () => void
}

type CardStatus = "known" | "practice"

export function FlashcardStudy({
  noteId,
  flashcards,
  currentMastery,
  isRegenerating = false,
  onRegenerate,
}: Props) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set())
  const [practiceCards, setPracticeCards] = useState<Set<number>>(new Set())
  const [showRating, setShowRating] = useState(false)

  useEffect(() => {
    setIndex(0)
    setIsFlipped(false)
    setKnownCards(new Set())
    setPracticeCards(new Set())
    setShowRating(false)
  }, [flashcards])

  const totalCards = flashcards.length
  const activeCard = flashcards[index]
  const studiedCount = useMemo(() => {
    return new Set([...knownCards, ...practiceCards]).size
  }, [knownCards, practiceCards])
  const progress = totalCards === 0 ? 0 : Math.round((studiedCount / totalCards) * 100)

  function goToCard(nextIndex: number) {
    setIndex(Math.min(Math.max(nextIndex, 0), Math.max(totalCards - 1, 0)))
    setIsFlipped(false)
  }

  function markCard(status: CardStatus) {
    if (!activeCard) return
    if (status === "known") {
      setKnownCards((prev) => new Set(prev).add(index))
      setPracticeCards((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    } else {
      setPracticeCards((prev) => new Set(prev).add(index))
      setKnownCards((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }

    if (index < totalCards - 1) {
      goToCard(index + 1)
    } else {
      setShowRating(true)
    }
  }

  if (totalCards === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center py-8 bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-xl">
          <Layers className="w-10 h-10 text-gray-300 dark:text-stone-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-stone-400">Belum ada flashcard yang bisa dibuat.</p>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-stone-700 px-3 py-1.5 text-xs font-medium text-brand-dark dark:text-brand-cream hover:border-brand-dark dark:hover:border-brand-cream disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isRegenerating ? "Membuat..." : "Generate ulang"}
            </button>
          )}
        </div>
        <MasteryRating noteId={noteId} currentMastery={currentMastery} />
      </div>
    )
  }

  if (showRating) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-stone-500">Deck</p>
            <p className="mt-2 text-2xl font-semibold text-brand-dark dark:text-brand-cream">{totalCards}</p>
          </div>
          <div className="bg-white dark:bg-stone-900 border border-green-100 dark:border-green-900/40 rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-green-600 dark:text-green-300">Hafal</p>
            <p className="mt-2 text-2xl font-semibold text-brand-dark dark:text-brand-cream">{knownCards.size}</p>
          </div>
          <div className="bg-white dark:bg-stone-900 border border-orange-100 dark:border-orange-900/40 rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-orange-600 dark:text-orange-300">Latihan</p>
            <p className="mt-2 text-2xl font-semibold text-brand-dark dark:text-brand-cream">{practiceCards.size}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setShowRating(false)
              goToCard(0)
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-gray-600 dark:text-stone-300 hover:border-brand-dark dark:hover:border-brand-cream hover:text-brand-dark dark:hover:text-brand-cream"
          >
            <RotateCcw className="w-4 h-4" />
            Ulangi deck
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-gray-600 dark:text-stone-300 hover:border-brand-dark dark:hover:border-brand-cream hover:text-brand-dark dark:hover:text-brand-cream disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              {isRegenerating ? "Membuat..." : "Generate ulang"}
            </button>
          )}
        </div>

        <MasteryRating noteId={noteId} currentMastery={currentMastery} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-stone-500">Flashcard</p>
          <p className="mt-1 text-sm font-medium text-brand-dark dark:text-brand-cream">
            {index + 1} dari {totalCards}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToCard(index - 1)}
            disabled={index === 0}
            className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-gray-500 dark:text-stone-400 hover:border-brand-dark dark:hover:border-brand-cream hover:text-brand-dark dark:hover:text-brand-cream disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
            aria-label="Flashcard sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => goToCard(index + 1)}
            disabled={index === totalCards - 1}
            className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-gray-500 dark:text-stone-400 hover:border-brand-dark dark:hover:border-brand-cream hover:text-brand-dark dark:hover:text-brand-cream disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
            aria-label="Flashcard berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-stone-800">
        <div
          className="h-full rounded-full bg-brand-red transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => setIsFlipped((value) => !value)}
        className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-brand-red/30 rounded-xl"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative min-h-[280px] transition-transform duration-500"
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-xl border border-gray-100 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-stone-500">Depan</p>
              <p className="mt-4 text-xl font-semibold leading-snug text-brand-dark dark:text-brand-cream">
                {activeCard.front}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-stone-500">
              <span>{isFlipped ? "Jawaban" : "Pertanyaan"}</span>
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-xl border border-brand-red/20 bg-brand-muted dark:bg-stone-800 p-6 shadow-sm"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-red">Belakang</p>
              <p className="mt-4 text-base leading-relaxed text-brand-dark dark:text-brand-cream">
                {activeCard.back}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-stone-400">
              <span>{isFlipped ? "Jawaban" : "Pertanyaan"}</span>
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => markCard("practice")}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-200 dark:hover:bg-orange-900/50"
        >
          <XCircle className="w-4 h-4" />
          Latih lagi
        </button>
        <button
          type="button"
          onClick={() => markCard("known")}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200 dark:hover:bg-green-900/50"
        >
          <CheckCircle2 className="w-4 h-4" />
          Hafal
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-h-3 flex-wrap gap-1.5">
          {flashcards.map((_, cardIndex) => {
            const isKnown = knownCards.has(cardIndex)
            const needsPractice = practiceCards.has(cardIndex)
            return (
              <span
                key={cardIndex}
                className={`h-2.5 w-2.5 rounded-full ${
                  isKnown
                    ? "bg-green-500"
                    : needsPractice
                    ? "bg-orange-400"
                    : cardIndex === index
                    ? "bg-brand-red"
                    : "bg-gray-200 dark:bg-stone-700"
                }`}
              />
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowRating(true)}
          className="shrink-0 rounded-lg bg-brand-dark dark:bg-brand-cream px-4 py-2 text-sm text-white dark:text-brand-dark hover:opacity-85"
        >
          Selesai
        </button>
      </div>
    </div>
  )
}
