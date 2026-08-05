import { useState, useEffect } from "react"
import { Link } from "react-router"
import { motion } from "motion/react"
import { ThemeToggle } from "../common/ThemeToggle"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-300 ${
        scrolled ? "bg-brand-cream/90 dark:bg-stone-950/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <Link to="/" className="font-serif italic text-xl text-brand-dark dark:text-brand-cream">
        DeadlineNote
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-stone-300">
        <a href="#fitur" className="hover:text-brand-dark dark:hover:text-brand-cream transition-colors">
          Fitur
        </a>
        <a href="#cara-kerja" className="hover:text-brand-dark dark:hover:text-brand-cream transition-colors">
          Cara Kerja
        </a>
        <Link to="/login" className="hover:text-brand-dark dark:hover:text-brand-cream transition-colors">
          Masuk
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle className="h-10 w-10 px-0" />
        <Link
          to="/register"
          className="text-sm bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
        >
        Mulai Gratis →
        </Link>
      </div>
    </motion.nav>
  )
}

