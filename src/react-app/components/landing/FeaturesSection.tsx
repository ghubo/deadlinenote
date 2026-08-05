import { motion, useReducedMotion } from "motion/react"

// --- Preview Components ---

function DashboardPreview() {
  const items = [
    {
      name: "Kalkulus II",
      subject: "Matematika",
      days: 2,
      pct: 35,
      badge: "Perlu review",
      badgeColor: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300",
    },
    {
      name: "Algoritma Graf",
      subject: "Ilmu Komputer",
      days: 5,
      pct: 60,
      badge: "Sedang",
      badgeColor: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300",
    },
    {
      name: "Teori Bahasa",
      subject: "Ilmu Komputer",
      days: 10,
      pct: 80,
      badge: "Dikuasai",
      badgeColor: "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300",
    },
  ]
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-md p-5 max-w-[420px] w-full pointer-events-none select-none border border-gray-100 dark:border-stone-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-brand-dark dark:text-brand-cream">Prioritas Belajar</h2>
        <span className="text-xs text-gray-400 dark:text-stone-500">Lihat semua →</span>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stone-900 rounded-xl border border-gray-100 dark:border-stone-800 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-brand-dark dark:text-brand-cream text-sm truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-stone-500 mt-0.5 truncate">
                  {item.subject}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-stone-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-brand-red rounded-full"
                style={{ width: `${item.pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-stone-500 mt-1.5">
              {item.days} hari tidak direview
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImageToTextPreview() {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-md p-5 max-w-[390px] w-full pointer-events-none select-none border border-gray-100 dark:border-stone-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-red">
            Image to text
          </p>
          <p className="mt-1 text-sm font-medium text-brand-dark dark:text-brand-cream">
            Ambil teks dari gambar
          </p>
        </div>
        <span className="rounded-full bg-brand-muted dark:bg-stone-800 px-2.5 py-1 text-[10px] text-gray-500 dark:text-stone-400">
          JPEG / PNG / WebP
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[0.8fr_1.2fr] gap-3">
        <div className="relative min-h-52 overflow-hidden rounded-xl border border-gray-200 dark:border-stone-700 bg-[#eee8dc] dark:bg-stone-800 p-3">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 19px, #9ca3af 20px)",
            }}
          />
          <div className="relative -rotate-2 font-serif italic text-brand-dark/75 dark:text-brand-cream/75">
            <p className="text-base">Hukum Newton II</p>
            <p className="mt-5 text-sm">F = m x a</p>
            <p className="mt-4 text-xs leading-5">
              Percepatan benda sebanding dengan gaya total...
            </p>
          </div>
          <div className="absolute bottom-2 left-2 rounded-full bg-white/85 dark:bg-stone-950/85 px-2 py-1 text-[10px] text-gray-600 dark:text-stone-300">
            IMG_2048.jpg
          </div>
        </div>

        <div className="flex min-h-52 flex-col rounded-xl border border-gray-100 dark:border-stone-800 bg-gray-50 dark:bg-stone-950 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-stone-500">
              Teks terbaca
            </p>
          </div>
          <p className="mt-4 text-xs font-medium text-brand-dark dark:text-brand-cream">
            Hukum Newton II
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-stone-300">
            F = m x a
            <br />
            <br />
            Percepatan benda sebanding dengan gaya total yang bekerja padanya.
          </p>
          <div className="mt-auto rounded-lg bg-brand-dark dark:bg-brand-cream px-3 py-2 text-center text-[10px] font-medium text-white dark:text-brand-dark">
            Sisipkan ke catatan
          </div>
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-gray-400 dark:text-stone-500">
        Hasil bisa diperiksa dan dikoreksi sebelum masuk ke catatan.
      </p>
    </div>
  )
}

function PomodoroPreview() {
  const circumference = 2 * Math.PI * 54
  const progress = 0.65
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-md p-6 max-w-[280px] w-full pointer-events-none select-none flex flex-col items-center gap-5 border border-gray-100 dark:border-stone-800">
      <h2 className="font-medium text-brand-dark dark:text-brand-cream text-sm w-full">
        Timer Belajar
      </h2>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#F5F3EE"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#E24B4A"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-brand-dark dark:text-brand-cream tabular-nums">
            16:15
          </span>
          <span className="text-xs text-gray-400 dark:text-stone-500">Fokus</span>
        </div>
      </div>
      <div className="flex gap-2 w-full justify-center">
        <div className="px-5 py-2 bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300 text-sm rounded-lg font-medium">
          Jeda
        </div>
      </div>
    </div>
  )
}

function FlashcardPreview() {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-md p-5 max-w-[380px] w-full pointer-events-none select-none flex flex-col gap-3 border border-gray-100 dark:border-stone-800">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-stone-500">
          Flashcard
        </p>
        <p className="text-xs font-medium text-brand-dark dark:text-brand-cream">3 dari 10</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-stone-800">
        <div className="h-full w-[30%] rounded-full bg-brand-red" />
      </div>
      <div className="rounded-xl border border-brand-red/20 bg-brand-muted dark:bg-stone-800 p-5 min-h-40 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-red">
            Belakang
          </p>
          <p className="mt-4 text-sm leading-relaxed text-brand-dark dark:text-brand-cream">
            Big-O notation menjelaskan batas atas pertumbuhan waktu atau memori
            saat ukuran input bertambah.
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-stone-400 mt-6">Ketuk untuk balik kartu</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-center text-sm font-medium text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-200">
          Latih lagi
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
          Hafal
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-stone-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-stone-700" />
        </div>
        <p className="text-xs text-gray-400 dark:text-stone-500">lanjutkan kartu</p>
      </div>
    </div>
  )
}

function SmartSummaryPreview() {
  const sections = [
    {
      heading: "Konsep utama",
      bullets: ["Definisi ringkas", "Relasi antar topik"],
    },
    {
      heading: "Poin penting",
      bullets: ["Formula yang sering muncul", "Contoh penerapan"],
    },
  ]
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-md p-5 max-w-[380px] w-full pointer-events-none select-none flex flex-col gap-4 border border-gray-100 dark:border-stone-800">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-brand-red">
          Smart Summary
        </p>
        <p className="text-xs text-gray-400 dark:text-stone-500">Copy</p>
      </div>
      <div>
        <p className="font-medium text-brand-dark dark:text-brand-cream">
          Big-O dan Kompleksitas Algoritma
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-stone-300">
          Ringkasan ini merapikan ide utama dari catatan tanpa mengubah isi
          catatan asli.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <div
            key={section.heading}
            className="rounded-xl border border-gray-100 dark:border-stone-800 bg-gray-50 dark:bg-stone-800 p-3"
          >
            <p className="text-sm font-medium text-brand-dark dark:text-brand-cream">
              {section.heading}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {section.bullets.map((bullet) => (
                <p key={bullet} className="text-xs text-gray-500 dark:text-stone-400">
                  - {bullet}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-brand-muted dark:bg-stone-800 px-3 py-2 text-xs leading-relaxed text-gray-700 dark:text-stone-300">
        Fokus pada pertumbuhan input, batas atas performa, dan tradeoff memori.
      </div>
    </div>
  )
}

function ProgressTrackerPreview() {
  const subjects = [
    { name: "Kalkulus II", notes: 12, pct: 35, color: "bg-red-400" },
    { name: "Algoritma", notes: 8, pct: 68, color: "bg-blue-400" },
    { name: "Teori Bahasa", notes: 15, pct: 80, color: "bg-green-400" },
    { name: "Basis Data", notes: 5, pct: 52, color: "bg-purple-400" },
  ]
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-md p-5 max-w-[380px] w-full pointer-events-none select-none border border-gray-100 dark:border-stone-800">
      <h2 className="font-medium text-brand-dark dark:text-brand-cream mb-4">
        Ringkasan Per Mata Kuliah
      </h2>
      <div className="flex flex-col gap-4">
        {subjects.map((s, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color}`}
                />
                <p className="text-sm font-medium text-brand-dark dark:text-brand-cream truncate">
                  {s.name}
                </p>
                <span className="text-xs text-gray-400 dark:text-stone-500 shrink-0">
                  {s.notes} catatan
                </span>
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-stone-300 shrink-0 ml-2">
                {s.pct}%
              </p>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-red"
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-stone-800 flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-stone-500">Rata-rata keseluruhan</p>
        <p className="text-sm font-semibold text-brand-dark dark:text-brand-cream">59%</p>
      </div>
    </div>
  )
}

function DataExportPreview() {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-md p-5 max-w-[380px] w-full pointer-events-none select-none flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 bg-brand-cream dark:bg-stone-950 rounded-full flex items-center justify-center mb-1">
        <svg
          className="w-5 h-5 text-brand-dark dark:text-brand-cream"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-brand-dark dark:text-brand-cream">
          deadlinenote-export.json
        </p>
        <p className="text-xs text-gray-400 dark:text-stone-500 mt-1">
          12 Mata Kuliah · 48 Catatan · 15 Deadline
        </p>
      </div>
      <div className="w-full h-8 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark rounded-lg flex items-center justify-center text-xs font-medium mt-2 opacity-90">
        Unduh Data Utama
      </div>
    </div>
  )
}

// --- Feature Data ---
const features = [
  {
    label: "01 — Prioritas otomatis",
    title: "Dashboard yang tahu mana yang mendesak",
    desc: "Catatanmu diprioritaskan berdasarkan deadline terdekat per mata kuliah, skor penguasaan, dan hari sejak review terakhir.",
    visual: <DashboardPreview />,
  },
  {
    label: "02 — Image to text",
    title: "Foto catatan, lanjutkan sebagai teks",
    desc: "Ambil foto atau pilih satu gambar catatan, periksa hasil pembacaannya, lalu sisipkan teks ke draft tanpa mengetik ulang dari awal.",
    visual: <ImageToTextPreview />,
  },
  {
    label: "03 — Pomodoro terintegrasi",
    title: "Belajar langsung dari halaman catatanmu",
    desc: "Mulai sesi belajar dari catatan, sistem mencatat berapa lama kamu fokus per topik.",
    visual: <PomodoroPreview />,
  },
  {
    label: "04 — Flashcard AI",
    title: "Ubah catatan jadi kartu belajar",
    desc: "Generate flashcard dari isi catatan, balik kartu saat siap mengecek, lalu tandai mana yang sudah hafal atau perlu dilatih lagi.",
    visual: <FlashcardPreview />,
  },
  {
    label: "05 — Smart Summary",
    title: "Baca ulang dari versi yang lebih terstruktur",
    desc: "Generate ringkasan terstruktur dari catatanmu sebagai hasil sementara, lengkap dengan section, poin penting, dan key takeaways.",
    visual: <SmartSummaryPreview />,
  },
  {
    label: "06 — Progress tracker",
    title: "Lihat sejauh mana kamu menguasai materi",
    desc: "Setiap catatan punya skor penguasaan yang diperbarui setelah sesi flashcard atau review. Statistik menampilkan rata-rata per mata kuliah dan keseluruhan.",
    visual: <ProgressTrackerPreview />,
  },
  {
    label: "07 — Portabilitas data",
    title: "Data utama bisa kamu bawa",
    desc: "Unduh catatan, mata kuliah, dan jadwal deadline-mu kapan saja dalam format JSON dari halaman akun.",
    visual: <DataExportPreview />,
  },
]

export function FeaturesSection() {
  const shouldReduce = useReducedMotion()
  return (
    <section id="fitur" className="py-24 px-6 bg-brand-cream dark:bg-stone-950">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-widest text-brand-red mb-3"
        >
          Fitur
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="font-serif italic text-4xl md:text-5xl text-brand-dark dark:text-brand-cream mb-20"
        >
          Semua yang kamu butuhkan,
          <br />
          tidak lebih.
        </motion.h2>
        <div className="flex flex-col gap-24">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: shouldReduce ? 0 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={`flex flex-col md:flex-row items-center gap-12 ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1">
                <p className="text-xs text-gray-400 dark:text-stone-500 uppercase tracking-widest mb-3">
                  {f.label}
                </p>
                <h3 className="font-serif italic text-2xl md:text-3xl text-brand-dark dark:text-brand-cream mb-4">
                  {f.title}
                </h3>
                <p className="text-gray-600 dark:text-stone-300 leading-relaxed">{f.desc}</p>
              </div>
              <div className="flex-1 flex justify-center w-full">
                {f.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
