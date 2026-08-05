import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { signIn, useSession } from "../lib/auth-client"
import { TriangleAlert, Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { ThemeToggle } from "../components/common/ThemeToggle"

const schema = z.object({
  email: z.email("Format email tidak valid.").transform((v) => v.trim()),
  password: z
    .string()
    .min(1, "Password tidak boleh kosong.")
    .min(8, "Password minimal 8 karakter.")
    .transform((v) => v.normalize("NFKC")),
})

type FormValues = z.infer<typeof schema>

const fieldSchemas = {
  email: schema.shape.email,
  password: schema.shape.password,
}

function validateField(field: keyof FormValues, value: string): string {
  const result = fieldSchemas[field].safeParse(value)
  return result.success ? "" : result.error.issues[0].message
}

export default function LoginPage() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()

  const [fields, setFields] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const loginMutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      signIn.email(payload),
  })

  useEffect(() => {
    if (!isPending && session) {
      navigate("/dashboard", { replace: true })
    }
  }, [session, isPending, navigate])

  function setField(field: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: "" }))
    setError("")
  }

  function handleBlur(field: keyof FormValues, value: string) {
    setErrors((e) => ({ ...e, [field]: validateField(field, value) }))
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    const result = schema.safeParse(fields)
    if (!result.success) {
      const tree = z.treeifyError(result.error)
      setErrors({
        email: tree.properties?.email?.errors?.[0] ?? "",
        password: tree.properties?.password?.errors?.[0] ?? "",
      })
      return
    }
    setError("")

    try {
      const { error: authError } = await loginMutation.mutateAsync(result.data)
      if (authError) {
        const msg = authError.message ?? ""
        if (
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("credentials")
        ) {
          setError("Email atau password salah.")
        } else if (
          msg.toLowerCase().includes("not found") ||
          msg.toLowerCase().includes("no user")
        ) {
          setError("Akun tidak ditemukan. Periksa email kamu.")
        } else {
          setError(msg || "Login gagal. Coba lagi.")
        }
        return
      }
      navigate("/dashboard", { replace: true })
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.")
    }
  }

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

        <h1 className="text-2xl font-semibold text-brand-dark dark:text-brand-cream mb-1">Masuk</h1>
        <p className="text-sm text-gray-400 dark:text-stone-500 mb-6">Selamat datang kembali 👋</p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
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
                onChange={(e) => setField("password", e.target.value)}
                onBlur={(e) => handleBlur("password", e.target.value)}
                autoComplete="current-password"
                placeholder="Minimal 8 karakter"
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
            {errors.password && (
              <p className="text-xs text-brand-red mt-1">{errors.password}</p>
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
            disabled={loginMutation.isPending}
            className="w-full py-2.5 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark rounded-lg text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 mt-1"
          >
            {loginMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Masuk...
              </span>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-stone-400 text-center mt-6">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-brand-red hover:underline font-medium"
          >
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
