import { useState } from "react"
import { usePomodoro } from "../../hooks/usePomodoro"
import { PartyPopper } from "lucide-react"

interface Props {
  noteId?: string
  subjectId?: string
}

const DURATIONS = [15, 25, 45, 50]

const phaseLabel: Record<string, string> = {
  idle: "Siap",
  running: "Fokus",
  paused: "Dijeda",
  done: "Selesai!",
}

export function PomodoroTimer({ noteId, subjectId }: Props) {
  const {
    phase,
    minutes,
    seconds,
    progress,
    durationMinutes,
    syncError,
    isStarting,
    start,
    pause,
    resume,
    reset,
  } = usePomodoro()
  const [selectedDuration, setSelectedDuration] = useState(durationMinutes)

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Duration selector — only when idle */}
      {phase === "idle" && (
        <div className="flex gap-1 flex-wrap justify-center">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedDuration === d
                  ? "bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark"
                  : "bg-gray-100 dark:bg-stone-800 text-gray-600 dark:text-stone-300 hover:bg-gray-200 dark:hover:bg-stone-700"
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
      )}

      {/* Circular progress */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#F5F3EE" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={phase === "done" ? "#1D9E75" : "#E24B4A"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-brand-dark dark:text-brand-cream tabular-nums">
            {phase === "idle"
              ? `${String(selectedDuration).padStart(2, "0")}:00`
              : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
          </span>
          <span className="text-xs text-gray-400 dark:text-stone-500">{phaseLabel[phase] ?? phase}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap justify-center">
        {phase === "idle" && (
          <button
            onClick={() => start(selectedDuration, noteId, subjectId)}
            disabled={isStarting}
            className="px-5 py-2 bg-brand-red text-white text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isStarting ? "Memulai..." : "Mulai"}
          </button>
        )}
        {phase === "running" && (
          <button
            onClick={pause}
            className="px-5 py-2 bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors"
          >
            Jeda
          </button>
        )}
        {phase === "paused" && (
          <>
            <button
              onClick={resume}
              className="px-5 py-2 bg-brand-red text-white text-sm rounded-lg hover:opacity-90"
            >
              Lanjut
            </button>
            <button
              onClick={reset}
              className="px-5 py-2 bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-stone-700"
            >
              Reset
            </button>
          </>
        )}
        {phase === "done" && (
          <button
            onClick={reset}
            className="px-5 py-2 bg-teal-100 dark:bg-teal-950/40 text-urgency-safe dark:text-teal-300 text-sm rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors font-medium"
          >
            Sesi Selesai <PartyPopper className="inline w-4 h-4 mb-0.5" /> — Reset
          </button>
        )}
      </div>
      {syncError && <p className="text-xs text-brand-red text-center">{syncError}</p>}
    </div>
  )
}
