interface Props {
  value: number // 0–1
  className?: string
}

export function ProgressBar({ value, className = "" }: Props) {
  const clamped = Math.min(1, Math.max(0, value))
  const pct = Math.round(clamped * 100)
  return (
    <div className={`h-1.5 bg-gray-200 dark:bg-stone-700 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-brand-red rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
