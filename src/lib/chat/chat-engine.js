/**
 * NutriBot — Rule-based chat engine for child nutrition consultation.
 * Uses keyword/intent matching + existing food database & nutrition calculator.
 * All responses in Bahasa Indonesia.
 */

import { FOOD_DATABASE } from '../nutrition/meal-generator.js';
import { calculateNutritionStatus, calculateAgeMonths, calculateDailyCalories } from '../nutrition/calculator.js';

// ═══════════════════════════════════════════════════════════════
// Intent Definitions
// ═══════════════════════════════════════════════════════════════

const INTENTS = [
  {
    name: 'greeting',
    keywords: ['halo', 'hai', 'hi', 'hello', 'hey', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'assalamualaikum', 'permisi'],
    priority: 1,
  },
  {
    name: 'goodbye',
    keywords: ['bye', 'dadah', 'sampai jumpa', 'terima kasih', 'makasih', 'terimakasih', 'thanks', 'selesai'],
    priority: 1,
  },
  {
    name: 'meal_recommendation',
    keywords: ['rekomendasi menu', 'menu makan', 'rekomendasi makanan', 'saran menu', 'saran makanan', 'ide makanan', 'ide menu', 'mau masak apa', 'masak apa', 'menu apa', 'makanan apa', 'menu untuk anak', 'makanan untuk anak', 'menu harian', 'jadwal makan', 'menu sarapan', 'menu makan siang', 'menu makan malam', 'menu camilan', 'sarapan apa', 'makan siang apa', 'makan malam apa', 'camilan apa', 'snack apa'],
    priority: 3,
  },
  {
    name: 'breakfast_recommendation',
    keywords: ['sarapan', 'breakfast', 'menu pagi'],
    priority: 4,
  },
  {
    name: 'lunch_recommendation',
    keywords: ['makan siang', 'lunch', 'menu siang'],
    priority: 4,
  },
  {
    name: 'dinner_recommendation',
    keywords: ['makan malam', 'dinner', 'menu malam'],
    priority: 4,
  },
  {
    name: 'snack_recommendation',
    keywords: ['camilan', 'snack', 'jajanan', 'cemilan', 'makanan ringan', 'kudapan'],
    priority: 4,
  },
  {
    name: 'calorie_calculation',
    keywords: ['kalori', 'kebutuhan kalori', 'berapa kalori', 'hitung kalori', 'kebutuhan energi', 'kkal', 'kalori harian', 'total kalori'],
    priority: 5,
  },
  {
    name: 'nutrition_check',
    keywords: ['status gizi', 'gizi anak', 'cek gizi', 'periksa gizi', 'kondisi gizi', 'z-score', 'zscore', 'antropometri'],
    priority: 5,
  },
  {
    name: 'stunting_info',
    keywords: ['stunting', 'pendek', 'tinggi badan rendah', 'anak pendek', 'risiko stunting', 'cegah stunting', 'pencegahan stunting', 'pertumbuhan terhambat'],
    priority: 6,
  },
  {
    name: 'obesity_info',
    keywords: ['obesitas', 'gemuk', 'kegemukan', 'berat badan lebih', 'overweight', 'anak gemuk', 'anak obesitas', 'terlalu berat', 'kelebihan berat'],
    priority: 6,
  },
  {
    name: 'undernutrition_info',
    keywords: ['kurang gizi', 'gizi buruk', 'kurus', 'anak kurus', 'berat badan kurang', 'underweight', 'malnutrisi', 'gizi kurang'],
    priority: 6,
  },
  {
    name: 'protein_info',
    keywords: ['protein', 'sumber protein', 'makanan protein', 'kebutuhan protein', 'protein anak'],
    priority: 5,
  },
  {
    name: 'vitamin_info',
    keywords: ['vitamin', 'mineral', 'zat besi', 'kalsium', 'zinc', 'seng', 'vitamin a', 'vitamin c', 'vitamin d', 'nutrisi mikro', 'mikronutrien'],
    priority: 5,
  },
  {
    name: 'feeding_guide_baby',
    keywords: ['mpasi', 'makanan bayi', 'bayi 6 bulan', 'bayi 7 bulan', 'bayi 8 bulan', 'bayi 9 bulan', 'bayi 10 bulan', 'bayi 11 bulan', 'makanan pendamping', 'mp-asi', 'pertama makan'],
    priority: 6,
  },
  {
    name: 'feeding_guide_toddler',
    keywords: ['balita', 'anak 1 tahun', 'anak 2 tahun', 'anak 3 tahun', 'anak 4 tahun', 'anak 5 tahun', 'batita', 'makanan balita', 'menu balita'],
    priority: 5,
  },
  {
    name: 'feeding_guide_school',
    keywords: ['anak sekolah', 'anak sd', 'anak 6 tahun', 'anak 7 tahun', 'anak 8 tahun', 'anak 9 tahun', 'anak 10 tahun', 'anak 11 tahun', 'anak 12 tahun', 'bekal sekolah'],
    priority: 5,
  },
  {
    name: 'picky_eater',
    keywords: ['susah makan', 'tidak mau makan', 'pilih-pilih makan', 'picky eater', 'gtm', 'gerakan tutup mulut', 'menolak makan', 'mogok makan', 'malas makan'],
    priority: 6,
  },
  {
    name: 'allergy_info',
    keywords: ['alergi', 'alergi makanan', 'intoleransi', 'sensitif makanan', 'pantangan', 'makanan penyebab alergi'],
    priority: 5,
  },
  {
    name: 'food_info',
    keywords: ['kandungan', 'nutrisi', 'manfaat', 'bahan', 'resep', 'cara masak', 'cara buat', 'komposisi'],
    priority: 3,
  },
  {
    name: 'about_bot',
    keywords: ['siapa kamu', 'kamu siapa', 'apa ini', 'nutribot', 'chatbot', 'bisa apa', 'fitur apa', 'bantuan'],
    priority: 2,
  },
  {
    name: 'forbidden_foods_under_2',
    keywords: [
      'tidak boleh dimakan', 'dilarang dimakan', 'tidak boleh diberikan', 'dilarang diberikan', 
      'dilarang untuk bayi', 'tidak boleh untuk bayi', 'makanan pantangan', 'makanan dilarang', 
      'makanan berbahaya', 'hindari makanan', 'di bawah 2 tahun', 'dibawah 2 tahun', 'makanan yang dihindari'
    ],
    priority: 8,
  },
  {
    name: 'undernutrition_complications',
    keywords: [
      'komplikasi', 'akibat gizi buruk', 'bahaya gizi buruk', 'dampak gizi buruk', 'efek gizi buruk', 
      'penyakit gizi buruk', 'dampak malnutrisi', 'bahaya malnutrisi', 'efek malnutrisi'
    ],
    priority: 8,
  },
  {
    name: 'exclusive_breastfeeding',
    keywords: [
      'asi eksklusif', 'asi ekslusif', 'breastfeeding', 'menyusui', 
      'asi saja', 'exclusive breastfeeding', 'manfaat asi', 'asi 2 tahun',
      'menyusui sampai 2 tahun', 'pemberian asi', 'asi hingga 2 tahun',
      'menyusui bayi', 'menyusui anak', 'menyusu', 'asi untuk bayi',
      'asi untuk anak'
    ],
    priority: 8,
  },
  {
    name: 'idai_anp',
    keywords: [
      'asuhan nutrisi pediatrik', 'anp idai', '5 langkah idai', 
      'pediatric nutrition care', 'asuhan nutrisi anak', 'rekomendasi idai nutrisi',
      'langkah nutrisi idai'
    ],
    priority: 8,
  },
  {
    name: 'idai_mpasi_rules',
    keywords: [
      'feeding rules idai', 'aturan makan idai', 'syarat mpasi idai', 
      'tanda bayi siap makan', 'kesiapan mpasi', 'responsive feeding idai',
      'jadwal makan idai', 'distraksi makan', 'durasi makan idai'
    ],
    priority: 8,
  },
];

// ═══════════════════════════════════════════════════════════════
// Knowledge Base — FAQ Responses
// ═══════════════════════════════════════════════════════════════

const KNOWLEDGE_BASE = {
  greeting: {
    responses: [
      'Halo! 👋 Saya **NutriBot**, asisten gizi anak Anda. Saya bisa membantu:\n\n🍽️ Rekomendasi menu makan harian\n📊 Informasi kebutuhan kalori anak\n📚 Konsultasi seputar gizi anak (stunting, obesitas, dll)\n🥦 Tips nutrisi dan pola makan sehat\n\nAda yang bisa saya bantu?',
      'Selamat datang di **NutriBot**! 🌟 Saya siap membantu Anda seputar nutrisi dan menu makan anak. Silakan tanyakan apa saja!',
      'Hai! 😊 Saya NutriBot, teman konsultasi gizi anak Anda. Mau tanya tentang menu makan, kalori, atau nutrisi anak? Silakan!',
    ],
    suggestions: ['Rekomendasi menu harian', 'Apa itu stunting?', 'Camilan sehat anak', 'Tips anak susah makan'],
  },

  goodbye: {
    responses: [
      'Terima kasih sudah bertanya! 😊 Semoga informasinya bermanfaat. Jangan ragu untuk bertanya lagi kapan saja. Sehat selalu untuk si kecil! 🌟',
      'Sama-sama! 💚 Semoga anak Anda tumbuh sehat dan ceria. Sampai jumpa lagi!',
    ],
    suggestions: ['Rekomendasi menu', 'Konsultasi gizi', 'Hitung kalori anak'],
  },

  about_bot: {
    responses: [
      'Saya **NutriBot** 🤖, asisten virtual yang terintegrasi dengan platform Nutrimeds. Berikut kemampuan saya:\n\n🍽️ **Menu Makan** — Rekomendasi sarapan, makan siang, malam, dan camilan dari bahan lokal Indonesia\n📊 **Kalori** — Hitung kebutuhan kalori harian anak\n📋 **Status Gizi** — Informasi tentang stunting, obesitas, dan gizi buruk\n🥛 **Nutrisi** — Tips protein, vitamin, mineral untuk anak\n👶 **Panduan Usia** — MPASI, balita, anak sekolah\n🍼 **GTM** — Tips anak susah makan\n\nCukup ketik pertanyaan Anda!',
    ],
    suggestions: ['Menu untuk balita', 'Kebutuhan kalori anak', 'Apa itu stunting?', 'Tips anak susah makan'],
  },

  stunting_info: {
    responses: [
      '📏 **Apa itu Stunting?**\n\nStunting adalah kondisi **gagal tumbuh** pada anak akibat kekurangan gizi kronis, terutama pada 1.000 hari pertama kehidupan (sejak dalam kandungan hingga usia 2 tahun).\n\n**Tanda-tanda:**\n• Tinggi badan di bawah standar WHO (Z-score < -2)\n• Pertumbuhan yang lebih lambat dibanding anak seusianya\n• Mudah sakit dan lemas\n\n**Pencegahan:**\n• Penuhi kebutuhan gizi sejak kehamilan\n• ASI eksklusif 6 bulan pertama\n• MPASI bergizi mulai usia 6 bulan\n• Pastikan asupan **protein hewani** (telur, ikan, ayam, daging) setiap hari\n• Pantau pertumbuhan rutin di posyandu\n\n**Nutrisi Kunci Anti-Stunting:**\n🥚 Protein hewani (telur, ikan, ayam)\n🥛 Kalsium (susu, ikan teri)\n🥩 Zat Besi (daging merah, hati ayam)\n🦐 Zinc/Seng (seafood, kacang-kacangan)',
    ],
    suggestions: ['ASI Eksklusif', 'Menu anti-stunting', 'Sumber protein anak', 'Rekomendasi menu harian'],
  },

  obesity_info: {
    responses: [
      '⚖️ **Obesitas pada Anak**\n\nObesitas anak terjadi ketika berat badan jauh melebihi standar untuk usia dan tinggi badan (Z-score BMI > +3).\n\n**Penyebab Umum:**\n• Konsumsi makanan tinggi gula dan lemak berlebih\n• Kurang aktivitas fisik\n• Kebiasaan makan porsi besar\n• Terlalu banyak makanan olahan/junk food\n\n**Dampak Jangka Panjang:**\n• Risiko diabetes tipe 2\n• Gangguan jantung\n• Masalah tulang dan sendi\n• Gangguan percaya diri\n\n**Tips Mengatasi:**\n1. 🥗 Perbanyak sayur dan buah dalam setiap menu\n2. 🚫 Batasi minuman manis dan makanan olahan\n3. 🏃 Ajak anak aktif bergerak minimal 60 menit/hari\n4. 🍽️ Porsi makan sesuai kebutuhan (jangan berlebihan)\n5. ⏰ Atur jadwal makan teratur (3 kali makan + 2 camilan)\n6. 🚰 Perbanyak minum air putih',
    ],
    suggestions: ['Menu rendah kalori', 'Camilan sehat', 'Kebutuhan kalori anak', 'Rekomendasi menu'],
  },

  undernutrition_info: {
    responses: [
      '⚠️ **Kurang Gizi / Gizi Buruk pada Anak**\n\nKurang gizi terjadi saat anak tidak mendapat cukup nutrisi untuk pertumbuhan optimal.\n\n**Tanda-tanda:**\n• Berat badan di bawah standar usia (Z-score < -2)\n• Mudah lelah dan lesu\n• Sering sakit\n• Pertumbuhan lambat\n• Rambut tipis dan kulit kering\n\n**Penyebab:**\n• Asupan makanan tidak cukup (kualitas & kuantitas)\n• Infeksi berulang\n• Pola makan tidak seimbang\n\n**Langkah Penanganan:**\n1. 🥚 Tingkatkan asupan protein hewani (telur, ikan, ayam)\n2. 🍚 Berikan makanan padat energi (tambah minyak/santan)\n3. 🥛 Berikan susu atau produk olahan susu\n4. 🍌 Camilan tinggi kalori (pisang, alpukat, kacang)\n5. 👨‍⚕️ Konsultasikan ke dokter/ahli gizi untuk penanganan lebih lanjut\n\n> ⚡ **Penting:** Jika anak menunjukkan tanda gizi buruk berat, segera bawa ke fasilitas kesehatan terdekat.',
    ],
    suggestions: ['Menu tinggi kalori', 'Sumber protein anak', 'Hitung kebutuhan kalori', 'Menu untuk anak kurus'],
  },

  protein_info: {
    responses: [
      '🥩 **Protein untuk Tumbuh Kembang Anak**\n\nProtein adalah "bahan bangunan" tubuh yang sangat penting untuk pertumbuhan anak.\n\n**Kebutuhan Protein Harian:**\n• Bayi 6-11 bulan: ~11g/hari\n• Anak 1-3 tahun: ~13g/hari\n• Anak 4-6 tahun: ~19g/hari\n• Anak 7-9 tahun: ~25g/hari\n• Anak 10-12 tahun: ~35-40g/hari\n\n**Sumber Protein Terbaik (Lokal & Murah):**\n🥚 Telur ayam (1 butir = 7g protein)\n🐔 Dada ayam (100g = 31g protein)\n🐟 Ikan (100g = 20-25g protein)\n🫘 Tempe (100g = 19g protein)\n🧊 Tahu (100g = 8g protein)\n🥛 Susu (200ml = 7g protein)\n🦐 Udang (100g = 24g protein)\n🥜 Kacang tanah (100g = 26g protein)\n\n> 💡 **Tips:** Kombinasikan protein hewani dan nabati di setiap waktu makan untuk hasil terbaik!',
    ],
    suggestions: ['Menu tinggi protein', 'Rekomendasi sarapan', 'Apa itu stunting?', 'Camilan protein tinggi'],
  },

  vitamin_info: {
    responses: [
      '💊 **Vitamin & Mineral Penting untuk Anak**\n\n**Zat Besi 🩸**\nFungsi: Mencegah anemia, mendukung otak\nSumber: Hati ayam, daging merah, bayam, kacang-kacangan\n\n**Kalsium 🦴**\nFungsi: Tulang & gigi kuat\nSumber: Susu, keju, ikan teri, brokoli, tahu\n\n**Zinc/Seng 🛡️**\nFungsi: Imunitas & pertumbuhan\nSumber: Daging, seafood, biji labu, kacang mete\n\n**Vitamin A 👁️**\nFungsi: Mata sehat, kekebalan tubuh\nSumber: Wortel, ubi jalar, bayam, hati ayam\n\n**Vitamin C 🍊**\nFungsi: Daya tahan tubuh, serap zat besi\nSumber: Jeruk, jambu biji, pepaya, tomat\n\n**Vitamin D ☀️**\nFungsi: Penyerapan kalsium, tulang\nSumber: Sinar matahari pagi, ikan salmon, telur\n\n> 🌟 Pastikan anak mendapat nutrisi beragam dari berbagai jenis makanan setiap hari!',
    ],
    suggestions: ['Menu kaya zat besi', 'Sumber kalsium anak', 'Rekomendasi menu harian', 'Tips makan sehat'],
  },

  feeding_guide_baby: {
    responses: [
      '👶 **Panduan MPASI (Makanan Pendamping ASI)**\n\n**Usia 6 Bulan — Tahap Perkenalan**\n• Tekstur: Bubur halus/puree\n• Frekuensi: 2-3x sehari\n• Porsi: 2-3 sendok makan per sesi\n• Contoh: Puree pisang, bubur beras + ASI, puree labu kuning\n\n**Usia 7-8 Bulan — Tekstur Naik**\n• Tekstur: Bubur kasar/mashed\n• Frekuensi: 2-3x makan + 1-2x camilan\n• Porsi: ½ mangkuk (125ml)\n• Contoh: Nasi tim ayam wortel, bubur ikan sayur\n\n**Usia 9-11 Bulan — Finger Food**\n• Tekstur: Dicincang halus, finger food\n• Frekuensi: 3x makan + 2x camilan\n• Porsi: ½ mangkuk\n• Contoh: Nasi lembek + telur orak-arik, pisang potong\n\n**Prinsip MPASI:**\n✅ Karbohidrat + Protein Hewani + Sayur + Lemak\n✅ Tambahkan minyak/mentega untuk kalori ekstra\n✅ Variasikan bahan makanan setiap hari\n❌ Hindari garam & gula tambahan sebelum 1 tahun\n❌ Jangan berikan madu sebelum 1 tahun',
    ],
    suggestions: ['Aturan makan IDAI', 'ASI Eksklusif', 'Resep MPASI sederhana', 'Protein untuk bayi'],
  },

  feeding_guide_toddler: {
    responses: [
      '🧒 **Panduan Makan Anak Balita (1-5 Tahun)**\n\n**Pola Makan Ideal:**\n• 3x makan utama + 2x camilan sehat\n• Porsi lebih kecil tapi sering\n• Variasi warna makanan di piring\n\n**Kebutuhan Kalori:**\n• 1-2 tahun: ~1.000-1.100 Kkal/hari\n• 2-3 tahun: ~1.100-1.200 Kkal/hari\n• 4-5 tahun: ~1.200-1.400 Kkal/hari\n\n**Distribusi Makan:**\n🌅 Sarapan: 25% kalori harian\n☀️ Makan siang: 30% kalori harian\n🍎 Camilan: 15-20% kalori harian\n🌙 Makan malam: 25% kalori harian\n\n**Tips:**\n✅ Sajikan dalam porsi kecil, tambahkan jika masih lapar\n✅ Biarkan anak makan sendiri (latih motorik halus)\n✅ Jangan paksa makan saat anak sudah kenyang\n✅ Jadikan makan sebagai pengalaman menyenangkan\n✅ Batasi jus buah, perbanyak air putih',
    ],
    suggestions: ['Menu untuk balita', 'Camilan sehat balita', 'Anak susah makan', 'Rekomendasi sarapan'],
  },

  feeding_guide_school: {
    responses: [
      '🎒 **Panduan Makan Anak Usia Sekolah (6-12 Tahun)**\n\n**Kebutuhan Kalori:**\n• 6-8 tahun: ~1.400-1.600 Kkal/hari\n• 9-10 tahun: ~1.600-1.800 Kkal/hari\n• 11-12 tahun: ~1.800-2.100 Kkal/hari\n\n**Menu Ideal per Hari:**\n🌅 **Sarapan** (WAJIB!): Nasi/roti + protein + sayur/buah\n🍱 **Bekal Sekolah**: Sandwich/nasi bento + buah + air putih\n☀️ **Makan Siang**: Nasi + lauk protein + sayur\n🍎 **Camilan Sore**: Buah, susu, kacang\n🌙 **Makan Malam**: Porsi lebih ringan dari siang\n\n**Tips Penting:**\n✅ Sarapan meningkatkan konsentrasi di sekolah!\n✅ Bawakan bekal dari rumah (lebih sehat & hemat)\n✅ Batasi uang jajan untuk junk food\n✅ Ajak anak pilih dan menyiapkan makanan\n✅ Minimal 2 porsi buah + 3 porsi sayur per hari\n✅ Susu/produk susu 2-3 gelas per hari untuk kalsium',
    ],
    suggestions: ['Ide bekal sekolah', 'Menu sarapan cepat', 'Camilan sehat sekolah', 'Kebutuhan kalori anak SD'],
  },

  picky_eater: {
    responses: [
      '😤 **Tips Mengatasi Anak Susah Makan (GTM)**\n\nAnda tidak sendirian! Hampir semua orang tua pernah mengalami fase ini.\n\n**Strategi Efektif:**\n\n1. 🎨 **Sajikan Menarik**\nBentuk makanan jadi lucu (wajah, hewan, bunga)\n\n2. 👨‍🍳 **Libatkan Anak**\nAjak anak memilih menu dan membantu masak\n\n3. 📏 **Porsi Kecil Dulu**\nJangan intimidasi dengan porsi besar\n\n4. 🔄 **Perkenalkan Berulang**\nAnak perlu 10-15x exposure sebelum menerima makanan baru\n\n5. ⏰ **Jadwal Konsisten**\nMakan di jam yang sama setiap hari\n\n6. 📵 **Tanpa Gadget**\nFokus pada makanan saat makan\n\n7. 🚫 **Jangan Paksa**\nMemaksa justru membuat anak trauma dengan makanan\n\n8. 🥤 **Batasi Susu Berlebihan**\nSusu berlebihan membuat anak kenyang sebelum makan\n\n9. 🏃 **Ajak Aktif Bergerak**\nAktivitas fisik meningkatkan nafsu makan\n\n10. 👪 **Makan Bersama**\nAnak meniru kebiasaan makan orang tua\n\n> 💡 Jika GTM berlangsung > 2 minggu dan BB turun, konsultasi ke dokter anak.',
    ],
    suggestions: ['Aturan makan IDAI', 'Menu menarik untuk anak', 'Rekomendasi camilan', 'Kebutuhan kalori anak'],
  },

  allergy_info: {
    responses: [
      '⚠️ **Alergi Makanan pada Anak**\n\n**8 Alergen Utama:**\n🥛 Susu sapi\n🥚 Telur\n🥜 Kacang tanah\n🌰 Kacang pohon (almond, mete)\n🐟 Ikan\n🦐 Udang/kerang\n🌾 Gandum/gluten\n🫘 Kedelai\n\n**Tanda Alergi Makanan:**\n• Ruam/gatal di kulit\n• Bengkak di bibir, wajah, atau lidah\n• Muntah atau diare setelah makan\n• Bersin dan pilek\n• Sesak napas (segera ke IGD!)\n\n**Tips Pengelolaan:**\n1. ✍️ Catat makanan yang memicu reaksi\n2. 🔍 Baca label makanan dengan teliti\n3. 👨‍⚕️ Tes alergi di dokter anak\n4. 🔄 Ganti dengan bahan alternatif\n5. ⏰ Perkenalkan alergen baru satu per satu\n\n**Alternatif Pengganti:**\n• Alergi susu → susu kedelai/almond\n• Alergi telur → tahu/tempe\n• Alergi gandum → beras/ubi\n\n> 🚨 Jika anak mengalami reaksi alergi berat (anafilaksis), segera bawa ke UGD!',
    ],
    suggestions: ['Menu tanpa telur', 'Sumber protein alternatif', 'Rekomendasi menu harian', 'Konsultasi gizi'],
  },
  forbidden_foods_under_2: {
    responses: [
      '🚫 **Makanan yang Tidak Boleh Diberikan pada Anak di Bawah 2 Tahun**\n\nUntuk kesehatan dan keamanan si kecil, hindari makanan berikut sebelum usianya mencapai 2 tahun:\n\n1. 🍯 **Madu Mentah** (Terutama Usia < 1 Tahun)\n   • *Bahaya:* Botulisme bayi (infeksi bakteri serius yang memproduksi racun di usus bayi).\n\n2. 🥛 **Susu Sapi Cair/UHT** sebagai Minuman Utama (Usia < 1 Tahun)\n   • *Bahaya:* Sulit dicerna ginjal dan pencernaan bayi yang belum matang; dapat memicu anemia defisiensi zat besi. Hanya boleh digunakan sebagai campuran MPASI, bukan minuman utama.\n\n3. 🧂 **Garam & Gula Berlebih**\n   • *Bahaya:* Memperberat kerja ginjal (garam) dan merusak gigi serta memicu obesitas dini (gula). Batasi seminimal mungkin.\n\n4. 🥜 **Makanan Keras/Bulat (Risiko Tersedak)**\n   • Contoh: Kacang utuh, anggur utuh, permen keras, popcorn, potongan wortel mentah yang besar.\n   • *Solusi:* Potong kecil-kecil memanjang (seukuran jari) atau lumatkan.\n\n5. 🍣 **Makanan Mentah / Setengah Matang**\n   • Contoh: Telur setengah matang, sushi mentah, daging/steik setengah matang.\n   • *Bahaya:* Keracunan bakteri *Salmonella* atau *E. coli* karena imun anak belum kuat.\n\n6. 🥤 **Jus Buah Berlebih & Kafein/Teh**\n   • *Bahaya:* Jus buah mengurangi nafsu makan makanan padat dan tinggi gula. Teh menghambat penyerapan zat besi penting.',
    ],
    suggestions: ['ASI Eksklusif', 'Panduan MPASI', 'Camilan sehat anak', 'Rekomendasi menu harian'],
  },
  undernutrition_complications: {
    responses: [
      '⚠️ **Komplikasi Akibat Gizi Buruk (Malnutrisi) pada Anak**\n\nGizi buruk bukan sekadar masalah tubuh kurus, melainkan kondisi darurat medis yang dapat merusak berbagai organ tubuh dan memicu berbagai komplikasi serius:\n\n1. 🧠 **Keterlambatan Perkembangan Otak & Kognitif**\n   • Kurangnya nutrisi menghambat pembentukan sinapsis otak, menyebabkan penurunan IQ, daya ingat lemah, dan kesulitan belajar di kemudian hari.\n\n2. 🛡️ **Penurunan Sistem Imun (Rentan Infeksi)**\n   • Tubuh tidak mampu memproduksi sel darah putih yang cukup, sehingga anak sangat rentan terhadap penyakit mematikan seperti **Pneumonia (infeksi paru)**, **TBC**, dan **Diare akut**.\n\n3. 🫀 **Gangguan Fungsi Jantung & Sirkulasi**\n   • Otot jantung melemah (atrofi), detak jantung melambat (bradikardia), dan tekanan darah menurun drastis, meningkatkan risiko gagal jantung.\n\n4. ⚖️ **Atrofi Otot & Gangguan Tulang**\n   • Tubuh memecah ototnya sendiri untuk energi (menyebabkan tampilan kulit membungkus tulang/marasmus) dan menghambat pertumbuhan tulang.\n\n5. 🩸 **Anemia Defisiensi Berat**\n   • Kekurangan zat besi, folat, dan vitamin B12 menyebabkan sel darah merah sangat rendah, mengganggu pengiriman oksigen ke seluruh organ vital.\n\n6. ☠️ **Hipotermia & Hipoglikemia**\n   • Anak kehilangan lapisan lemak bawah kulit, sehingga suhunya mudah turun (kedinginan) dan kadar gula darah drop secara ekstrem, yang dapat mengancam jiwa.\n\n> 👨‍⚕️ **Penanganan Cepat:** Gizi buruk (terutama tipe Marasmus atau Kwashiorkor) membutuhkan penanganan medis terstruktur (seperti pemberian formula F-75/F-100 atau RUTF) di Puskesmas/Rumah Sakit.',
    ],
    suggestions: ['Apa itu stunting?', 'Cek status gizi', 'Menu tinggi kalori', 'Tips anak susah makan'],
  },
  exclusive_breastfeeding: {
    responses: [
      '🍼 **Panduan ASI Eksklusif & Menyusui hingga 2 Tahun**\n\nMenyusui adalah salah satu fondasi terbaik untuk tumbuh kembang optimal si kecil. Berikut adalah panduan pemberian ASI berdasarkan rekomendasi WHO dan Kementerian Kesehatan RI:\n\n1. 👶 **ASI Eksklusif (Usia 0–6 Bulan)**\n   • Bayi **hanya** diberikan ASI saja tanpa tambahan makanan atau minuman lain (termasuk air putih, madu, atau susu formula), kecuali obat/vitamin atas petunjuk medis.\n   • *Manfaat:* Memenuhi 100% kebutuhan nutrisi bayi, memperkuat daya tahan tubuh alami (imunoglobin), dan melindungi dari infeksi pencernaan & pernapasan.\n\n2. 🥣 **ASI + MPASI (Usia 6–24 Bulan / 2 Tahun)**\n   • Setelah usia 6 bulan, kebutuhan nutrisi anak semakin meningkat dan tidak lagi bisa tercukupi hanya dari ASI saja.\n   • Berikan Makanan Pendamping ASI (MPASI) yang bergizi seimbang (mengandung zat gizi makro dan mikro, terutama protein hewani) sambil tetap melanjutkan pemberian ASI.\n\n3. ⏳ **Mengapa Dianjurkan Menyusui hingga 2 Tahun?**\n   • *Nutrisi Berkualitas:* Pada tahun kedua (12-24 bulan), ASI masih menyumbang sekitar 35-40% kebutuhan energi harian anak.\n   • *Kekebalan Tubuh:* ASI terus mengalirkan antibodi konsentrat tinggi yang melindungi balita ketika mereka mulai aktif mengeksplorasi lingkungan luar.\n   • *Perkembangan Kognitif:* Kandungan asam lemak esensial (seperti DHA & ARA) dalam ASI membantu perkembangan jaringan otak anak secara maksimal.\n   • *Ikatan Batin (Bonding):* Proses menyusui mempererat hubungan emosional antara ibu dan anak, memberikan rasa aman dan tenang.\n\n**💡 Tips Sukses Menyusui:**\n• Berikan ASI sesering mungkin sesuai keinginan bayi (*on demand*). Semakin sering disusui/dipompa, produksi ASI akan semakin melimpah.\n• Ibu menyusui disarankan mengonsumsi tambahan energi sekitar 500 Kkal/hari, minum air yang cukup, dan menjaga pola makan bergizi seimbang.\n• Hindari memberikan dot atau empeng terlalu dini agar bayi tidak mengalami bingung puting.',
    ],
    suggestions: ['Aturan makan IDAI', 'Panduan MPASI', 'Cegah stunting', 'Makanan dilarang di bawah 2 tahun'],
  },
  idai_anp: {
    responses: [
      '🩺 **5 Langkah Asuhan Nutrisi Pediatrik (ANP) menurut IDAI**\n\nAsuhan Nutrisi Pediatrik (ANP) adalah panduan terstruktur dari Ikatan Dokter Anak Indonesia untuk mencegah malnutrisi dan mengoptimalkan tumbuh kembang anak:\n\n1. 📊 **Penilaian Status Gizi (Assessment)**\n   • Menentukan status gizi anak dengan mengukur antropometri (berat badan, tinggi badan, lingkar kepala) dan memplotnya pada Kurva Pertumbuhan WHO/CDC untuk mengetahui apakah gizi anak normal, kurang, buruk, stunting, atau obesitas.\n\n2. 🔢 **Penentuan Kebutuhan Nutrisi (Determine Requirement)**\n   • Menghitung kebutuhan kalori harian dan makronutrisi (protein, lemak, karbohidrat) serta mikronutrien sesuai usia, jenis kelamin, aktivitas fisik, dan kondisi medis spesifik anak.\n\n3. 👄 **Penentuan Rute Pemberian Makanan (Route)**\n   • Memilih jalur asupan makanan terbaik. Jalur **oral** (mulut) adalah prioritas utama jika fungsi menelan normal. Jalur **enteral** (selang NGT) digunakan jika ada masalah menelan, dan jalur **parenteral** (infus intravena) jika saluran pencernaan tidak dapat berfungsi.\n\n4. 🥘 **Penentuan Jenis Makanan (Formulation)**\n   • Memilih formula atau makanan padat yang tepat berdasarkan usia dan kondisi anak (misalnya: ASI, MPASI bubur saring, makanan keluarga, atau susu formula khusus/Pangan Olahan untuk Kondisi Medis Khusus jika ada indikasi klinis).\n\n5. 📝 **Pemantauan & Evaluasi (Monitoring & Evaluation)**\n   • Memantau secara ketat toleransi anak terhadap makanan (adanya muntah, diare, alergi) dan memantau pertumbuhan berkala (weight gain/growth chart). Rencana nutrisi disesuaikan ulang jika target kenaikan berat badan tidak tercapai.\n\n> 💡 *Konsultasikan dengan dokter anak Anda jika si kecil mengalami perlambatan pertumbuhan (faltering growth) untuk penanganan ANP yang tepat.*',
    ],
    suggestions: ['Aturan makan IDAI', 'Cek status gizi', 'Kebutuhan kalori bayi', 'Rekomendasi menu harian'],
  },
  idai_mpasi_rules: {
    responses: [
      '🥣 **Panduan MPASI & Aturan Makan (Feeding Rules) menurut IDAI**\n\nIkatan Dokter Anak Indonesia (IDAI) menyarankan MPASI dimulai tepat pada usia 6 bulan. Berikut adalah syarat kesiapan, prinsip MPASI, dan aturan makan (*feeding rules*) untuk mencegah masalah makan:\n\n### 1. Tanda Bayi Siap MPASI 👶\n• Kepala dan leher tegak, bayi dapat duduk dengan bantuan minimal.\n• Tertarik melihat makanan dan mencoba meraihnya.\n• Refleks menjulurkan lidah (*extrusion reflex* / melepeh) berkurang.\n\n### 2. Syarat MPASI yang Benar 4️⃣\n• **Tepat Waktu:** Diberikan mulai usia 6 bulan saat ASI saja tidak mencukupi kebutuhan energi & zat besi.\n• **Adekuat:** Mengandung zat gizi mikro (terutama Zat Besi, Seng) dan makro (Protein Hewani, Lemak, Karbohidrat) yang seimbang.\n• **Aman & Higienis:** Proses persiapan, penyimpanan, dan penyajian bersih.\n• **Diberikan dengan Cara yang Benar:** Mengikuti sinyal lapar/kenyang anak (*responsive feeding*).\n\n### 3. *Feeding Rules* (Aturan Makan) IDAI ⏱️\n**A. Jadwal Teratur:**\n• Buat jadwal makan utama (3x) dan camilan (1-2x) yang konsisten.\n• Batasi durasi makan **maksimal 30 menit**. Jika lewat 30 menit, hentikan makan.\n• Di luar jam makan/camilan, hanya berikan air putih (hindari ngemil susu/jus terus-menerus agar anak merasakan lapar saat jam makan).\n\n**B. Lingkungan Menyenangkan:**\n• Ciptakan suasana makan yang menyenangkan tanpa tekanan atau paksaan.\n• **Bebas Distraksi:** Matikan TV, singkirkan gadget, mainan, atau membawa anak jalan-jalan saat makan.\n• Jangan jadikan makanan sebagai hadiah (*reward*).\n\n**C. Prosedur Pemberian:**\n• Tawarkan makanan porsi kecil terlebih dahulu. Jika habis, tambahkan.\n• Dorong anak untuk makan sendiri agar melatih motorik kasar dan halus.\n• Jika anak menolak makan (GTM/Gerakan Tutup Mulut), tawarkan kembali tanpa memaksa. Jika tetap menolak setelah 10-15 menit, akhiri sesi makan.',
    ],
    suggestions: ['Panduan MPASI', 'Aturan asuhan nutrisi IDAI', 'ASI Eksklusif', 'Tips anak susah makan'],
  },
};

// ═══════════════════════════════════════════════════════════════
// Meal Type Mappings
// ═══════════════════════════════════════════════════════════════

const MEAL_TYPE_MAP = {
  breakfast_recommendation: 'sarapan',
  lunch_recommendation: 'makan_siang',
  dinner_recommendation: 'makan_malam',
  snack_recommendation: 'camilan',
};

const MEAL_TYPE_LABELS = {
  sarapan: 'Sarapan',
  makan_siang: 'Makan Siang',
  makan_malam: 'Makan Malam',
  camilan: 'Camilan',
};

// ═══════════════════════════════════════════════════════════════
// Core Engine Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Detect intent from user message.
 */
function detectIntent(message) {
  const normalized = message.toLowerCase().trim();

  // ── Priority override: calorie calculation when message contains calorie keywords + numeric data ──
  const hasCalorieKeyword = ['kalori', 'kebutuhan kalori', 'berapa kalori', 'hitung kalori', 'kebutuhan energi', 'kkal'].some(k => normalized.includes(k));
  const hasNumericData = /\d+\s*(kg|tahun|bulan|cm)/.test(normalized);
  if (hasCalorieKeyword && hasNumericData) {
    return 'calorie_calculation';
  }

  let bestMatch = null;
  let bestScore = -1;

  for (const intent of INTENTS) {
    for (const keyword of intent.keywords) {
      if (normalized.includes(keyword)) {
        // Prefer longer keyword matches and higher priority
        const matchScore = keyword.length * 10 + intent.priority;
        if (matchScore > bestScore) {
          bestMatch = intent;
          bestScore = matchScore;
        }
      }
    }
  }

  return bestMatch?.name || 'unknown';
}

/**
 * Extract numeric values from a message (for calorie calculation).
 * Attempts to find age, weight, and height.
 */
function extractNumbers(message) {
  const normalized = message.toLowerCase();
  const result = { ageMonths: null, weight: null, height: null };

  // Extract age in years: "3 tahun", "usia 5 tahun"
  const ageYearMatch = normalized.match(/(\d+)\s*tahun/);
  if (ageYearMatch) {
    result.ageMonths = parseInt(ageYearMatch[1]) * 12;
  }

  // Extract age in months: "8 bulan", "usia 10 bulan"
  const ageMonthMatch = normalized.match(/(\d+)\s*bulan/);
  if (ageMonthMatch) {
    const months = parseInt(ageMonthMatch[1]);
    if (result.ageMonths) {
      result.ageMonths += months; // Add to years if both specified
    } else {
      result.ageMonths = months;
    }
  }

  // Extract weight: "10 kg", "berat 15kg", "bb 12"
  const weightMatch = normalized.match(/(?:berat|bb|berat badan)?\s*(\d+(?:\.\d+)?)\s*kg/);
  if (weightMatch) {
    result.weight = parseFloat(weightMatch[1]);
  }

  // Extract height: "100 cm", "tinggi 90cm", "tb 85"
  const heightMatch = normalized.match(/(?:tinggi|tb|tinggi badan)?\s*(\d+(?:\.\d+)?)\s*cm/);
  if (heightMatch) {
    result.height = parseFloat(heightMatch[1]);
  }

  return result;
}

/**
 * Extract age group from message for meal recommendations.
 */
function extractAgeGroup(message) {
  const normalized = message.toLowerCase();

  // Check for baby references
  if (/bayi|mpasi|6\s*bulan|7\s*bulan|8\s*bulan|9\s*bulan|10\s*bulan|11\s*bulan/.test(normalized)) {
    return 'baby';
  }

  // Check for specific ages
  const ageMatch = normalized.match(/(\d+)\s*tahun/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age <= 2) return 'toddler';
    if (age <= 5) return 'preschool';
    return 'school';
  }

  // Check for group keywords
  if (/balita|batita/.test(normalized)) return 'toddler';
  if (/sekolah|sd/.test(normalized)) return 'school';

  return null;
}

/**
 * Get random food recommendations by meal type.
 */
function getRandomMeals(mealType, count = 2) {
  const options = FOOD_DATABASE.filter(f => f.mealType === mealType);
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get random food recommendations across all meal types.
 */
function getRandomDailyMenu() {
  const types = ['sarapan', 'makan_siang', 'makan_malam', 'camilan'];
  const plan = [];
  for (const type of types) {
    const options = FOOD_DATABASE.filter(f => f.mealType === type);
    const randomIndex = Math.floor(Math.random() * options.length);
    plan.push({ ...options[randomIndex], mealTypeLabel: MEAL_TYPE_LABELS[type] });
  }
  return plan;
}

/**
 * Search food by name/ingredient keyword.
 */
function searchFood(query) {
  const normalized = query.toLowerCase();
  return FOOD_DATABASE.filter(food => {
    const nameMatch = food.foodName.toLowerCase().includes(normalized);
    const ingredientMatch = food.ingredients.some(ing =>
      ing.toLowerCase().includes(normalized)
    );
    return nameMatch || ingredientMatch;
  });
}

// ═══════════════════════════════════════════════════════════════
// Main Chat Engine
// ═══════════════════════════════════════════════════════════════

/**
 * Process a user message and return a structured response.
 *
 * @param {string} message - User's chat message
 * @param {object} context - Optional context (childAge, childWeight, etc.)
 * @returns {{ text: string, suggestions: string[], mealCards: Array|null }}
 */
export function processMessage(message, context = {}) {
  const intent = detectIntent(message);

  // ── Knowledge base lookups ──
  if (KNOWLEDGE_BASE[intent]) {
    const kb = KNOWLEDGE_BASE[intent];
    const text = kb.responses[Math.floor(Math.random() * kb.responses.length)];
    return {
      text,
      suggestions: kb.suggestions || [],
      mealCards: null,
    };
  }

  // ── Meal-type specific recommendations ──
  if (MEAL_TYPE_MAP[intent]) {
    const mealType = MEAL_TYPE_MAP[intent];
    const label = MEAL_TYPE_LABELS[mealType];
    const meals = getRandomMeals(mealType, 2);
    const ageGroup = extractAgeGroup(message);

    let intro = `🍽️ Berikut rekomendasi **${label}** untuk anak:\n\n`;

    if (ageGroup === 'baby') {
      intro = `🍼 Untuk bayi, sebaiknya makanan bertekstur lembut. Berikut inspirasi **${label}** yang bisa disesuaikan:\n\n`;
    }

    const mealTexts = meals.map((m, i) =>
      `**${i + 1}. ${m.foodName}** (${m.calories} Kkal)\n` +
      `📝 Bahan: ${m.ingredients.join(', ')}\n` +
      `👨‍🍳 ${m.instructions}`
    ).join('\n\n');

    return {
      text: intro + mealTexts + '\n\n> 💡 Ketik "ganti menu" jika ingin rekomendasi lain!',
      suggestions: ['Ganti menu', 'Menu lainnya', 'Hitung kalori anak', 'Camilan sehat'],
      mealCards: meals.map(m => ({
        foodName: m.foodName,
        mealType: m.mealType,
        mealTypeLabel: MEAL_TYPE_LABELS[m.mealType],
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        ingredients: m.ingredients,
        instructions: m.instructions,
      })),
    };
  }

  // ── General meal recommendation ──
  if (intent === 'meal_recommendation') {
    const dailyMenu = getRandomDailyMenu();
    const ageGroup = extractAgeGroup(message);

    let intro = '🍽️ **Rekomendasi Menu Harian Anak:**\n\n';
    if (ageGroup) {
      const labels = { baby: 'bayi', toddler: 'balita', preschool: 'anak usia pra-sekolah', school: 'anak usia sekolah' };
      intro = `🍽️ **Rekomendasi Menu Harian untuk ${labels[ageGroup]}:**\n\n`;
    }

    const menuText = dailyMenu.map((m, i) => {
      const icon = m.mealType === 'sarapan' ? '🌅' : m.mealType === 'makan_siang' ? '☀️' : m.mealType === 'makan_malam' ? '🌙' : '🍎';
      return `${icon} **${m.mealTypeLabel}: ${m.foodName}** (${m.calories} Kkal)\n📝 ${m.ingredients.join(', ')}`;
    }).join('\n\n');

    const totalCalories = dailyMenu.reduce((sum, m) => sum + m.calories, 0);

    return {
      text: intro + menuText + `\n\n📊 **Total estimasi: ~${totalCalories} Kkal/hari**\n\n> Porsi dapat disesuaikan dengan kebutuhan kalori anak. Gunakan Kalkulator Gizi untuk hitung kebutuhan spesifik!`,
      suggestions: ['Ganti menu', 'Hitung kalori anak', 'Rekomendasi camilan', 'Tips makan sehat'],
      mealCards: dailyMenu.map(m => ({
        foodName: m.foodName,
        mealType: m.mealType,
        mealTypeLabel: m.mealTypeLabel,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        ingredients: m.ingredients,
        instructions: m.instructions,
      })),
    };
  }

  // ── Calorie calculation ──
  if (intent === 'calorie_calculation') {
    const nums = extractNumbers(message);

    if (nums.weight && nums.ageMonths) {
      const height = nums.height || estimateHeight(nums.ageMonths);
      const gender = 'male'; // Default, could be extracted too
      const calories = calculateDailyCalories(nums.weight, height, nums.ageMonths, gender);

      const ageYears = Math.floor(nums.ageMonths / 12);
      const ageRemainingMonths = nums.ageMonths % 12;
      const ageStr = ageYears > 0
        ? `${ageYears} tahun${ageRemainingMonths > 0 ? ` ${ageRemainingMonths} bulan` : ''}`
        : `${nums.ageMonths} bulan`;

      return {
        text: `📊 **Estimasi Kebutuhan Kalori Harian**\n\n` +
          `👤 Usia: ${ageStr}\n` +
          `⚖️ Berat: ${nums.weight} kg\n` +
          `📏 Tinggi: ${height} cm ${!nums.height ? '(estimasi)' : ''}\n\n` +
          `🔥 **Kebutuhan kalori: ~${calories} Kkal/hari**\n\n` +
          `**Distribusi yang disarankan:**\n` +
          `🌅 Sarapan: ~${Math.round(calories * 0.25)} Kkal\n` +
          `☀️ Makan Siang: ~${Math.round(calories * 0.30)} Kkal\n` +
          `🌙 Makan Malam: ~${Math.round(calories * 0.25)} Kkal\n` +
          `🍎 Camilan: ~${Math.round(calories * 0.20)} Kkal\n\n` +
          `> 💡 Untuk hasil lebih akurat, gunakan **Kalkulator Gizi** di halaman utama.`,
        suggestions: ['Rekomendasi menu', 'Menu sesuai kalori ini', 'Apa itu stunting?', 'Tips makan sehat'],
        mealCards: null,
      };
    }

    return {
      text: '📊 Untuk menghitung kebutuhan kalori anak, saya butuh informasi berikut:\n\n' +
        '• **Usia** anak (dalam tahun atau bulan)\n' +
        '• **Berat badan** (dalam kg)\n' +
        '• **Tinggi badan** (dalam cm) — opsional\n\n' +
        'Contoh: *"Kalori untuk anak 3 tahun berat 14 kg"*\n\n' +
        '> Atau gunakan **Kalkulator Gizi** di halaman utama untuk analisis lengkap!',
      suggestions: ['Kalori anak 2 tahun 12 kg', 'Kalori anak 5 tahun 18 kg', 'Buka Kalkulator Gizi', 'Menu rekomendasi'],
      mealCards: null,
    };
  }

  // ── Nutrition status check ──
  if (intent === 'nutrition_check') {
    return {
      text: '📋 **Cek Status Gizi Anak**\n\n' +
        'Untuk mengecek status gizi anak secara akurat berdasarkan standar WHO, silakan gunakan **Kalkulator Gizi Antropometri** kami!\n\n' +
        'Data yang diperlukan:\n' +
        '• 📅 Tanggal lahir / usia anak\n' +
        '• ⚖️ Berat badan (kg)\n' +
        '• 📏 Tinggi badan (cm)\n' +
        '• 👤 Jenis kelamin\n\n' +
        'Kalkulator akan menghitung **Z-score** berdasarkan tabel WHO dan menampilkan status gizi:\n' +
        '✅ Normal\n' +
        '⚠️ Kurang Gizi\n' +
        '🔴 Gizi Buruk\n' +
        '📏 Risiko Stunting\n' +
        '⚖️ Risiko Obesitas\n\n' +
        '> Klik tombol "Buka Kalkulator" untuk memulai!',
      suggestions: ['Buka Kalkulator Gizi', 'Apa itu stunting?', 'Apa itu Z-score?', 'Kebutuhan kalori anak'],
      mealCards: null,
    };
  }

  // ── Food search ──
  if (intent === 'food_info') {
    // Try to find a specific food
    const words = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    let foundFoods = [];

    for (const word of words) {
      const results = searchFood(word);
      foundFoods = [...foundFoods, ...results];
    }

    // Deduplicate
    const unique = [...new Map(foundFoods.map(f => [f.id, f])).values()];

    if (unique.length > 0) {
      const topResults = unique.slice(0, 3);
      const foodText = topResults.map((f, i) =>
        `**${i + 1}. ${f.foodName}** (${MEAL_TYPE_LABELS[f.mealType]})\n` +
        `📊 ${f.calories} Kkal | Protein: ${f.protein}g | Karbo: ${f.carbs}g | Lemak: ${f.fat}g\n` +
        `📝 Bahan: ${f.ingredients.join(', ')}\n` +
        `👨‍🍳 ${f.instructions}`
      ).join('\n\n');

      return {
        text: `🔍 Berikut informasi yang saya temukan:\n\n${foodText}`,
        suggestions: ['Menu lainnya', 'Rekomendasi harian', 'Hitung kalori', 'Camilan sehat'],
        mealCards: topResults.map(f => ({
          foodName: f.foodName,
          mealType: f.mealType,
          mealTypeLabel: MEAL_TYPE_LABELS[f.mealType],
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
          ingredients: f.ingredients,
          instructions: f.instructions,
        })),
      };
    }
  }

  // ── Fallback / Unknown ──
  return {
    text: '🤔 Maaf, saya belum bisa menjawab pertanyaan tersebut. Tapi saya bisa membantu Anda dengan:\n\n' +
      '🍽️ **Menu makan** — "Rekomendasi menu harian"\n' +
      '📊 **Kalori** — "Berapa kalori untuk anak 3 tahun?"\n' +
      '📚 **Gizi** — "Apa itu stunting?" atau "Tips anak susah makan"\n' +
      '🥦 **Nutrisi** — "Sumber protein anak" atau "Vitamin penting anak"\n' +
      '🍼 **MPASI** — "Panduan MPASI 6 bulan"\n\n' +
      '> Coba pilih salah satu topik di bawah!',
    suggestions: ['Rekomendasi menu harian', 'Apa itu stunting?', 'Kebutuhan kalori anak', 'Tips anak susah makan'],
    mealCards: null,
  };
}

/**
 * Estimate height based on age (rough WHO median).
 */
function estimateHeight(ageMonths) {
  // Simplified WHO median height-for-age (boys, approximate)
  if (ageMonths <= 0) return 50;
  if (ageMonths <= 6) return 50 + ageMonths * 2.5;
  if (ageMonths <= 12) return 65 + (ageMonths - 6) * 1.5;
  if (ageMonths <= 24) return 74 + (ageMonths - 12) * 1.0;
  if (ageMonths <= 60) return 86 + (ageMonths - 24) * 0.7;
  if (ageMonths <= 120) return 111 + (ageMonths - 60) * 0.5;
  return 140;
}

export { detectIntent, extractNumbers, searchFood, FOOD_DATABASE };
