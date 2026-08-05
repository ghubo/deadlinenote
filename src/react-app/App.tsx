import { lazy, Suspense, type ReactNode } from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { useSession } from "./lib/auth-client"
import { queryClient } from "./lib/query-client"
import { ThemeProvider } from "./lib/theme"
import { ErrorBoundary } from "./components/common/ErrorBoundary"
import { Sidebar } from "./components/app/Sidebar"
import { BottomNav } from "./components/app/BottomNav"
import LandingPage from "./pages/LandingPage"

const LoginPage = lazy(() => import("./pages/LoginPage"))
const RegisterPage = lazy(() => import("./pages/RegisterPage"))
const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const NotesPage = lazy(() => import("./pages/NotesPage"))
const NoteDetailPage = lazy(() => import("./pages/NoteDetailPage"))
const DeadlinesPage = lazy(() => import("./pages/DeadlinesPage"))
const TimerPage = lazy(() => import("./pages/TimerPage"))
const StatsPage = lazy(() => import("./pages/StatsPage"))
const SubjectsPage = lazy(() => import("./pages/SubjectsPage"))
const AccountPage = lazy(() => import("./pages/AccountPage"))
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"))
const TermsPage = lazy(() => import("./pages/TermsPage"))
const ContactPage = lazy(() => import("./pages/ContactPage"))

function PageFallback() {
  return (
    <div className="min-h-screen grid place-items-center bg-brand-cream text-gray-400 dark:bg-stone-950 dark:text-stone-500">
      Memuat...
    </div>
  )
}

function AppPageFallback() {
  return (
    <main className="flex-1 min-h-screen grid place-items-center p-4 pb-24 text-gray-400 dark:text-stone-500 md:p-6">
      Memuat...
    </main>
  )
}

function SilentRouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

function Protected() {
  const { data: session, isPending } = useSession()
  if (isPending) {
    return <PageFallback />
  }
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-brand-cream dark:bg-stone-950">
      <Sidebar />
      <Suspense fallback={<AppPageFallback />}>
        <Outlet />
      </Suspense>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/"            element={<LandingPage />} />
              <Route path="/login"       element={<SilentRouteSuspense><LoginPage /></SilentRouteSuspense>} />
              <Route path="/register"    element={<SilentRouteSuspense><RegisterPage /></SilentRouteSuspense>} />
              <Route path="/privacy"     element={<SilentRouteSuspense><PrivacyPage /></SilentRouteSuspense>} />
              <Route path="/terms"       element={<SilentRouteSuspense><TermsPage /></SilentRouteSuspense>} />
              <Route path="/contact"     element={<SilentRouteSuspense><ContactPage /></SilentRouteSuspense>} />
              <Route element={<Protected />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/notes/:id" element={<NoteDetailPage />} />
                  <Route path="/deadlines" element={<DeadlinesPage />} />
                  <Route path="/timer" element={<TimerPage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/subjects" element={<SubjectsPage />} />
                  <Route path="/account" element={<AccountPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
