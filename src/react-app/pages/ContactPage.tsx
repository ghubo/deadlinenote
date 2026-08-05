import { useState, type FormEvent } from "react"
import { Link } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { CircleCheck, Loader2, Mail, MessageSquareText, ShieldCheck } from "lucide-react"
import { ApiError, fetcher } from "../lib/fetcher"
import { ThemeToggle } from "../components/common/ThemeToggle"

const contactNotes = [
  {
    title: "Bug atau kendala akun",
    desc: "Sertakan halaman yang dibuka, langkah yang kamu lakukan, dan pesan error jika ada.",
    Icon: MessageSquareText,
  },
  {
    title: "Saran fitur",
    desc: "Ceritakan alur belajar yang ingin kamu permudah di DeadlineNote.",
    Icon: Mail,
  },
  {
    title: "Privasi & data",
    desc: "Jangan kirim password, API key, atau isi catatan yang sangat sensitif lewat formulir ini.",
    Icon: ShieldCheck,
  },
]

function contactErrorMessage(error: Error) {
  if (error instanceof ApiError) {
    if (error.code === "rate_limited") {
      return "Terlalu banyak pesan dalam waktu singkat. Coba lagi nanti."
    }
    if (error.code === "bad_request") {
      return "Periksa kembali nama, email, dan pesan yang kamu kirim."
    }
  }
  return "Pesan belum terkirim. Periksa koneksi internet kamu lalu coba lagi."
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" })
  const [errors, setErrors] = useState({ name: "", email: "", message: "" })
  const [submittedEmail, setSubmittedEmail] = useState("")

  const sendMessage = useMutation({
    mutationFn: (body: { name: string; email: string; message: string; website?: string }) =>
      fetcher<{ success: boolean }>("/contact", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      setForm({ name: "", email: "", message: "", website: "" })
      setErrors({ name: "", email: "", message: "" })
    },
  })

  function validate(): boolean {
    const e = { name: "", email: "", message: "" }
    if (!form.name.trim()) e.name = "Nama tidak boleh kosong."
    if (!form.email.trim()) e.email = "Email tidak boleh kosong."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Format email tidak valid."
    if (!form.message.trim()) e.message = "Pesan tidak boleh kosong."
    else if (form.message.trim().length < 20)
      e.message = "Pesan minimal 20 karakter."
    setErrors(e)
    return !e.name && !e.email && !e.message
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    sendMessage.reset()
    setSubmittedEmail(form.email.trim())
    sendMessage.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      website: form.website.trim(),
    })
  }

  const serverError = sendMessage.isError ? contactErrorMessage(sendMessage.error) : ""
  const messageLength = form.message.trim().length

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-stone-950">
      <header className="bg-white dark:bg-stone-900 border-b border-gray-100 dark:border-stone-800 px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-serif italic text-xl text-brand-dark dark:text-brand-cream hover:opacity-70 transition-opacity"
        >
          DeadlineNote
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="h-10 w-10 px-0" />
          <Link
            to="/login"
            className="text-sm text-gray-500 dark:text-stone-400 hover:text-brand-dark dark:hover:text-brand-cream transition-colors"
          >
          Masuk →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <section>
            <p className="text-xs text-brand-red uppercase tracking-widest mb-2">
              Hubungi Kami
            </p>
            <h1 className="font-serif italic text-4xl md:text-5xl text-brand-dark dark:text-brand-cream mb-3">
              Kontak
            </h1>
            <p className="text-sm text-gray-500 dark:text-stone-400 mb-8 leading-relaxed max-w-md">
              Ada pertanyaan, laporan bug, atau saran fitur? Kirim detailnya di
              sini. Jika perlu tindak lanjut, balasan akan dikirim ke email yang
              kamu tulis.
            </p>

            <div className="flex flex-col gap-3">
              {contactNotes.map(({ title, desc, Icon }) => (
                <div
                  key={title}
                  className="rounded-xl bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 p-4 flex gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-muted dark:bg-stone-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand-red" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-dark dark:text-brand-cream">
                      {title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-stone-400 leading-relaxed mt-1">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {sendMessage.isSuccess ? (
            <section className="bg-white dark:bg-stone-900 rounded-2xl border border-gray-100 dark:border-stone-800 p-8 text-center">
              <CircleCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-lg mb-2">
                Pesan terkirim
              </h2>
              <p className="text-sm text-gray-500 dark:text-stone-400 mb-6">
                Terima kasih sudah menghubungi DeadlineNote. Jika perlu
                tindak lanjut, kami akan membalas ke{" "}
                <span className="font-medium text-brand-dark dark:text-brand-cream">
                  {submittedEmail}
                </span>
                .
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={() => sendMessage.reset()}
                  className="px-6 py-2.5 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark text-sm rounded-lg hover:opacity-80 transition-opacity"
                >
                  Kirim Pesan Lain
                </button>
                <Link
                  to="/"
                  className="px-6 py-2.5 border border-gray-200 dark:border-stone-700 text-gray-600 dark:text-stone-300 text-sm rounded-lg hover:border-brand-dark dark:hover:border-brand-cream hover:text-brand-dark dark:hover:text-brand-cream transition-colors"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </section>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white dark:bg-stone-900 rounded-2xl border border-gray-100 dark:border-stone-800 p-6 md:p-7 flex flex-col gap-4"
            >
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm text-gray-600 dark:text-stone-300 mb-1 block"
                    htmlFor="c-name"
                  >
                    Nama
                  </label>
                  <input
                    id="c-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, name: e.target.value }))
                      setErrors((err) => ({ ...err, name: "" }))
                    }}
                    placeholder="Nama kamu"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "c-name-error" : undefined}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none transition-colors ${
                      errors.name
                        ? "border-brand-red focus:border-brand-red"
                        : "border-gray-200 dark:border-stone-700 focus:border-brand-dark dark:focus:border-brand-cream"
                    }`}
                  />
                  {errors.name && (
                    <p id="c-name-error" className="text-xs text-brand-red mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="text-sm text-gray-600 dark:text-stone-300 mb-1 block"
                    htmlFor="c-email"
                  >
                    Email
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, email: e.target.value }))
                      setErrors((err) => ({ ...err, email: "" }))
                    }}
                    placeholder="nama@email.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "c-email-error" : undefined}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none transition-colors ${
                      errors.email
                        ? "border-brand-red focus:border-brand-red"
                        : "border-gray-200 dark:border-stone-700 focus:border-brand-dark dark:focus:border-brand-cream"
                    }`}
                  />
                  {errors.email && (
                    <p id="c-email-error" className="text-xs text-brand-red mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <label className="text-sm text-gray-600 dark:text-stone-300 block" htmlFor="c-msg">
                    Pesan
                  </label>
                  <span className="text-xs text-gray-400 dark:text-stone-500">
                    {messageLength}/20 min.
                  </span>
                </div>
                <textarea
                  id="c-msg"
                  value={form.message}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, message: e.target.value }))
                    setErrors((err) => ({ ...err, message: "" }))
                  }}
                  rows={8}
                  placeholder="Tuliskan pesan, pertanyaan, atau laporan bug di sini..."
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "c-msg-error" : "c-msg-help"}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none resize-none transition-colors ${
                    errors.message
                      ? "border-brand-red focus:border-brand-red"
                      : "border-gray-200 dark:border-stone-700 focus:border-brand-dark dark:focus:border-brand-cream"
                  }`}
                />
                {errors.message ? (
                  <p id="c-msg-error" className="text-xs text-brand-red mt-1">
                    {errors.message}
                  </p>
                ) : (
                  <p id="c-msg-help" className="text-xs text-gray-400 dark:text-stone-500 mt-1">
                    Minimal 20 karakter agar konteksnya cukup jelas.
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-xs text-brand-red bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={sendMessage.isPending}
                className="w-full py-2.5 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark rounded-lg text-sm font-medium hover:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sendMessage.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Pesan →"
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-stone-700 py-6 px-6 text-center">
        <p className="text-xs text-gray-400 dark:text-stone-500">
          © 2026 DeadlineNote ·{" "}
          <Link
            to="/privacy"
            className="hover:text-brand-dark dark:hover:text-brand-cream transition-colors"
          >
            Privasi
          </Link>{" "}
          ·{" "}
          <Link to="/terms" className="hover:text-brand-dark dark:hover:text-brand-cream transition-colors">
            Syarat Layanan
          </Link>
        </p>
      </footer>
    </div>
  )
}
