import { useReducedMotion, motion } from "motion/react"
import { Link } from "react-router"

const heading = "Catatan yang tahu kapan ujianmu."
const words = heading.split(" ")

export function HeroSection() {
  const shouldReduce = useReducedMotion()

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  }
  const word = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-16">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0F0F0D 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.04,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-xs font-medium text-brand-red uppercase tracking-widest mb-6"
      >
        Dari mahasiswa, untuk mahasiswa
      </motion.div>

      <motion.h1
        variants={container}
        initial="hidden"
        animate="show"
        className="font-serif italic text-[clamp(2.5rem,8vw,6rem)] leading-none text-brand-dark dark:text-brand-cream max-w-4xl"
      >
        {words.map((w, i) => (
          <motion.span
            key={i}
            variants={word}
            className="inline-block mr-[0.25em]"
          >
            {w}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-6 text-lg text-gray-600 dark:text-stone-300 max-w-xl"
      >
        Foto catatan, rapikan jadi teks, buat flashcard dan ringkasan, lalu
        belajar berdasarkan deadline dan progresmu. Semua dalam satu tempat.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
      >
        <Link
          to="/register"
          className="px-8 py-3.5 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Mulai Gratis →
        </Link>
        <a
          href="#fitur"
          className="text-sm text-gray-500 dark:text-stone-400 hover:text-brand-dark dark:hover:text-brand-cream transition-colors"
        >
          Lihat fitur ↓
        </a>
      </motion.div>
    </section>
  )
}
