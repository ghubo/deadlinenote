import { motion, useReducedMotion } from "motion/react"

type Testimonial = {
  quote: string
  name: string
  detail: string
}

const testimonials: Testimonial[] = []

export function TestimonialsSection() {
  const shouldReduce = useReducedMotion()

  if (testimonials.length === 0) return null

  return (
    <section className="py-24 px-6 bg-brand-cream dark:bg-stone-950">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="font-serif italic text-4xl text-brand-dark dark:text-brand-cream mb-12 text-center"
        >
          Kata mereka.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-brand-muted dark:bg-stone-800 border-l-2 border-brand-red rounded-xl p-6"
            >
              <p className="font-serif italic text-brand-dark dark:text-brand-cream leading-relaxed mb-4">
                "{t.quote}"
              </p>
              <p className="text-sm font-medium text-brand-dark dark:text-brand-cream">{t.name}</p>
              <p className="text-xs text-gray-400 dark:text-stone-500">{t.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
