import { useState } from "react"
import { NavLink, useNavigate, useLocation } from "react-router"
import { signOut } from "../../lib/auth-client"
import {
  BarChart3,
  FileText,
  CalendarDays,
  Timer,
  GraduationCap,
  TrendingUp,
  User,
  LogOut,
  MoreHorizontal,
  X,
  type LucideIcon,
} from "lucide-react"
import { ThemeToggle } from "../common/ThemeToggle"

const primaryItems: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Dashboard", Icon: BarChart3 },
  { to: "/notes", label: "Catatan", Icon: FileText },
  { to: "/deadlines", label: "Deadline", Icon: CalendarDays },
  { to: "/timer", label: "Timer", Icon: Timer },
]

const moreItems: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: "/subjects", label: "Mata Kuliah", Icon: GraduationCap },
  { to: "/stats", label: "Statistik", Icon: TrendingUp },
  { to: "/account", label: "Akun", Icon: User },
]

export function BottomNav() {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const moreIsActive = moreItems.some((item) =>
    location.pathname.startsWith(item.to)
  )

  function handleMoreItem(to: string) {
    setOpen(false)
    navigate(to)
  }

  async function handleSignOut() {
    setSigningOut(true)
    setOpen(false)
    await signOut()
    navigate("/login", { replace: true })
  }

  return (
    <>
      {/* Bottom sheet backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* More bottom sheet */}
      <div
        className={`md:hidden fixed left-0 right-0 z-50 bg-white dark:bg-stone-900 rounded-t-2xl shadow-xl transition-all duration-300 ease-in-out ${
          open
            ? "bottom-14 opacity-100 pb-2"
            : "-bottom-40 opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-10 h-1 bg-gray-200 dark:bg-stone-700 rounded-full mx-auto mt-3 mb-4" />
        <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest px-6 mb-3">
          Lainnya
        </p>
        <div className="flex flex-col pb-safe pb-4">
          {moreItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <button
                key={item.to}
                onClick={() => handleMoreItem(item.to)}
                className={`flex items-center gap-4 px-6 py-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-red"
                    : "text-brand-dark dark:text-brand-cream hover:text-brand-red"
                }`}
              >
                <item.Icon className="w-5 h-5 shrink-0" />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-red" />
                )}
              </button>
            )
          })}
          <div className="border-t border-gray-100 dark:border-stone-800 mt-1 pt-1">
            <div className="px-6 py-2">
              <ThemeToggle showLabel className="w-full justify-start" />
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-4 px-6 py-3.5 text-sm font-medium text-gray-400 dark:text-stone-500 hover:text-brand-red transition-colors w-full disabled:opacity-50"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {signingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>
      </div>

      {/* Main bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-stone-900 border-t border-gray-100 dark:border-stone-800 flex">
        {primaryItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 text-xs gap-0.5 transition-colors ${
                isActive ? "text-brand-red" : "text-gray-400 dark:text-stone-500"
              }`
            }
          >
            <item.Icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}

        {/* "Lainnya" tab */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex-1 flex flex-col items-center py-3 text-xs gap-0.5 transition-colors ${
            moreIsActive || open ? "text-brand-red" : "text-gray-400 dark:text-stone-500"
          }`}
        >
          {open ? (
            <X className="w-5 h-5" />
          ) : (
            <MoreHorizontal className="w-5 h-5" />
          )}
          Lainnya
        </button>
      </nav>
    </>
  )
}
