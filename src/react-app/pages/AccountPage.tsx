import { useState } from "react"
import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { useSession, authClient, signOut } from "../lib/auth-client"

export default function AccountPage() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()

  const [nameForm, setNameForm] = useState("")
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [pwValidationError, setPwValidationError] = useState("")
  const [signingOut, setSigningOut] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")

  const updateName = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await authClient.updateUser({ name })
      if (error) throw new Error(error.message || "Gagal memperbarui nama.")
    },
    onSuccess: () => setNameForm(""),
  })

  const changePassword = useMutation({
    mutationFn: async ({ current, next }: { current: string; next: string }) => {
      const { error } = await authClient.changePassword({
        newPassword: next,
        currentPassword: current,
        revokeOtherSessions: false,
      })
      if (error) {
        const msg = error.message ?? ""
        if (msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("current")) {
          throw new Error("Password lama tidak sesuai.")
        }
        throw new Error(msg || "Gagal mengganti password.")
      }
    },
    onSuccess: () => setPwForm({ current: "", next: "", confirm: "" }),
  })

  const exportData = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/export", { credentials: "include" })
      if (!res.ok) throw new Error("Gagal mengunduh data.")
      return res.blob()
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `deadlinenote-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })

  const deleteAccount = useMutation({
    mutationFn: async (password: string) => {
      const { error } = await authClient.deleteUser({ password })
      if (error) throw new Error(error.message || "Gagal menghapus akun.")
    },
    onSuccess: async () => {
      await signOut()
      navigate("/", { replace: true })
    },
  })

  function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    const name = nameForm.trim()
    if (!name) return
    updateName.reset()
    updateName.mutate(name)
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) {
      setPwValidationError("Password baru tidak cocok.")
      return
    }
    if (pwForm.next.length < 8) {
      setPwValidationError("Password baru minimal 8 karakter.")
      return
    }
    setPwValidationError("")
    changePassword.reset()
    changePassword.mutate({ current: pwForm.current, next: pwForm.next })
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate("/login", { replace: true })
  }

  if (isPending) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-400 dark:text-stone-500">Memuat...</div>
    )
  }

  const user = session?.user

  return (
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-2xl mx-auto w-full min-w-0">
        <header className="mb-6">
          <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest">Pengaturan</p>
          <h1 className="text-xl md:text-2xl font-semibold text-brand-dark dark:text-brand-cream mt-1">Akun</h1>
        </header>

        {/* User info */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5 mb-5">
          <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest mb-3">Info Akun</p>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500 dark:text-stone-400">Nama</p>
            <p className="font-medium text-brand-dark dark:text-brand-cream">{user?.name || "—"}</p>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <p className="text-sm text-gray-500 dark:text-stone-400">Email</p>
            <p className="font-medium text-brand-dark dark:text-brand-cream">{user?.email || "—"}</p>
          </div>
        </div>

        {/* Change name */}
        <form
          onSubmit={handleUpdateName}
          className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5 mb-5 flex flex-col gap-3"
        >
          <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest">Ubah Nama</p>
          <div>
            <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Nama baru</label>
            <input
              value={nameForm}
              onChange={(e) => { setNameForm(e.target.value); updateName.reset() }}
              placeholder={user?.name || "Nama lengkap"}
              required
              className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
            />
          </div>
          {updateName.isError && <p className="text-xs text-brand-red">{updateName.error?.message}</p>}
          {updateName.isSuccess && <p className="text-xs text-green-600">Nama berhasil diperbarui.</p>}
          <button
            type="submit"
            disabled={updateName.isPending}
            className="self-start px-4 py-2 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark text-sm rounded-lg hover:opacity-80 disabled:opacity-50"
          >
            {updateName.isPending ? "Menyimpan..." : "Simpan Nama"}
          </button>
        </form>

        {/* Change password */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5 mb-5 flex flex-col gap-3"
        >
          <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest">Ganti Password</p>
          <div>
            <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Password saat ini</label>
            <input
              type="password"
              value={pwForm.current}
              onChange={(e) => { setPwForm((f) => ({ ...f, current: e.target.value })); changePassword.reset(); setPwValidationError("") }}
              placeholder="Password lama"
              required
              autoComplete="current-password"
              className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Password baru</label>
            <input
              type="password"
              value={pwForm.next}
              onChange={(e) => { setPwForm((f) => ({ ...f, next: e.target.value })); changePassword.reset(); setPwValidationError("") }}
              placeholder="Minimal 8 karakter"
              required
              autoComplete="new-password"
              className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-stone-400 mb-1 block">Konfirmasi password baru</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => { setPwForm((f) => ({ ...f, confirm: e.target.value })); changePassword.reset(); setPwValidationError("") }}
              placeholder="Ulangi password baru"
              required
              autoComplete="new-password"
              className="w-full border border-gray-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-dark dark:focus:border-brand-cream"
            />
          </div>
          {(pwValidationError || changePassword.isError) && (
            <p className="text-xs text-brand-red">{pwValidationError || changePassword.error?.message}</p>
          )}
          {changePassword.isSuccess && <p className="text-xs text-green-600">Password berhasil diubah.</p>}
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="self-start px-4 py-2 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark text-sm rounded-lg hover:opacity-80 disabled:opacity-50"
          >
            {changePassword.isPending ? "Menyimpan..." : "Ganti Password"}
          </button>
        </form>

        {/* Data portability */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5 mb-5">
          <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest mb-1">Data Kamu</p>
          <p className="text-xs text-gray-500 dark:text-stone-400 mb-3 leading-relaxed">
            Unduh salinan data aplikasi utama yang tersimpan di DeadlineNote (catatan, mata kuliah, dan deadline) dalam format JSON.
          </p>
          {exportData.isError && <p className="text-xs text-brand-red mb-2">{exportData.error?.message}</p>}
          <button
            id="btn-export-data"
            onClick={() => exportData.mutate()}
            disabled={exportData.isPending}
            className="px-4 py-2 bg-brand-muted dark:bg-stone-800 text-brand-dark dark:text-brand-cream text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {exportData.isPending ? "Menyiapkan..." : "Unduh Data Saya"}
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-red-100 dark:border-red-900/40 p-5 mb-5">
          <p className="text-xs text-brand-red uppercase tracking-widest mb-1">Zona Berbahaya</p>
          <p className="text-xs text-gray-500 dark:text-stone-400 mb-3 leading-relaxed">
            Menghapus akun akan menghapus <strong>data aplikasi yang terhubung ke akunmu secara permanen</strong> — catatan, mata kuliah, deadline, sesi belajar, dan log review. Pesan kontak publik tidak otomatis terhubung ke akun. Tindakan ini tidak dapat dibatalkan.
          </p>

          {!deleteConfirm ? (
            <button
              id="btn-delete-account-start"
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 bg-red-50 dark:bg-red-950/30 text-brand-red text-sm rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              Hapus Akun Saya
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-brand-dark dark:text-brand-cream">
                Masukkan password saat ini untuk mengonfirmasi:
              </p>
              <input
                id="input-delete-confirm"
                type="password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); deleteAccount.reset() }}
                placeholder="Password saat ini"
                autoComplete="current-password"
                className="w-full border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none focus:border-brand-red"
              />
              {deleteAccount.isError && <p className="text-xs text-brand-red">{deleteAccount.error?.message}</p>}
              <div className="flex gap-2">
                <button
                  id="btn-delete-account-confirm"
                  onClick={() => deleteAccount.mutate(deletePassword)}
                  disabled={!deletePassword || deleteAccount.isPending}
                  className="px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                  {deleteAccount.isPending ? "Menghapus..." : "Konfirmasi Hapus"}
                </button>
                <button
                  onClick={() => { setDeleteConfirm(false); setDeletePassword(""); deleteAccount.reset() }}
                  disabled={deleteAccount.isPending}
                  className="px-4 py-2 text-gray-500 dark:text-stone-400 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign out */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-5">
          <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest mb-3">Sesi</p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="px-4 py-2 bg-red-50 dark:bg-red-950/30 text-brand-red text-sm rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
          >
            {signingOut ? "Keluar..." : "Keluar dari akun"}
          </button>
        </div>
    </main>
  )
}
