import { motion, useReducedMotion } from "motion/react"

const problems = [
  { stat: "83%", text: "Mahasiswa tidak membuka catatan sampai H-3 ujian" },
  { stat: "4,2 jam", text: "Waktu belajar terbuang karena tidak terstruktur" },
  {
    stat: "1 dari 2",
    text: "Mahasiswa merasa catatannya tidak membantu saat ujian",
  },
]

export function ProblemSection() {
  const shouldReduce = useReducedMotion()
  return (
    <section className="py-24 px-6 bg-brand-dark text-white">
      <div className="max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-widest text-brand-red mb-4"
        >
          Ilustrasi masalah
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="font-serif italic text-4xl md:text-5xl mb-16"
        >
          Kamu punya catatan. Tapi...
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: shouldReduce ? 0 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              viewport={{ once: true }}
            >
              <p className="font-serif italic text-5xl text-brand-red mb-3">
                {p.stat}
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">{p.text}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          viewport={{ once: true }}
          className="mt-10 text-xs text-gray-500 leading-relaxed"
        >
          Catatan: angka di atas adalah ilustrasi masalah belajar, bukan hasil
          survei atau klaim riset independen.
        </motion.p>
      </div>
    </section>
  )
}
