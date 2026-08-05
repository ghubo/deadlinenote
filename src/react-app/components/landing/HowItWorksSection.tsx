import { motion, useReducedMotion } from "motion/react"

const steps = [
  {
    number: "01",
    title: "Tambah mata kuliah & deadline",
    desc: "Input mata kuliah beserta warna, lalu catat jadwal ujian dan tugas di awal semester.",
  },
  {
    number: "02",
    title: "Tulis atau ambil teks dari gambar",
    desc: "Buat catatan per topik, atau foto catatan cetak dan tulisan tangan untuk diubah menjadi draft teks yang bisa kamu koreksi.",
  },
  {
    number: "03",
    title: "Buat bahan belajar",
    desc: "Generate flashcard dan Smart Summary dari isi catatan, lalu mulai sesi fokus dengan Pomodoro.",
  },
  {
    number: "04",
    title: "Uji diri, lalu ikuti prioritas",
    desc: "Tandai kartu yang sudah hafal, lihat skor penguasaan, dan gunakan dashboard untuk memilih materi berikutnya.",
  },
]

export function HowItWorksSection() {
  const shouldReduce = useReducedMotion()
  return (
    <section id="cara-kerja" className="py-24 px-6 bg-brand-muted dark:bg-stone-800">
      <div className="max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-widest text-brand-red mb-3"
        >
          Cara Kerja
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="font-serif italic text-4xl md:text-5xl text-brand-dark dark:text-brand-cream mb-16"
        >
          Empat langkah. Selesai.
        </motion.h2>
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: shouldReduce ? 0 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark flex items-center justify-center text-sm font-medium shrink-0">
                  {step.number}
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-stone-700 my-2" />}
              </div>
              <div className="pb-12">
                <h3 className="font-medium text-brand-dark dark:text-brand-cream mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-stone-400">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
