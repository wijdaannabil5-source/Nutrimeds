import pptxgen from 'pptxgenjs';

// Color themes mapping
export const THEMES = {
  mint: {
    name: 'Mint Forest (Default)',
    bg: 'F4FAF8',
    primary: '0F5B46',
    secondary: '2D9F75',
    accent: 'E8F4F1',
    text: '1E293B',
    title: '0F5B46',
    white: 'FFFFFF',
    isDark: false
  },
  cyber: {
    name: 'Cyber Dark (Modern)',
    bg: '0F172A',
    primary: '38BDF8',
    secondary: '818CF8',
    accent: '1E293B',
    text: 'E2E8F0',
    title: '38BDF8',
    white: '1E293B',
    isDark: true
  },
  apricot: {
    name: 'Warm Apricot (Energetic)',
    bg: 'FFFBEB',
    primary: 'D97706',
    secondary: 'F59E0B',
    accent: 'FEF3C7',
    text: '1E293B',
    title: 'B45309',
    white: 'FFFFFF',
    isDark: false
  },
  royal: {
    name: 'Royal Indigo (Professional)',
    bg: 'F8FAFC',
    primary: '4F46E5',
    secondary: '06B6D4',
    accent: 'EEF2F6',
    text: '1E293B',
    title: '4F46E5',
    white: 'FFFFFF',
    isDark: false
  }
};

/**
 * Generate a highly professional 20-slide PowerPoint presentation.
 * 
 * @param {string} themeName - Theme key (mint, cyber, apricot, royal)
 * @param {object} childData - Optional profile info to personalize the slides
 * @returns {Promise<pptxgen>} - pptxgen presentation object
 */
export async function generateNutritionPPTX(themeName = 'mint', childData = null) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const theme = THEMES[themeName] || THEMES.mint;

  // Slide content structure
  const slidesData = [
    // Slide 1: Title
    {
      category: 'NUTRIMEDS PRESENTATION',
      title: 'Nutrimeds: Revolusi Pemantauan Gizi Anak & Cegah Stunting',
      layout: 'title',
      content: {
        subtitle: 'Platform Medis Pintar untuk Masa Depan Tumbuh Kembang Buah Hati',
        meta: `Dibuat secara otomatis oleh Generator Nutrimeds • ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        tagline: 'Solusi Aksesibilitas Gizi Balita & Anak Sekolah Gratis dan Presisi.'
      }
    },
    // Slide 2: Latar Belakang Masalah Gizi
    {
      category: 'LATAR BELAKANG',
      title: 'Tantangan Gizi Anak di Era Modern',
      layout: 'two_column',
      content: {
        leftTitle: '🔴 Krisis Tumbuh Kembang',
        leftText: [
          '• Stunting: Banyak orang tua terlambat menyadari anak mengalami gagal tumbuh karena tinggi badan di bawah standar WHO.',
          '• Malnutrisi Ganda: Risiko gizi kurang (undernutrition) serta kelebihan berat badan (obesitas) terjadi secara bersamaan di masyarakat.',
          '• Kurangnya Informasi: Kurangnya pemahaman tentang standar antropometri WHO dan takaran gizi harian (AKG/RDA).'
        ],
        rightTitle: '💡 Pentingnya Intervensi Dini',
        rightText: [
          '• Usia Emas (0-5 tahun) adalah masa kritis perkembangan otak dan fisik anak.',
          '• Keterlambatan intervensi gizi dapat berdampak permanen hingga anak dewasa.',
          '• Nutrimeds hadir menjembatani kebutuhan kalkulasi medis yang mudah dipahami secara gratis.'
        ]
      }
    },
    // Slide 3: Visi & Misi Nutrimeds
    {
      category: 'VISI & MISI',
      title: 'Misi Sosial Platform Nutrimeds',
      layout: 'one_column',
      content: {
        subtitle: 'Menyediakan akses kesehatan dan kalkulasi nutrisi terstandar secara merata tanpa biaya.',
        points: [
          '⭐ Demokratisasi Data Medis: Membantu setiap ibu dan ayah memantau grafik tumbuh kembang anak secara digital.',
          '⭐ Penyusunan Menu Berkelanjutan: Merekomendasikan menu makan harian berbasis bahan makanan lokal yang mudah dicari di pasar.',
          '⭐ Pencegahan Stunting Nasional: Berpartisipasi aktif dalam kampanye pencegahan stunting melalui edukasi gizi digital terstruktur.',
          '⭐ Skalabilitas Tinggi: Dirancang ringan dan responsif untuk diakses lancar oleh ratusan hingga ribuan pengguna harian.'
        ]
      }
    },
    // Slide 4: Fitur 1 - Kalkulator Gizi
    {
      category: 'FITUR PLATFORM',
      title: 'Kalkulator Gizi Antropometri Pintar',
      layout: 'two_column',
      content: {
        leftTitle: '📝 Input Parameter Fisik',
        leftText: [
          '• Tanggal Lahir (Usia): Untuk akurasi rentang bulan standar WHO.',
          '• Berat Badan (kg) & Tinggi Badan (cm): Parameter utama Z-score.',
          '• Jenis Kelamin: Menentukan kurva acuan pertumbuhan anak (anak laki-laki dan perempuan memiliki tabel WHO yang berbeda).'
        ],
        rightTitle: '📊 Output Analisis Medis',
        rightText: [
          '• Klasifikasi Status Gizi: Secara instan mengelompokkan kondisi anak (Gizi Normal, Kurang, Risiko Stunting, Obesitas).',
          '• Angka Kecukupan Gizi (AKG): Menampilkan rekomendasi kalori harian.',
          '• Grafik Tren Perkembangan: Riwayat pengukuran dipetakan secara kronologis.'
        ]
      }
    },
    // Slide 5: Standar Medis WHO Z-Score
    {
      category: 'STANDAR MEDIS',
      title: 'Memahami Standar WHO Z-Score',
      layout: 'one_column',
      content: {
        subtitle: 'Bagaimana status gizi dihitung secara ilmiah di dalam aplikasi?',
        points: [
          '• Rumus Z-Score: Membandingkan berat/tinggi anak dengan median populasi referensi WHO untuk usia/jenis kelamin yang sama.',
          '• Klasifikasi Tinggi Badan (TB/U): Sangat Pendek (Z < -3), Pendek (-3 ≤ Z < -2), Normal (-2 ≤ Z ≤ +3), Tinggi (Z > +3).',
          '• Klasifikasi Berat Badan (BB/U): Berat Badan Sangat Kurang (Z < -3), Berat Badan Kurang (-3 ≤ Z < -2), Normal (-2 ≤ Z ≤ +1).',
          '• Nutrimeds mengotomatiskan matematika medis yang rumit ini agar orang tua memperoleh hasil dalam 1 detik.'
        ]
      }
    },
    // Slide 6: Fitur 2 - Generator Menu Makan
    {
      category: 'FITUR PLATFORM',
      title: 'Generator Menu Makan Otomatis',
      layout: 'two_column',
      content: {
        leftTitle: '🍽️ Kurasi Menu Harian',
        leftText: [
          '• Pembagian 4 Sesi Makan: Sarapan, Makan Siang, Makan Malam, dan Camilan Sehat.',
          '• Proporsi Seimbang: Menjamin kecukupan karbohidrat, protein hewani/nabati, lemak, dan serat.',
          '• Kustomisasi Kalori: Porsi makanan secara otomatis dikalibrasi mengikuti kebutuhan energi harian anak.'
        ],
        rightTitle: '🇮🇩 Kearifan Bahan Lokal',
        rightText: [
          '• Murah dan Mudah Didapat: Mengutamakan bahan lokal seperti tempe, tahu, telur, sayur bayam, wortel, pepaya, dan ikan kembung.',
          '• Nilai Gizi Tinggi: Terbukti secara nutrisi setara dengan bahan impor premium (misal: kandungan protein ikan kembung setara salmon).'
        ]
      }
    },
    // Slide 7: Fitur 3 - Ekspor PDF 1-Klik
    {
      category: 'FITUR PLATFORM',
      title: 'Ekspor Dokumen & Cetak 1-Klik',
      layout: 'one_column',
      content: {
        subtitle: 'Fitur praktis untuk memudahkan integrasi menu di kehidupan sehari-hari.',
        points: [
          '• Konversi Instan: Mengubah tabel hasil pemeriksaan antropometri dan jadwal makan menjadi file PDF.',
          '• Desain Siap Cetak: PDF dioptimalkan untuk ukuran kertas cetak standar agar mudah dipasang di pintu kulkas/dinding dapur.',
          '• Pendamping Belanja: Daftar bahan makanan yang ringkas memudahkan orang tua berbelanja di pasar lokal.',
          '• Akses Offline: Menyimpan jadwal rekomendasi di handphone tanpa memerlukan kuota internet berulang kali.'
        ]
      }
    },
    // Slide 8: Fitur 4 - Manajemen Banyak Profil
    {
      category: 'FITUR PLATFORM',
      title: 'Manajemen Banyak Profil Anak',
      layout: 'two_column',
      content: {
        leftTitle: '👶 Akun Keluarga Terpadu',
        leftText: [
          '• Multi-Profil: Satu akun orang tua dapat menyimpan profil beberapa anak secara terpisah.',
          '• Riwayat Pengukuran: Menyimpan data tinggi dan berat badan bulanan untuk melihat kurva pertumbuhan.',
          '• Keamanan Data: Informasi anak tersimpan dengan aman menggunakan enkripsi database SQLite terintegrasi.'
        ],
        rightTitle: '📈 Manfaat Pemantauan Berkala',
        rightText: [
          '• Membantu mendeteksi dini jika pertumbuhan anak melambat (faltering growth).',
          '• Mempermudah konsultasi ke dokter spesialis anak dengan membawa riwayat data yang tercatat rapi.',
          '• Rekomendasi menu disesuaikan dinamis seiring pertambahan usia anak.'
        ]
      }
    },
    // Slide 9: Protein Hewani
    {
      category: 'NUTRISI KUNCI',
      title: 'Protein Hewani: Senjata Utama Cegah Stunting',
      layout: 'one_column',
      content: {
        subtitle: 'Mengapa protein hewani lebih diutamakan dibanding protein nabati dalam pencegahan stunting?',
        points: [
          '• Asam Amino Lengkap: Mengandung seluruh asam amino esensial yang dibutuhkan untuk hormon pertumbuhan tulang anak.',
          '• Penyerapan Lebih Tinggi: Protein hewani memiliki bioavailabilitas tinggi (mudah diserap tubuh secara maksimal).',
          '• Sumber Lokal Terbaik: Telur ayam (murah & praktis), hati ayam (sangat kaya zat besi), ikan kembung/lele (kaya omega-3).',
          '• Rekomendasi: Minimal harus ada 1 porsi protein hewani di setiap sesi makan utama anak.'
        ]
      }
    },
    // Slide 10: Vitamin & Mineral
    {
      category: 'NUTRISI KUNCI',
      title: 'Vitamin & Mineral Penting bagi Anak',
      layout: 'two_column',
      content: {
        leftTitle: '🩸 Zat Besi, Kalsium & Zinc',
        leftText: [
          '• Zat Besi: Penting untuk mencegah anemia dan meningkatkan daya konsentrasi otak. Sumber: hati ayam, daging merah.',
          '• Kalsium: Pembentuk kepadatan tulang dan gigi. Sumber: susu, teri nasi, tahu.',
          '• Zinc/Seng: Mendukung imunitas dan memicu pembelahan sel tubuh secara optimal. Sumber: telur, kacang-kacangan.'
        ],
        rightTitle: '🍊 Vitamin A, C & D',
        rightText: [
          '• Vitamin A: Kesehatan mata dan integritas organ dalam. Sumber: wortel, labu kuning.',
          '• Vitamin C: Meningkatkan imunitas dan membantu penyerapan zat besi. Sumber: jeruk, pepaya.',
          '• Vitamin D: Membantu tubuh menyerap kalsium untuk tulang. Sumber: paparan sinar matahari, kuning telur.'
        ]
      }
    },
    // Slide 11: Panduan MPASI (6-11 Bulan)
    {
      category: 'PANDUAN USIA',
      title: 'Panduan Makanan Pendamping ASI (MPASI)',
      layout: 'one_column',
      content: {
        subtitle: 'Panduan transisi makan untuk bayi usia 6 hingga 11 bulan.',
        points: [
          '• Usia 6 Bulan (Perkenalan): Tekstur bubur halus (puree/saring), frekuensi 2-3x sehari, porsi 2-3 sendok makan.',
          '• Usia 7-8 Bulan (Tekstur Naik): Tekstur bubur kasar (mashed/saring kasar), frekuensi 2-3x makan utama + 1-2x camilan.',
          '• Usia 9-11 Bulan (Finger Foods): Tekstur dicincang halus atau makanan yang bisa digenggam anak secara mandiri.',
          '• Golden Rules: MPASI wajib mengandung karbohidrat, protein hewani, sayur, dan lemak tambahan (minyak/mentega).'
        ]
      }
    },
    // Slide 12: Panduan Balita (1-5 Tahun)
    {
      category: 'PANDUAN USIA',
      title: 'Pola Makan Anak Balita (1-5 Tahun)',
      layout: 'two_column',
      content: {
        leftTitle: '⚡ Kebutuhan Energi & Porsi',
        leftText: [
          '• Usia 1-3 tahun: Memerlukan energi sekitar 1000-1100 Kkal/hari.',
          '• Usia 4-5 tahun: Memerlukan energi sekitar 1200-1400 Kkal/hari.',
          '• Pola Ideal: 3x makan utama porsi sedang + 2x camilan sehat di antara jam makan.',
          '• Distribusi Kalori: Sarapan (25%), Makan Siang (30%), Malam (25%), Camilan (20%).'
        ],
        rightTitle: '🥦 Kebiasaan Makan Sehat',
        rightText: [
          '• Latih motorik halus anak dengan membiarkan mereka belajar memegang sendok dan makan secara mandiri.',
          '• Batasi konsumsi jus buah instan yang tinggi gula bebas, lebih baik sajikan potongan buah segar.',
          '• Jangan memaksa anak menghabiskan makanan jika mereka menunjukkan tanda kenyang.'
        ]
      }
    },
    // Slide 13: Panduan Anak Sekolah (6-12 Tahun)
    {
      category: 'PANDUAN USIA',
      title: 'Nutrisi Optimal untuk Anak Usia Sekolah',
      layout: 'one_column',
      content: {
        subtitle: 'Mendukung konsentrasi belajar dan aktivitas fisik di sekolah dasar (6-12 tahun).',
        points: [
          '• Wajib Sarapan Pagi: Sarapan bernutrisi terbukti meningkatkan daya konsentrasi, memori, dan prestasi anak di sekolah.',
          '• Ide Bekal Sehat: Bawakan bekal dari rumah seperti sandwich telur, nasi kuning mini, buah potong, dan air putih.',
          '• Edukasi Jajanan: Ajarkan anak menghindari jajanan berwarna mencolok, mengandung pengawet, atau terlalu asin/manis.',
          '• Kebutuhan Kalsium: Anak usia sekolah membutuhkan kalsium tinggi untuk masa pertumbuhan tulang cepat (growth spurt).'
        ]
      }
    },
    // Slide 14: Mengatasi Anak Susah Makan (GTM)
    {
      category: 'TIPS ORANG TUA',
      title: 'Mengatasi Gerakan Tutup Mulut (GTM)',
      layout: 'two_column',
      content: {
        leftTitle: '🎨 Penyajian & Suasana',
        leftText: [
          '• Sajikan Menarik: Cetak nasi atau potong sayuran berbentuk lucu (hewan, bintang, bunga).',
          '• Porsi Kecil: Tawarkan porsi kecil terlebih dahulu untuk menghindari anak merasa kewalahan.',
          '• Libatkan Anak: Ajak si kecil memilih bahan belanjaan atau membantu menghias makanan di piring.'
        ],
        rightTitle: '📵 Aturan Dasar Meja Makan',
        rightText: [
          '• Bebas Gadget & Mainan: Matikan TV dan singkirkan gadget saat makan agar anak fokus merasakan tekstur makanan.',
          '• Konsisten Waktu: Batasi durasi makan maksimal 30 menit. Jika menolak setelah 30 menit, hentikan makan secara tenang.',
          '• Hindari Paksaan: Memaksa anak makan dapat menimbulkan trauma jangka panjang.'
        ]
      }
    },
    // Slide 15: Pantangan Anak di Bawah 2 Tahun
    {
      category: 'PANDUAN MEDIS',
      title: 'Hindari Makanan Ini Sebelum Usia 2 Tahun',
      layout: 'one_column',
      content: {
        subtitle: 'Beberapa jenis bahan makanan yang berisiko bagi sistem pencernaan dan ginjal balita.',
        points: [
          '• Madu Mentah (Usia < 1 Tahun): Berisiko memicu botulisme bayi akibat spora bakteri Clostridium botulinum.',
          '• Susu UHT / Susu Sapi Segar (Usia < 1 Tahun): Tidak boleh dijadikan minuman utama karena belom bisa dicerna ginjal bayi.',
          '• Garam & Gula Tambahan: Hindari garam berlebih untuk melindungi ginjal anak, serta gula berlebih untuk mencegah karies gigi.',
          '• Makanan Setengah Matang: Hindari telur setengah matang atau daging kurang matang karena risiko kontaminasi bakteri Salmonella.'
        ]
      }
    },
    // Slide 16: Bahaya Komplikasi Gizi Buruk
    {
      category: 'PANDUAN MEDIS',
      title: 'Dampak & Komplikasi Kronis Gizi Buruk',
      layout: 'two_column',
      content: {
        leftTitle: '🧠 Gangguan Otak & Otot',
        leftText: [
          '• Keterlambatan Kognitif: Kurangnya asupan lemak sehat dan zat besi menghambat pembentukan sinapsis saraf otak anak.',
          '• Atrofi Otot: Tubuh memecah massa ototnya sendiri untuk dijadikan energi darurat, membuat tubuh anak terlihat sangat kurus.'
        ],
        rightTitle: '🫁 Gangguan Organ & Imun',
        rightText: [
          '• Penurunan Sistem Imun: Anak menjadi sangat rentan terkena infeksi berbahaya seperti pneumonia dan tuberkulosis (TBC).',
          '• Gangguan Fungsi Jantung: Otot jantung dapat melemah secara bertahap, meningkatkan risiko gagal sirkulasi akut.'
        ]
      }
    },
    // Slide 17: ASI Eksklusif & Menyusui
    {
      category: 'PANDUAN USIA',
      title: 'Panduan ASI Eksklusif & Menyusui 2 Tahun',
      layout: 'one_column',
      content: {
        subtitle: 'Mengapa air susu ibu tetap menjadi nutrisi terbaik?',
        points: [
          '• ASI Eksklusif (0-6 Bulan): Memenuhi 100% kebutuhan gizi bayi tanpa memerlukan tambahan air putih maupun makanan lain.',
          '• Kandungan Imunoglobin: Mentransfer kekebalan tubuh ibu secara alami untuk melindungi usus bayi dari bakteri.',
          '• ASI Lanjutan (6-24 Bulan): Menyumbang sekitar 35-40% kebutuhan kalori harian balita serta mempererat ikatan batin.',
          '• Sukses Menyusui: Berikan ASI sesering mungkin (on demand) karena hisapan bayi merangsang kelenjar memproduksi lebih banyak ASI.'
        ]
      }
    },
    // Slide 18: Asuhan Nutrisi Pediatrik (ANP)
    {
      category: 'STANDAR IDAI',
      title: '5 Langkah Asuhan Nutrisi Pediatrik IDAI',
      layout: 'two_column',
      content: {
        leftTitle: '🔍 Langkah 1 - 3',
        leftText: [
          '• 1. Penilaian (Assessment): Mengukur berat, tinggi, lingkar kepala dan memplot pada kurva standar WHO.',
          '• 2. Kebutuhan (Requirement): Menghitung kalori, protein, lemak, karbohidrat sesuai target pertumbuhan anak.',
          '• 3. Rute (Route): Memprioritaskan pemberian makanan secara oral. Menggunakan NGT hanya jika ada gangguan menelan.'
        ],
        rightTitle: '🧪 Langkah 4 - 5',
        rightText: [
          '• 4. Formulasi (Formulation): Menentukan jenis makanan (MPASI, makanan keluarga, atau susu formula khusus jika indikasi medis).',
          '• 5. Pemantauan (Monitoring): Mengevaluasi kenaikan berat badan berkala serta mendeteksi adanya efek samping pencernaan.'
        ]
      }
    },
    // Slide 19: Feeding Rules IDAI
    {
      category: 'STANDAR IDAI',
      title: 'Penerapan Aturan Makan (Feeding Rules) IDAI',
      layout: 'one_column',
      content: {
        subtitle: 'Aturan disiplin meja makan yang direkomendasikan dokter anak.',
        points: [
          '• Jadwal Makan Teratur: Susun jadwal makan utama dan camilan yang konsisten setiap harinya.',
          '• Batasi Durasi: Durasi makan maksimal 30 menit. Apabila anak sudah tidak mau makan dalam waktu tersebut, bereskan piring.',
          '• Hapus Distraksi: Dilarang keras makan sambil bermain, menonton TV, menggunakan gadget, atau digendong keliling kompleks.',
          '• Responsive Feeding: Ajarkan anak mengenali rasa kenyang dan lapar mereka secara mandiri.'
        ]
      }
    },
    // Slide 20: Kesimpulan & Aksi Nyata
    {
      category: 'NUTRIMEDS PRESENTATION',
      title: 'Mari Bersama Wujudkan Generasi Bebas Stunting',
      layout: 'two_column',
      content: {
        leftTitle: '📝 Ringkasan Aksi Orang Tua',
        leftText: [
          '• 1. Timbang berat dan ukur tinggi anak secara rutin setiap bulan.',
          '• 2. Gunakan Kalkulator Gizi Nutrimeds untuk analisis antropometri cepat.',
          '• 3. Terapkan rekomendasi menu makan bergizi berbahan lokal.',
          '• 4. Konsultasikan ke fasilitas kesehatan jika pertumbuhan anak mendatar.'
        ],
        rightTitle: '🌐 Tentang Nutrimeds',
        rightText: [
          '• Website Medis Gratis dan Bebas Iklan.',
          '• Dikembangkan untuk pemerataan akses edukasi gizi di Indonesia.',
          '• Hubungi kami atau bagikan platform ini untuk membantu sesama orang tua.',
          '• Terima Kasih • Salam Sehat Nutrimeds!'
        ]
      }
    }
  ];

  // Helper function to draw common slide decorations
  function drawSlideTemplate(slide, categoryText, slideIndex) {
    // Background color
    slide.background = { fill: theme.bg };

    // Slide border or top line decoration
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.1,
      fill: { color: theme.primary }
    });

    // Top Category Tag
    slide.addText(categoryText.toUpperCase(), {
      x: 0.8,
      y: 0.25,
      w: 6,
      h: 0.3,
      fontSize: 10,
      bold: true,
      fontFace: 'Arial',
      color: theme.secondary,
      charSpacing: 1.5
    });

    // Bottom Footer
    slide.addText('Nutrimeds - Platform Gizi & Pencegahan Stunting Anak', {
      x: 0.8,
      y: 5.2,
      w: 6,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: theme.isDark ? '94A3B8' : '64748B'
    });

    // Slide Number Indicator
    slide.addText(`${slideIndex} / 20`, {
      x: 8.8,
      y: 5.2,
      w: 1,
      h: 0.3,
      fontSize: 9,
      align: 'right',
      fontFace: 'Arial',
      color: theme.secondary,
      bold: true
    });
  }

  // Iterate and build each slide
  slidesData.forEach((slideData, idx) => {
    const slide = pptx.addSlide();
    const slideNum = idx + 1;

    // Apply personalization to the title slide or content if childData is provided
    if (childData && slideNum === 1) {
      slideData.title = `Rekomendasi Gizi Khusus untuk: ${childData.name}`;
      slideData.content.subtitle = `Analisis Status Gizi & Rencana Menu Makan Personal • Status: ${childData.status || 'Normal'}`;
    }

    if (slideData.layout === 'title') {
      // ── TITLE LAYOUT ──
      slide.background = { fill: theme.bg };

      // Diagonal background decoration for non-cyber themes
      if (!theme.isDark) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: '35%',
          h: '100%',
          fill: { color: theme.accent }
        });
      } else {
        // Modern dark mode decoration
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: '100%',
          h: '100%',
          fill: { color: '0B0F19' }
        });
      }

      // Vertical accent bar
      slide.addShape(pptx.ShapeType.rect, {
        x: '35%',
        y: 0,
        w: 0.08,
        h: '100%',
        fill: { color: theme.primary }
      });

      // Category / Brand Text
      slide.addText(slideData.category, {
        x: 0.8,
        y: 1.0,
        w: 8.4,
        h: 0.4,
        fontSize: 12,
        bold: true,
        fontFace: 'Arial',
        color: theme.secondary,
        charSpacing: 2
      });

      // Main Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 1.5,
        w: 8.4,
        h: 1.8,
        fontSize: 34,
        bold: true,
        fontFace: 'Arial',
        color: theme.title,
        valign: 'middle'
      });

      // Subtitle
      slide.addText(slideData.content.subtitle, {
        x: 0.8,
        y: 3.5,
        w: 8.4,
        h: 0.6,
        fontSize: 16,
        fontFace: 'Arial',
        color: theme.text
      });

      // Tagline or Meta Info
      slide.addText(slideData.content.tagline, {
        x: 0.8,
        y: 4.2,
        w: 8.4,
        h: 0.4,
        fontSize: 11,
        italic: true,
        fontFace: 'Arial',
        color: theme.secondary
      });

      slide.addText(slideData.content.meta, {
        x: 0.8,
        y: 4.8,
        w: 8.4,
        h: 0.3,
        fontSize: 9,
        fontFace: 'Arial',
        color: theme.isDark ? '64748B' : '94A3B8'
      });

    } else if (slideData.layout === 'one_column') {
      // ── ONE COLUMN LAYOUT ──
      drawSlideTemplate(slide, slideData.category, slideNum);

      // Slide Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 0.6,
        w: 8.4,
        h: 0.6,
        fontSize: 24,
        bold: true,
        fontFace: 'Arial',
        color: theme.title
      });

      // Subtitle / Intro text
      slide.addText(slideData.content.subtitle, {
        x: 0.8,
        y: 1.25,
        w: 8.4,
        h: 0.4,
        fontSize: 13,
        italic: true,
        fontFace: 'Arial',
        color: theme.isDark ? '94A3B8' : '475569'
      });

      // Points Container Background Card
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 1.8,
        w: 8.4,
        h: 3.1,
        fill: { color: theme.white },
        line: { color: theme.isDark ? '334155' : 'E2E8F0', width: 1 },
        rectRadius: 0.1
      });

      // Slide Bullet Points
      const pointsText = slideData.content.points.join('\n\n');
      slide.addText(pointsText, {
        x: 1.1,
        y: 2.0,
        w: 7.8,
        h: 2.7,
        fontSize: 13,
        fontFace: 'Arial',
        color: theme.text,
        valign: 'middle'
      });

    } else if (slideData.layout === 'two_column') {
      // ── TWO COLUMN LAYOUT ──
      drawSlideTemplate(slide, slideData.category, slideNum);

      // Slide Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 0.6,
        w: 8.4,
        h: 0.6,
        fontSize: 24,
        bold: true,
        fontFace: 'Arial',
        color: theme.title
      });

      // Left Column Card
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 1.4,
        w: 4.0,
        h: 3.5,
        fill: { color: theme.white },
        line: { color: theme.isDark ? '334155' : 'E2E8F0', width: 1 },
        rectRadius: 0.1
      });

      // Left Column Header
      slide.addText(slideData.content.leftTitle, {
        x: 1.0,
        y: 1.6,
        w: 3.6,
        h: 0.4,
        fontSize: 15,
        bold: true,
        fontFace: 'Arial',
        color: theme.primary
      });

      // Left Column Text
      const leftTextCombined = slideData.content.leftText.join('\n\n');
      slide.addText(leftTextCombined, {
        x: 1.0,
        y: 2.1,
        w: 3.6,
        h: 2.6,
        fontSize: 11,
        fontFace: 'Arial',
        color: theme.text,
        valign: 'top'
      });

      // Right Column Card
      slide.addShape(pptx.ShapeType.rect, {
        x: 5.2,
        y: 1.4,
        w: 4.0,
        h: 3.5,
        fill: { color: theme.white },
        line: { color: theme.isDark ? '334155' : 'E2E8F0', width: 1 },
        rectRadius: 0.1
      });

      // Right Column Header
      slide.addText(slideData.content.rightTitle, {
        x: 5.4,
        y: 1.6,
        w: 3.6,
        h: 0.4,
        fontSize: 15,
        bold: true,
        fontFace: 'Arial',
        color: theme.secondary
      });

      // Right Column Text
      const rightTextCombined = slideData.content.rightText.join('\n\n');
      slide.addText(rightTextCombined, {
        x: 5.4,
        y: 2.1,
        w: 3.6,
        h: 2.6,
        fontSize: 11,
        fontFace: 'Arial',
        color: theme.text,
        valign: 'top'
      });
    }
  });

  return pptx;
}
