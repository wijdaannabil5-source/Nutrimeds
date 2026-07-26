'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth/auth-client';
import { generateNutritionPPTX, THEMES } from '@/lib/nutrition/pptx-helper';
import Link from 'next/link';

// Detailed preview content of the 20 slides
const PREVIEW_SLIDES = [
  { id: 1, category: 'PLATFORM', title: 'Nutrimeds: Revolusi Pemantauan Gizi Anak', desc: 'Slide Judul Utama presentasi mengenai platform Nutrimeds dan pencegahan stunting.' },
  { id: 2, category: 'EDUKASI', title: 'Tantangan Gizi Anak di Era Modern', desc: 'Latar belakang krisis tumbuh kembang, bahaya stunting, dan pentingnya intervensi dini.' },
  { id: 3, category: 'EDUKASI', title: 'Misi Sosial Platform Nutrimeds', desc: 'Visi demokratisasi data gizi medis dan kampanye nasional pencegahan stunting.' },
  { id: 4, category: 'FITUR', title: 'Kalkulator Gizi Antropometri Pintar', desc: 'Penjelasan input parameter fisik anak (usia, BB, TB) dan analisis medis instan.' },
  { id: 5, category: 'MEDIS', title: 'Memahami Standar WHO Z-Score', desc: 'Metodologi perhitungan status gizi secara ilmiah berbasis kurva standar deviasi WHO.' },
  { id: 6, category: 'FITUR', title: 'Generator Menu Makan Otomatis', desc: 'Kurasi menu makan harian (sarapan, siang, malam, camilan) berbahan makanan lokal.' },
  { id: 7, category: 'FITUR', title: 'Ekspor Dokumen & Cetak 1-Klik', desc: 'Fitur ekspor jadwal makan anak menjadi PDF siap cetak untuk dipasang di kulkas.' },
  { id: 8, category: 'FITUR', title: 'Manajemen Banyak Profil Anak', desc: 'Pemantauan grafik pertumbuhan berkala untuk mendeteksi dini perlambatan tumbuh.' },
  { id: 9, category: 'NUTRISI', title: 'Protein Hewani: Senjata Cegah Stunting', desc: 'Mengapa asam amino esensial hewani lebih efektif dibanding protein nabati.' },
  { id: 10, category: 'NUTRISI', title: 'Vitamin & Mineral Penting bagi Anak', desc: 'Fungsi mikro-nutrien utama: Zat Besi, Kalsium, Zinc, Vitamin A, C, dan D.' },
  { id: 11, category: 'PANDUAN', title: 'Panduan MPASI Bayi (6-11 Bulan)', desc: 'Panduan transisi tekstur bubur saring halus hingga finger foods yang adekuat.' },
  { id: 12, category: 'PANDUAN', title: 'Pola Makan Anak Balita (1-5 Tahun)', desc: 'Kebutuhan energi harian (~1000-1400 Kkal) dan distribusi pembagian kalori.' },
  { id: 13, category: 'PANDUAN', title: 'Nutrisi Optimal Anak Usia Sekolah', desc: 'Pentingnya sarapan pagi untuk kecerdasan anak dan pemilihan jajanan sehat.' },
  { id: 14, category: 'TIPS', title: 'Mengatasi Gerakan Tutup Mulut (GTM)', desc: 'Penerapan feeding rules, teknik penyajian menarik, dan makan tanpa distraksi.' },
  { id: 15, category: 'MEDIS', title: 'Hindari Makanan Ini Sebelum Usia 2 Tahun', desc: 'Pantangan medis untuk balita (madu mentah, susu sapi cair utama, garam/gula berlebih).' },
  { id: 16, category: 'MEDIS', title: 'Dampak & Komplikasi Kronis Gizi Buruk', desc: 'Bahaya kerusakan permanen pada kognitif otak, sistem imun, jantung, dan otot.' },
  { id: 17, category: 'PANDUAN', title: 'ASI Eksklusif & Menyusui 2 Tahun', desc: 'Keajaiban nutrisi ASI, kandungan imunoglobin alami, dan teknik sukses menyusui.' },
  { id: 18, category: 'IDAI', title: '5 Langkah Asuhan Nutrisi Pediatrik IDAI', desc: 'Protokol IDAI: Assessment, Kebutuhan, Rute, Formulasi, dan Monitoring gizi.' },
  { id: 19, category: 'IDAI', title: 'Aturan Makan (Feeding Rules) IDAI', desc: 'Membangun disiplin meja makan dengan membatasi durasi makan maksimal 30 menit.' },
  { id: 20, category: 'PLATFORM', title: 'Kesimpulan & Aksi Nyata Bersama', desc: 'Ajakan kolaborasi mewujudkan generasi emas Indonesia yang sehat dan bebas stunting.' }
];

export default function PptxClient() {
  const { data: session } = useSession();
  const [selectedTheme, setSelectedTheme] = useState('mint');
  const [presentationType, setPresentationType] = useState('general');
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [childMeasurements, setChildMeasurements] = useState(null);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch children list if authenticated
  useEffect(() => {
    if (session) {
      setLoadingChildren(true);
      fetch('/api/children')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setChildrenList(json.data);
            if (json.data.length > 0) {
              setSelectedChildId(json.data[0].id);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingChildren(false));
    }
  }, [session]);

  // Fetch latest measurement when active child ID changes
  useEffect(() => {
    if (selectedChildId) {
      fetch(`/api/measurements?childId=${selectedChildId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data.length > 0) {
            // Get latest measurement
            setChildMeasurements(json.data[json.data.length - 1]);
          } else {
            setChildMeasurements(null);
          }
        })
        .catch(() => setChildMeasurements(null));
    } else {
      setChildMeasurements(null);
    }
  }, [selectedChildId]);

  const handleDownload = async () => {
    setGenerating(true);
    setSuccessMsg('');

    try {
      let childData = null;
      if (presentationType === 'custom' && selectedChildId) {
        const activeChild = childrenList.find((c) => c.id === selectedChildId);
        if (activeChild) {
          childData = {
            name: activeChild.name,
            status: childMeasurements ? childMeasurements.nutritionStatus : 'Belum Diukur',
            calories: childMeasurements ? childMeasurements.recommendedCalories : null,
          };
        }
      }

      const pptx = await generateNutritionPPTX(selectedTheme, childData);
      
      const fileName = childData
        ? `Laporan-Gizi-${childData.name.replace(/\s+/g, '-')}.pptx`
        : 'Presentasi-Edukasi-Gizi-Nutrimeds.pptx';

      await pptx.writeFile({ fileName });
      
      setSuccessMsg(`Berhasil mengunduh dokumen "${fileName}". Silakan periksa folder unduhan Anda.`);
    } catch (err) {
      console.error(err);
      alert('Gagal membuat file presentasi. Silakan coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-[5%] py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold text-sm mb-4 border border-primary/20">
          Alat Bantu Presentasi Edukatif
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
          Generator Presentasi{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            PPTX 20 Slide
          </span>
        </h1>
        <p className="text-slate-500 text-lg">
          Unduh secara instan dokumen file PowerPoint (.pptx) lengkap sepanjang 20 slide yang dirancang secara profesional untuk penyuluhan gizi anak dan pencegahan stunting.
        </p>
      </div>

      {/* Control Dashboard Card */}
      <div className="glass-card p-8 mb-16 border border-slate-200 shadow-xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>⚙️</span> Konfigurasi Presentasi
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Theme Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Pilih Tema Warna Presentasi
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-primary transition-all font-medium"
            >
              {Object.entries(THEMES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Tema menentukan warna latar belakang slide, font, dan elemen visual hiasan.
            </p>
          </div>

          {/* Presentation Source */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Jenis Presentasi
            </label>
            <select
              value={presentationType}
              onChange={(e) => setPresentationType(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-primary transition-all font-medium"
            >
              <option value="general">Panduan Edukasi Gizi Umum (20 Slide)</option>
              {session && childrenList.length > 0 && (
                <option value="custom">Rekomendasi Kustom Data Anak (20 Slide)</option>
              )}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              {!session 
                ? 'Ingin membuat presentasi kustom? Silakan masuk / daftar terlebih dahulu.' 
                : childrenList.length === 0 
                ? 'Belum ada profil anak terdaftar di akun Anda untuk kustomisasi.'
                : 'Pilih opsi kustom untuk memuat data tumbuh kembang anak Anda ke dalam slide.'}
            </p>
          </div>
        </div>

        {/* Custom child profiles options */}
        {presentationType === 'custom' && session && childrenList.length > 0 && (
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl mb-8 animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Pilih Profil Anak</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary font-medium"
                >
                  {childrenList.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedChildId && (
                <div className="text-sm flex flex-col justify-center">
                  {childMeasurements ? (
                    <p className="text-slate-600 font-medium">
                      Status Terakhir:{' '}
                      <span className="text-primary font-bold">{childMeasurements.nutritionStatus}</span>
                      {childMeasurements.recommendedCalories && (
                        <span> • Kebutuhan Kalori: <span className="text-primary font-bold">{childMeasurements.recommendedCalories} Kkal</span></span>
                      )}
                    </p>
                  ) : (
                    <p className="text-slate-500 italic">
                      Belum ada riwayat pengukuran untuk anak ini. Presentasi akan menggunakan estimasi umum.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-100">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="w-full md:w-auto bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-primary/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 cursor-pointer"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyusun Slide PPTX...
              </>
            ) : (
              <>
                <span>📊</span> Unduh Presentasi PPTX
              </>
            )}
          </button>

          {successMsg && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 text-center animate-[fadeIn_0.3s_ease-out]">
              ✅ {successMsg}
            </div>
          )}
        </div>
      </div>

      {/* Slide Preview Title */}
      <div className="border-b border-slate-200 pb-4 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span>🖥️</span> Daftar & Preview Urutan 20 Slide
        </h2>
        <p className="text-slate-500 text-sm">
          Berikut adalah urutan 20 slide materi edukasi gizi dan stunting yang akan terbuat di dalam file PowerPoint (.pptx).
        </p>
      </div>

      {/* Slide Preview Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PREVIEW_SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="bg-white border border-slate-100 hover:border-primary/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white transition-all">
              {slide.id}
            </div>
            
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold text-xs uppercase tracking-wider mb-4">
              {slide.category}
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-2 pr-12 group-hover:text-primary transition-colors">
              {slide.title}
            </h3>

            <p className="text-slate-500 text-sm leading-relaxed">
              {slide.desc}
            </p>
          </div>
        ))}
      </div>
      
      {/* Call to Action for Calculator */}
      <div className="mt-20 text-center bg-gradient-to-br from-slate-900 via-slate-850 to-primary/20 text-white rounded-3xl p-10 md:p-16 border border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4">Punya Profil Anak untuk Dipantau?</h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Hitung status antropometri Z-Score anak secara instan dan dapatkan rekomendasi menu makan hariannya dengan Kalkulator Gizi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/calculator"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg hover:shadow-primary/30"
            >
              Cek Gizi Sekarang
            </Link>
            <Link
              href="/"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3.5 rounded-full font-bold transition-all border border-slate-700"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
