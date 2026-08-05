import { motion, useReducedMotion } from "motion/react"
import { Link } from "react-router"

export function CTASection() {
  const shouldReduce = useReducedMotion()
  return (
    <section className="py-32 px-6 bg-brand-dark text-white text-center">
      <motion.h2
        initial={{ opacity: 0, y: shouldReduce ? 0 : 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="font-serif italic text-4xl md:text-6xl mb-6"
      >
        Ujianmu 3 minggu lagi.
        <br />
        Mulai hari ini.
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <Link
          to="/register"
          className="inline-block px-10 py-4 bg-white text-brand-dark font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          Buat Akun Gratis →
        </Link>
      </motion.div>
    </section>
  )
}
