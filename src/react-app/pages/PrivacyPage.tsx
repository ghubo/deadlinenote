import { Link } from "react-router"
import { ThemeToggle } from "../components/common/ThemeToggle"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-cream dark:bg-stone-950">
      {/* Simple nav */}
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
            to="/login"
            className="text-sm text-gray-500 dark:text-stone-400 hover:text-brand-dark dark:hover:text-brand-cream transition-colors"
          >
          Masuk →
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs text-brand-red uppercase tracking-widest mb-2">
          Legal
        </p>
        <h1 className="font-serif italic text-4xl text-brand-dark dark:text-brand-cream mb-3">
          Kebijakan Privasi
        </h1>
        <p className="text-sm text-gray-400 dark:text-stone-500 mb-10">
          Terakhir diperbarui: Juni 2026
        </p>

        <div className="prose prose-sm prose-gray max-w-none flex flex-col gap-8 text-gray-700 dark:text-stone-300 leading-relaxed">
          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              1. Data yang Kami Kumpulkan
            </h2>
            <p>
              DeadlineNote mengumpulkan data minimum yang diperlukan untuk
              layanan berjalan:
            </p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1 text-sm">
              <li>Nama dan email yang kamu daftarkan</li>
              <li>Catatan, mata kuliah, dan jadwal deadline yang kamu buat</li>
              <li>
                Data sesi belajar dan review (durasi, waktu mulai/selesai,
                status, skor penguasaan, dan hasil review) untuk statistik
                pribadimu
              </li>
              <li>
                Gambar catatan yang kamu unggah sementara saat memakai fitur
                ambil teks dari gambar
              </li>
              <li>
                Pesan dan alamat email jika kamu menghubungi kami melalui
                formulir kontak
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              2. Cara Kami Menggunakan Data
            </h2>
            <p className="text-sm">Data yang kamu berikan digunakan untuk:</p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1 text-sm">
              <li>Menampilkan dashboard dan isi aplikasi sesuai akunmu</li>
              <li>Menyimpan catatan, mata kuliah, dan jadwal deadline</li>
              <li>
                Membaca teks dari gambar, membuat flashcard, dan membuat Smart
                Summary saat kamu memakai fitur AI
              </li>
              <li>
                Menghitung statistik belajar, progres review, dan penguasaan
                materi
              </li>
              <li>Mengelola sesi login dan keamanan dasar akun</li>
              <li>Menjawab pesan yang kamu kirim melalui formulir kontak</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              3. Penyedia Layanan Pihak Ketiga
            </h2>
            <p className="text-sm">
              DeadlineNote menggunakan Cloudflare Workers sebagai server
              aplikasi, serta layanan Cloudflare untuk CDN, penyimpanan data,
              keamanan, dan operasional layanan. Pemrosesan oleh Cloudflare
              mengikuti{" "}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noreferrer"
                className="text-brand-red hover:underline"
              >
                kebijakan privasi Cloudflare
              </a>{" "}
              dan ketentuan Cloudflare.
            </p>
            <p className="text-sm mt-2">
              DeadlineNote juga menggunakan Cloudflare R2 untuk menyimpan
              gambar OCR secara sementara dan Cloudflare AI Gateway untuk fitur
              ambil teks dari gambar, generate flashcard, dan Smart Summary.
              Permintaan AI diarahkan terlebih dahulu ke Cloudflare Workers AI,
              dan dapat menggunakan Gemini API Google / Google AI Studio sebagai
              fallback jika layanan utama gagal. Saat ini, fitur AI
              dikonfigurasi untuk memakai opsi gratis yang tersedia dari
              penyedia tersebut. Pemrosesan AI hanya terjadi saat kamu meminta
              fitur AI dari catatan tertentu, sebagaimana dijelaskan di bagian
              berikutnya.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              4. Penyimpanan Data
            </h2>
            <p className="text-sm">
              Data aplikasi — termasuk akun, sesi login, catatan, mata kuliah,
              deadline, sesi belajar, log review, pesan kontak, dan rate limit
              kontak — disimpan di Cloudflare D1 (SQLite). Ringkasan statistik
              sesi belajar dihitung dari data sesi di D1. Data akun dan data
              belajar bersifat per-pengguna dan tidak dapat diakses oleh
              pengguna lain. Catatan disimpan tanpa enkripsi dan dapat diakses
              oleh administrator DeadlineNote.
            </p>
            <p className="text-sm mt-2">
              Saat kamu memakai fitur ambil teks dari gambar, satu gambar JPEG,
              PNG, atau WebP berukuran maksimal 5 MB disimpan sementara di
              Cloudflare R2 agar dapat dibaca oleh layanan AI. Gambar dibatasi
              untuk akun dan catatan yang mengunggahnya, memiliki masa berlaku
              singkat, dan dijadwalkan untuk dihapus setelah proses pembacaan
              selesai.
            </p>
            <p className="text-sm mt-2">
              Gambar tersebut, atau isi catatan yang dipilih untuk Flashcard
              dan Smart Summary, dikirim dari server DeadlineNote ke Cloudflare
              AI Gateway, lalu diproses melalui Cloudflare Workers AI atau
              Gemini API Google / Google AI Studio sebagai fallback. Hasil teks
              dari gambar ditampilkan untuk diperiksa sebelum kamu
              menyisipkannya ke catatan. API key tidak pernah dikirim ke
              browser.
            </p>
            <p className="text-sm mt-2">
              Pemrosesan data mengikuti ketentuan dan batas penggunaan opsi
              gratis Cloudflare AI Gateway, Cloudflare Workers AI, dan Google
              yang berlaku untuk Gemini API. Lihat{" "}
              <a
                href="https://ai.google.dev/gemini-api/terms"
                target="_blank"
                rel="noreferrer"
                className="text-brand-red hover:underline"
              >
                Gemini API Terms
              </a>{" "}
              untuk detail Google Gemini terbaru. Hindari memasukkan informasi
              sensitif ke catatan atau gambar yang akan diproses dengan fitur
              AI.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              5. Hak Kamu
            </h2>
            <ul className="list-disc list-inside flex flex-col gap-1 text-sm">
              <li>
                Kamu dapat menghapus catatan, mata kuliah, dan deadline kapan
                saja dari dalam aplikasi.
              </li>
              <li>
                Kamu dapat <strong>menghapus akun secara permanen</strong>{" "}
                beserta data aplikasi yang terhubung ke akunmu (catatan, mata
                kuliah, deadline, sesi belajar, dan log review) langsung dari
                halaman{" "}
                <Link to="/account" className="text-brand-red hover:underline">
                  Akun
                </Link>
                . Pesan kontak publik tidak otomatis terhubung ke akun. Tindakan
                ini tidak dapat dibatalkan.
              </li>
              <li>
                Kamu dapat{" "}
                <strong>mengunduh salinan data aplikasi utama</strong> (catatan,
                mata kuliah, dan deadline) dalam format JSON kapan saja dari
                halaman{" "}
                <Link to="/account" className="text-brand-red hover:underline">
                  Akun
                </Link>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              6. Cookie & Penyimpanan Lokal
            </h2>
            <p className="text-sm">
              Aplikasi menggunakan cookie first-party untuk sesi login dan{" "}
              <code className="bg-gray-100 dark:bg-stone-800 px-1 rounded text-xs">
                localStorage
              </code>{" "}
              untuk menyimpan status timer Pomodoro secara lokal di perangkatmu.
              DeadlineNote tidak memasang cookie pelacakan pihak ketiga untuk
              iklan. Cloudflare dapat menggunakan cookie atau mekanisme teknis
              yang diperlukan untuk keamanan, performa, routing, atau
              operasional layanan sesuai konfigurasi dan kebijakan Cloudflare.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              7. Perubahan Kebijakan
            </h2>
            <p className="text-sm">
              Jika ada perubahan signifikan pada kebijakan ini, kami akan
              memperbarui tanggal di bagian atas halaman ini. Penggunaan
              berkelanjutan setelah perubahan dianggap sebagai persetujuan.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              8. Syarat Layanan
            </h2>
            <p className="text-sm">
              Penggunaan DeadlineNote juga tunduk pada{" "}
              <Link to="/terms" className="text-brand-red hover:underline">
                Syarat Layanan
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-brand-dark dark:text-brand-cream text-base mb-2">
              9. Kontak
            </h2>
            <p className="text-sm">
              Pertanyaan terkait privasi dapat dikirimkan melalui{" "}
              <Link to="/contact" className="text-brand-red hover:underline">
                halaman kontak
              </Link>{" "}
              kami.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-stone-700 py-6 px-6 text-center">
        <p className="text-xs text-gray-400 dark:text-stone-500">
          © 2026 DeadlineNote ·{" "}
          <Link to="/terms" className="hover:text-brand-dark dark:hover:text-brand-cream transition-colors">
            Syarat Layanan
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
