import './globals.css';
import { Inter } from 'next/font/google';
import NavBarWrapper from './components/NavBarWrapper';
import ChatWidget from './components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nutrimeds - Kalkulator Gizi & Rekomendasi Menu Anak',
  description: 'Platform modern untuk memantau status gizi anak dan mendapatkan rekomendasi menu makan gratis sesuai standar AKG/RDA.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
        
        <NavBarWrapper />

        <main className="pt-24 min-h-screen">
          {children}
        </main>

        <ChatWidget />
        
        <footer className="bg-slate-900 text-white py-16 px-[5%] mt-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Nutrimeds</h3>
              <p className="text-slate-400">Aplikasi web gratis untuk memantau status gizi anak dan mendapatkan rekomendasi menu makan bernutrisi tinggi.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/calculator" className="hover:text-primary">Kalkulator Gizi</a></li>
                <li><a href="/dashboard" className="hover:text-primary">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Akun</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/login" className="hover:text-primary">Masuk</a></li>
                <li><a href="/register" className="hover:text-primary">Daftar Gratis</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-slate-800 text-slate-400 text-sm">
            &copy; 2026 Nutrimeds. Hak cipta dilindungi undang-undang.
          </div>
        </footer>
      </body>
    </html>
  );
}
