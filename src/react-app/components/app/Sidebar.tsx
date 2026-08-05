import { NavLink } from "react-router"
import { signOut } from "../../lib/auth-client"
import { BarChart3, FileText, CalendarDays, BookOpen, Timer, TrendingUp, User, type LucideIcon } from "lucide-react"
import { ThemeToggle } from "../common/ThemeToggle"

const navItems: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Dashboard",   Icon: BarChart3 },
  { to: "/notes",     label: "Catatan",     Icon: FileText },
  { to: "/deadlines", label: "Deadline",    Icon: CalendarDays },
  { to: "/subjects",  label: "Mata Kuliah", Icon: BookOpen },
  { to: "/timer",     label: "Timer",       Icon: Timer },
  { to: "/stats",     label: "Statistik",   Icon: TrendingUp },
  { to: "/account",   label: "Akun",        Icon: User },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-52 h-screen sticky top-0 bg-white dark:bg-stone-900 border-r border-gray-100 dark:border-stone-800 py-6 px-4 gap-6 shrink-0">
      <div className="font-serif italic text-xl text-brand-dark dark:text-brand-cream">DeadlineNote</div>
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? "bg-brand-red text-white" : "text-gray-600 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-stone-800"
              }`
            }
          >
            <span><item.Icon className="w-4 h-4" /></span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <ThemeToggle showLabel className="w-full justify-start" />
      <button
        onClick={() => signOut()}
        className="text-xs text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-200 text-left px-3 py-2"
      >
        Keluar
      </button>
    </aside>
  )
}
