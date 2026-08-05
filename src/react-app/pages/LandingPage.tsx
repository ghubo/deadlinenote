import { Navbar } from "../components/landing/Navbar"
import { HeroSection } from "../components/landing/HeroSection"
import { ProblemSection } from "../components/landing/ProblemSection"
import { FeaturesSection } from "../components/landing/FeaturesSection"
import { HowItWorksSection } from "../components/landing/HowItWorksSection"
import { TestimonialsSection } from "../components/landing/TestimonialsSection"
import { CTASection } from "../components/landing/CTASection"
import { Link } from "react-router"

export default function LandingPage() {
  return (
    <div className="bg-brand-cream dark:bg-stone-950 text-brand-dark dark:text-brand-cream font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <footer className="bg-brand-dark text-white py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <span className="font-serif italic text-xl block mb-1">
                DeadlineNote
              </span>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Aplikasi manajemen catatan & deadline untuk mahasiswa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 text-sm">
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                  Navigasi
                </p>
                <a
                  href="#fitur"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Fitur
                </a>
                <a
                  href="#cara-kerja"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cara Kerja
                </a>
                <Link
                  to="/register"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Daftar Gratis
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                  Info
                </p>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kebijakan Privasi
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Syarat Layanan
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kontak
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-600">
              © 2026 DeadlineNote. Open Source Software.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
