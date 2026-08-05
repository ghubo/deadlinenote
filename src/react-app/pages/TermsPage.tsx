import { Link } from "react-router"
import { ThemeToggle } from "../components/common/ThemeToggle"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-cream dark:bg-stone-950">
      <header className="bg-white dark:bg-stone-900 border-b border-gray-100 dark:border-stone-800 px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-serif italic text-xl text-brand-dark dark:text-brand-cream hover:opacity-70 transition-opacity"
        >
          DeadlineNote
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="h-10 w-10 px-0" />
          <Link
            to="/register"
            className="text-sm text-gray-500 dark:text-stone-400 hover:text-brand-dark dark:hover:text-brand-cream transition-colors"
          >
          Daftar →
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs text-brand-red uppercase tracking-widest mb-2">
          Legal
        </p>
        <h1 className="font-serif italic text-4xl text-brand-dark dark:text-brand-cream mb-3">
          Syarat Layanan
        </h1>
        <p className="text-sm text-gray-400 dark:text-stone-500 mb-10">
          Terakhir diperbarui: Juni 2026
        </p>

        <div className="prose prose-sm prose-gray max-w-none flex flex-col gap-8 text-gray-700 dark:text-stone-300 leading-relaxed">
          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              1. Penerimaan Syarat
            </h2>
            <p className="text-sm">
              Dengan mengakses atau menggunakan DeadlineNote, kamu menyetujui
              syarat layanan ini. Jika tidak setuju, mohon hentikan penggunaan
              layanan.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              2. Akun Pengguna
            </h2>
            <ul className="list-disc list-inside flex flex-col gap-1 text-sm">
              <li>Kamu bertanggung jawab atas keamanan akunmu sendiri.</li>
              <li>
                Informasi akun harus akurat dan diperbarui jika terjadi
                perubahan.
              </li>
              <li>
                Kamu bertanggung jawab atas aktivitas yang terjadi pada akunmu.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              3. Konten dan Data
            </h2>
            <p className="text-sm">
              Kamu tetap memiliki konten yang kamu buat (catatan, deadline, dan
              data belajar). Kami memproses data tersebut untuk menjalankan
              fitur aplikasi. Detail pemrosesan data dijelaskan di{" "}
              <Link to="/privacy" className="text-brand-red hover:underline">
                Kebijakan Privasi
              </Link>
              . Detail tentang penyimpanan data, akses administrator, dan
              pemrosesan pihak ketiga juga dijelaskan di halaman tersebut.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              4. Penggunaan yang Dilarang
            </h2>
            <ul className="list-disc list-inside flex flex-col gap-1 text-sm">
              <li>Menggunakan layanan untuk aktivitas melanggar hukum.</li>
              <li>Mencoba mengganggu, merusak, atau membebani sistem.</li>
              <li>Mengakses data pengguna lain tanpa izin.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              5. Layanan Pihak Ketiga
            </h2>
            <p className="text-sm">
              DeadlineNote bergantung pada layanan pihak ketiga untuk berjalan,
              termasuk Cloudflare Workers dan CDN Cloudflare untuk infrastruktur
              aplikasi, penyimpanan data, keamanan, dan operasional layanan;
              Cloudflare R2 untuk penyimpanan sementara gambar OCR; Cloudflare
              AI Gateway untuk routing fitur AI; Cloudflare Workers AI sebagai
              layanan utama untuk pembacaan gambar, generate flashcard, dan
              Smart Summary; serta Gemini API Google / Google AI Studio sebagai
              fallback jika layanan utama gagal. Saat ini, fitur AI
              dikonfigurasi untuk memakai opsi gratis yang tersedia dari
              penyedia tersebut. Penggunaan DeadlineNote berarti kamu memahami
              bahwa data dapat diproses oleh penyedia tersebut sesuai perannya
              dan ketentuan masing-masing.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              6. Fitur AI
            </h2>
            <p className="text-sm">
              Fitur ambil teks dari gambar dapat membaca satu gambar JPEG, PNG,
              atau WebP berukuran maksimal 5 MB. Flashcard dan Smart Summary
              dapat membuat kartu belajar dan ringkasan terstruktur otomatis
              dari catatanmu. Permintaan diproses melalui Cloudflare AI Gateway,
              diarahkan ke Cloudflare Workers AI terlebih dahulu, lalu dapat
              menggunakan Gemini API Google / Google AI Studio sebagai
              fallback. Hasil AI disediakan sebagai alat bantu belajar dan
              dapat tidak lengkap, tidak akurat, atau tidak sesuai konteks
              kelasmu. Kamu tetap bertanggung jawab memeriksa hasil pembacaan
              gambar, materi, ringkasan, dan keputusan belajar yang kamu ambil.
            </p>
            <p className="text-sm mt-2">
              Fitur AI tunduk pada ketersediaan, batas penggunaan opsi gratis,
              dan ketentuan Cloudflare AI Gateway, Cloudflare Workers AI, serta
              Google yang berlaku untuk Gemini API. Jangan memasukkan informasi
              sensitif ke catatan atau gambar yang akan diproses dengan fitur
              AI.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              7. Ketersediaan Layanan
            </h2>
            <p className="text-sm">
              Kami berupaya menjaga layanan tetap tersedia, tetapi tidak
              menjamin layanan selalu bebas gangguan. Fitur dapat berubah,
              ditambah, atau dihentikan sewaktu-waktu.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              8. Batasan Tanggung Jawab
            </h2>
            <p className="text-sm">
              DeadlineNote disediakan sebagaimana adanya. Kami tidak bertanggung
              jawab atas kerugian tidak langsung yang timbul dari penggunaan
              layanan, sejauh diizinkan oleh hukum yang berlaku.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              9. Perubahan Syarat
            </h2>
            <p className="text-sm">
              Kami dapat memperbarui syarat layanan ini sewaktu-waktu. Perubahan
              akan berlaku setelah dipublikasikan pada halaman ini.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              10. Kontak
            </h2>
            <p className="text-sm">
              Jika ada pertanyaan terkait syarat layanan, silakan hubungi kami
              melalui{" "}
              <Link to="/contact" className="text-brand-red hover:underline">
                halaman kontak
              </Link>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-stone-700 py-6 px-6 text-center">
        <p className="text-xs text-gray-400 dark:text-stone-500">
          © 2026 DeadlineNote ·{" "}
          <Link
            to="/privacy"
            className="hover:text-brand-dark dark:hover:text-brand-cream transition-colors"
          >
            Privasi
          </Link>{" "}
          ·{" "}
          <Link
            to="/contact"
            className="hover:text-brand-dark dark:hover:text-brand-cream transition-colors"
          >
            Kontak
          </Link>
        </p>
      </footer>
    </div>
  )
}
