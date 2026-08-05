import type { ReactNode } from "react"

interface Props {
  label: string
  value: string | number
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, icon, className = "" }: Props) {
  return (
    <div className={`bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-4 flex flex-col gap-1 ${className}`}>
      {icon && <div className="text-brand-red mb-1">{icon}</div>}
      <p className="text-2xl font-semibold text-brand-dark dark:text-brand-cream">{value}</p>
      <p className="text-xs text-gray-500 dark:text-stone-400">{label}</p>
    </div>
  )
}

