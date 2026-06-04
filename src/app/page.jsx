import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="min-h-[80vh] w-full max-w-7xl px-[5%] flex flex-col md:flex-row items-center justify-between gap-12 py-20">
        <div className="flex-1 max-w-2xl">
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold text-sm mb-6 border border-primary/20">
            Gratis & Mudah Digunakan
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Pantau Gizi Anak,<br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cegah Stunting
            </span> Sejak Dini
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            Platform medis modern untuk menghitung status gizi anak secara instan dan dapatkan rekomendasi menu makanan harian sesuai standar AKG WHO.
          </p>
          <div className="flex gap-4">
            <Link href="/calculator" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-primary/50 hover:-translate-y-1">
              Cek Gizi Sekarang
            </Link>
            <a href="#fitur" className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 px-8 py-3 rounded-full font-semibold transition-all">
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center w-full">
          <div className="glass-card p-8 w-full max-w-md animate-[float_6s_ease-in-out_infinite]">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary"></div>
              <div>
                <h4 className="font-bold text-slate-900">Status Gizi: Normal</h4>
                <p className="text-xs text-slate-500">Z-Score: +0.5 SD (Sesuai Usia)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary">1450</div>
                <div className="text-xs text-slate-500">Kkal / Hari</div>
              </div>
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary">45g</div>
                <div className="text-xs text-slate-500">Protein Target</div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Menu Rekomendasi Hari Ini:</p>
              <div className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500">Sarapan</span>
                <span className="text-secondary font-bold">Oatmeal Buah</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="w-full bg-white py-24 px-[5%]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Fitur Unggulan Nutrimeds</h2>
            <p className="text-slate-500 text-lg">Dirancang khusus untuk memudahkan orang tua memantau dan memberikan nutrisi terbaik untuk buah hati.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              title="Kalkulator Antropometri"
              desc="Formulir pintar yang memproses data fisik anak secara instan untuk menampilkan visualisasi status gizi."
            />
            <FeatureCard 
              title="Generator Menu Otomatis"
              desc="Menghasilkan jadwal makan yang mudah didapat di pasar sesuai kebutuhan gizi spesifik anak."
            />
            <FeatureCard 
              title="Cetak PDF 1-Klik"
              desc="Ubah jadwal rekomendasi menu menjadi dokumen PDF yang rapi, siap dipajang di lemari es."
            />
            <FeatureCard 
              title="Manajemen Profil Anak"
              desc="Simpan profil lebih dari satu anak. Riwayat perkembangan dan menu makan tersimpan aman."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden group z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 -z-10 transition-opacity"></div>
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
        <div className="w-6 h-6 bg-primary rounded-md"></div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
