import { useState, useEffect, useRef, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher } from "../lib/fetcher"
import { queryKeys } from "../lib/queryKeys"
import type { PomodoroSession } from "../lib/types"

const LS_KEY = "dn_pomo"

interface PomodoroState {
  phase: "idle" | "running" | "paused" | "done"
  timeLeft: number          // seconds remaining as of last save
  segmentStartAt: number | null  // ms epoch — start of current running segment
  sessionId: string | null
  noteId: string | null
  subjectId: string | null
  durationMinutes: number
}

function makeIdle(duration = 25): PomodoroState {
  return {
    phase: "idle",
    timeLeft: duration * 60,
    segmentStartAt: null,
    sessionId: null,
    noteId: null,
    subjectId: null,
    durationMinutes: duration,
  }
}

function saveState(s: PomodoroState) {
  localStorage.setItem(LS_KEY, JSON.stringify(s))
}

function loadState(): PomodoroState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return makeIdle()
    const s = JSON.parse(raw) as PomodoroState
    if (s.phase === "running" && s.segmentStartAt != null) {
      const elapsed = Math.floor((Date.now() - s.segmentStartAt) / 1000)
      const newLeft = Math.max(0, s.timeLeft - elapsed)
      if (newLeft === 0) {
        // Timer expired while page was closed — mark as done
        return { ...s, phase: "done", timeLeft: 0, segmentStartAt: null }
      }
      // Restore with corrected timeLeft; update segmentStartAt so future saves are correct
      return { ...s, timeLeft: newLeft, segmentStartAt: Date.now() }
    }
    return s
  } catch {
    return makeIdle()
  }
}

export function usePomodoro() {
  const [ps, setPs] = useState<PomodoroState>(loadState)
  const [syncError, setSyncError] = useState("")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedOnMountRef = useRef(false)
  const qc = useQueryClient()

  const startMutation = useMutation({
    mutationFn: (data: { note_id?: string; subject_id?: string; duration_minutes: number }) =>
      fetcher<PomodoroSession>("/sessions", { method: "POST", body: JSON.stringify(data) }),
    onError: (error) => {
      setSyncError(error instanceof Error ? error.message : "Gagal memulai sesi.")
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => fetcher<{ success: boolean }>(`/sessions/${id}/complete`, {
      method: "PUT",
      body: JSON.stringify({}),
    }),
    onSuccess: () => {
      setSyncError("")
      qc.invalidateQueries({ queryKey: queryKeys.sessions() })
    },
    onError: (error) => {
      setSyncError(error instanceof Error ? error.message : "Gagal menyelesaikan sesi.")
    },
  })

  // On mount: if the timer expired while the page was closed, complete the session
  useEffect(() => {
    if (completedOnMountRef.current) return
    completedOnMountRef.current = true
    const loaded = loadState()
    if (loaded.phase === "done" && loaded.sessionId) {
      const sessionId = loaded.sessionId
      completeMutation.mutate(sessionId, {
        onSuccess: () => {
          const next = { ...loaded, sessionId: null }
          saveState(next)
          setPs(next)
        },
      })
    }
  }, [completeMutation])

  // Timer tick
  useEffect(() => {
    if (ps.phase === "running") {
      intervalRef.current = setInterval(() => {
        setPs((prev) => {
          if (prev.phase !== "running") return prev
          const newLeft = Math.max(0, prev.timeLeft - 1)

          if (newLeft === 0) {
            clearInterval(intervalRef.current!)
            if (prev.sessionId) completeMutation.mutate(prev.sessionId)
            const next: PomodoroState = {
              ...prev,
              phase: "done",
              timeLeft: 0,
              segmentStartAt: null,
              sessionId: null,
            }
            saveState(next)
            return next
          }

          const next = { ...prev, timeLeft: newLeft }
          // Save every 10 seconds so refresh stays accurate
          if (newLeft % 10 === 0) {
            saveState({ ...next, segmentStartAt: Date.now(), timeLeft: newLeft })
          }
          return next
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [ps.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(
    async (durationMinutes = 25, noteId?: string, subjectId?: string) => {
      setSyncError("")
      let session: PomodoroSession
      try {
        session = await startMutation.mutateAsync({
          note_id: noteId,
          subject_id: subjectId,
          duration_minutes: durationMinutes,
        })
      } catch {
        return
      }
      const next: PomodoroState = {
        phase: "running",
        timeLeft: durationMinutes * 60,
        segmentStartAt: Date.now(),
        sessionId: session.id,
        noteId: noteId ?? null,
        subjectId: subjectId ?? null,
        durationMinutes,
      }
      setPs(next)
      saveState(next)
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const pause = useCallback(() => {
    setPs((prev) => {
      const next = { ...prev, phase: "paused" as const, segmentStartAt: null }
      saveState(next)
      return next
    })
  }, [])

  const resume = useCallback(() => {
    setPs((prev) => {
      const next = { ...prev, phase: "running" as const, segmentStartAt: Date.now() }
      saveState(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const next = makeIdle()
    setPs(next)
    saveState(next)
  }, [])

  const progress =
    ps.durationMinutes > 0 ? 1 - ps.timeLeft / (ps.durationMinutes * 60) : 0
  const minutes = Math.floor(ps.timeLeft / 60)
  const seconds = ps.timeLeft % 60

  return {
    phase: ps.phase,
    minutes,
    seconds,
    progress,
    durationMinutes: ps.durationMinutes,
    noteId: ps.noteId,
    subjectId: ps.subjectId,
    syncError,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
    start,
    pause,
    resume,
    reset,
  }
}
