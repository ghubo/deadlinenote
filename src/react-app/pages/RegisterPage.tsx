import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { signUp, useSession } from "../lib/auth-client"
import { TriangleAlert, Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { ThemeToggle } from "../components/common/ThemeToggle"

const schema = z
  .object({
    name: z
      .string()
      .min(1, "Nama tidak boleh kosong.")
      .min(2, "Nama minimal 2 karakter.")
      .transform((v) => v.trim()),
    email: z.email("Format email tidak valid.").transform((v) => v.trim()),
    password: z
      .string()
      .min(1, "Password tidak boleh kosong.")
      .min(8, "Password minimal 8 karakter.")
      .refine(
        (v) => /[A-Za-z]/.test(v) && /[0-9]/.test(v),
        "Password harus mengandung huruf dan angka."
      )
      .transform((v) => v.normalize("NFKC")),
    confirm: z.string().min(1, "Konfirmasi password tidak boleh kosong."),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Password tidak cocok.",
    path: ["confirm"],
  })

type FormValues = z.infer<typeof schema>

const fieldSchemas = {
  name: schema.shape.name,
  email: schema.shape.email,
  password: schema.shape.password,
}

function validateField(
  field: keyof FormValues,
  value: string,
  ctx?: { password: string }
): string {
  if (field === "confirm") {
    if (!value) return "Konfirmasi password tidak boleh kosong."
    if (value !== ctx?.password) return "Password tidak cocok."
    return ""
  }
  const result = fieldSchemas[field].safeParse(value)
  return result.success ? "" : result.error.issues[0].message
}

function getStrength(pw: string): {
  label: string
  color: string
  width: string
} {
  if (!pw) return { label: "", color: "", width: "0%" }
  const score = [
    /[A-Za-z]/.test(pw) && /[0-9]/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
    pw.length >= 12,
  ].filter(Boolean).length
  if (score === 0) return { label: "Lemah", color: "bg-red-400", width: "25%" }
  if (score === 1)
    return { label: "Cukup", color: "bg-yellow-400", width: "50%" }
  if (score === 2) return { label: "Kuat", color: "bg-green-400", width: "75%" }
  return { label: "Sangat Kuat", color: "bg-green-600", width: "100%" }
}

export default function RegisterPage() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()

  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  })
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")

  const registerMutation = useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      signUp.email(payload),
  })

  useEffect(() => {
    if (!isPending && session) {
      navigate("/dashboard", { replace: true })
    }
  }, [session, isPending, navigate])

  function setField(field: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: "" }))
  }

  function handleBlur(field: keyof FormValues, value: string) {
    setErrors((e) => ({
      ...e,
      [field]: validateField(field, value, { password: fields.password }),
    }))
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    const result = schema.safeParse(fields)
    if (!result.success) {
      const tree = z.treeifyError(result.error)
      setErrors({
        name: tree.properties?.name?.errors?.[0] ?? "",
        email: tree.properties?.email?.errors?.[0] ?? "",
        password: tree.properties?.password?.errors?.[0] ?? "",
        confirm: tree.properties?.confirm?.errors?.[0] ?? "",
      })
      return
    }
    setError("")

    try {
      const { error: authError } = await registerMutation.mutateAsync({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      })
      if (authError) {
        const msg = authError.message || "Registrasi gagal."
        if (
          msg.toLowerCase().includes("already") ||
          msg.toLowerCase().includes("exist")
        ) {
          setErrors((e) => ({ ...e, email: "Email ini sudah terdaftar." }))
        } else {
          setError(msg)
        }
        return
      }
      navigate("/dashboard", { replace: true })
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    }
  }

  const strength = getStrength(fields.password)

  if (isPending) {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-stone-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-brand-dark dark:border-brand-cream border-t-transparent animate-spin" />
      </div>
    )
  }

  if (session) return null

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-stone-950 flex items-center justify-center px-4 py-12">
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 w-full max-w-md shadow-sm">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="font-serif italic text-xl text-brand-dark dark:text-brand-cream hover:opacity-70 transition-opacity"
          >
            DeadlineNote
          </Link>
          <ThemeToggle className="h-10 w-10 px-0" />
        </div>

        <h1 className="text-2xl font-semibold text-brand-dark dark:text-brand-cream mb-6">
          Buat Akun
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* Name */}
          <div>
            <label className="text-sm text-gray-600 dark:text-stone-300 mb-1 block" htmlFor="name">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              value={fields.name}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={(e) => handleBlur("name", e.target.value)}
              autoComplete="name"
              placeholder="mis. Dinda Rahmawati"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none transition-colors ${
                errors.name
                  ? "border-brand-red focus:border-brand-red"
                  : "border-gray-200 dark:border-stone-700 focus:border-brand-dark dark:focus:border-brand-cream"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-brand-red mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600 dark:text-stone-300 mb-1 block" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={fields.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={(e) => handleBlur("email", e.target.value)}
              autoComplete="email"
              placeholder="nama@email.com"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none transition-colors ${
                errors.email
                  ? "border-brand-red focus:border-brand-red"
                  : "border-gray-200 dark:border-stone-700 focus:border-brand-dark dark:focus:border-brand-cream"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-brand-red mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              className="text-sm text-gray-600 dark:text-stone-300 mb-1 block"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={fields.password}
                onChange={(e) => {
                  setField("password", e.target.value)
                  setErrors((er) => ({
                    ...er,
                    confirm: fields.confirm
                      ? validateField("confirm", fields.confirm, {
                          password: e.target.value,
                        })
                      : "",
                  }))
                }}
                onBlur={(e) => handleBlur("password", e.target.value)}
                autoComplete="new-password"
                placeholder="Min. 8 karakter dengan angka"
                className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none transition-colors ${
                  errors.password
                    ? "border-brand-red focus:border-brand-red"
                    : "border-gray-200 dark:border-stone-700 focus:border-brand-dark dark:focus:border-brand-cream"
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-200"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fields.password.length > 0 && (
              <div className="mt-1.5">
                <div className="h-1 bg-gray-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} rounded-full transition-all`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-stone-500 mt-0.5">{strength.label}</p>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-brand-red mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className="text-sm text-gray-600 dark:text-stone-300 mb-1 block"
              htmlFor="confirm"
            >
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={fields.confirm}
                onChange={(e) => setField("confirm", e.target.value)}
                onBlur={(e) => handleBlur("confirm", e.target.value)}
                autoComplete="new-password"
                placeholder="Ulangi password"
                className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm dark:bg-stone-950 dark:text-brand-cream dark:placeholder:text-stone-600 outline-none transition-colors ${
                  errors.confirm
                    ? "border-brand-red focus:border-brand-red"
                    : "border-gray-200 dark:border-stone-700 focus:border-brand-dark dark:focus:border-brand-cream"
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-200"
                aria-label={
                  showConfirm ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-xs text-brand-red mt-1">{errors.confirm}</p>
            )}
          </div>

          {/* General error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <TriangleAlert className="w-4 h-4 text-brand-red shrink-0" />
              <p className="text-sm text-brand-red">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-2.5 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark rounded-lg text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 mt-1"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Mendaftar...
              </span>
            ) : (
              "Daftar Gratis"
            )}
          </button>

          <p className="text-xs text-gray-400 dark:text-stone-500 text-center">
            Dengan mendaftar kamu menyetujui{" "}
            <Link to="/privacy" className="text-brand-dark dark:text-brand-cream hover:underline">
              Kebijakan Privasi
            </Link>{" "}
            dan{" "}
            <Link to="/terms" className="text-brand-dark dark:text-brand-cream hover:underline">
              Syarat Layanan
            </Link>{" "}
            kami.
          </p>
        </form>

        <p className="text-sm text-gray-500 dark:text-stone-400 text-center mt-6">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-brand-red hover:underline font-medium"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
