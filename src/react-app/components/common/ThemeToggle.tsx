import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../lib/theme"

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"
  const label = isDark ? "Gunakan mode terang" : "Gunakan mode gelap"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-brand-dark hover:text-brand-dark dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-white/25 dark:hover:text-white ${className}`}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel && <span>{isDark ? "Terang" : "Gelap"}</span>}
    </button>
  )
}
