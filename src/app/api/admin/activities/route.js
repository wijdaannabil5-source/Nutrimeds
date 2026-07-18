import { db } from '@/lib/db/index';
import { users, children, measurements, activityLogs } from '@/lib/db/schema';
import { count, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

/**
 * Helper untuk memvalidasi sesi admin.
 */
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  return session === 'authenticated_gege_admin_session';
}

/**
 * GET /api/admin/activities
 * Mengambil data statistik gizi dan log aktivitas sistem.
 */
export async function GET(request) {
  try {
    // Verifikasi sesi admin
    if (!(await verifyAdminSession())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const actionFilter = searchParams.get('action');
    const searchFilter = searchParams.get('search');

    // 1. Hitung metrik ringkas
    const totalUsers = db.select({ val: count() }).from(users).get()?.val || 0;
    const totalChildren = db.select({ val: count() }).from(children).get()?.val || 0;
    const totalMeasurements = db.select({ val: count() }).from(measurements).get()?.val || 0;
    const totalActivities = db.select({ val: count() }).from(activityLogs).get()?.val || 0;

    // 2. Distribusi Status Gizi
    const measurementRows = db.select().from(measurements).all();
    const statusDistribution = {
      'Normal': 0,
      'Kurang Gizi': 0,
      'Gizi Buruk': 0,
      'Risiko Stunting': 0,
      'Risiko Obesitas': 0,
      'Obesitas': 0,
      'Berat Badan Lebih': 0
    };
    measurementRows.forEach(row => {
      if (statusDistribution[row.nutritionStatus] !== undefined) {
        statusDistribution[row.nutritionStatus]++;
      } else {
        statusDistribution['Normal']++;
      }
    });

    // 3. Tren Aktivitas (7 Hari Terakhir)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Ambil nama hari dalam Bahasa Indonesia
      const options = { weekday: 'short' };
      const dayName = d.toLocaleDateString('id-ID', options);
      
      last7Days.push({ 
        date: dateStr, 
        label: `${dayName} (${d.getDate()}/${d.getMonth() + 1})`,
        count: 0 
      });
    }

    // Ambil semua aktivitas untuk agregasi grafik
    const allActivities = db.select().from(activityLogs).all();
    allActivities.forEach(act => {
      const actDate = new Date(act.createdAt).toISOString().split('T')[0];
      const day = last7Days.find(d => d.date === actDate);
      if (day) {
        day.count++;
      }
    });

    // 4. Log Aktivitas Berpaginasi dengan Filter
    let filteredLogs = db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).all();

    if (actionFilter && actionFilter !== 'ALL') {
      filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
    }
    
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.description.toLowerCase().includes(q) || 
        (log.userName && log.userName.toLowerCase().includes(q)) ||
        log.action.toLowerCase().includes(q)
      );
    }

    const totalFiltered = filteredLogs.length;
    const startIndex = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(totalFiltered / limit);

    // Fetch daftar user
    const usersList = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.createdAt)).all();

    // Fetch daftar anak
    const childrenList = db.select({
      id: children.id,
      name: children.name,
      dateOfBirth: children.dateOfBirth,
      gender: children.gender,
      createdAt: children.createdAt,
      userId: children.userId
    }).from(children).orderBy(desc(children.createdAt)).all();

    // Petakan nama orang tua ke data anak
    const childrenWithUser = childrenList.map(child => {
      const parent = usersList.find(u => u.id === child.userId);
      
      // Ambil pengukuran terakhir anak jika ada
      const childMeas = measurementRows
        .filter(m => m.childId === child.id)
        .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt));
      const latestStatus = childMeas.length > 0 ? childMeas[0].nutritionStatus : 'Belum diukur';
      const latestWeight = childMeas.length > 0 ? childMeas[0].weight : null;
      const latestHeight = childMeas.length > 0 ? childMeas[0].height : null;

      return {
        ...child,
        parentName: parent ? parent.name : 'Tidak diketahui',
        latestStatus,
        latestWeight,
        latestHeight
      };
    });

    // Hitung rata-rata status kesehatan gizi
    let stuntingCount = 0;
    let obesityCount = 0;
    let underweightCount = 0;
    
    measurementRows.forEach(m => {
      if (m.zScoreHFA && m.zScoreHFA < -2) stuntingCount++;
      if (m.zScoreBFA && m.zScoreBFA > 2) obesityCount++;
      if (m.zScoreWFA && m.zScoreWFA < -2) underweightCount++;
    });

    const totalMeasurementsCount = measurementRows.length;
    const stuntingRate = totalMeasurementsCount > 0 ? Math.round((stuntingCount / totalMeasurementsCount) * 100) : 0;
    const obesityRate = totalMeasurementsCount > 0 ? Math.round((obesityCount / totalMeasurementsCount) * 100) : 0;
    const underweightRate = totalMeasurementsCount > 0 ? Math.round((underweightCount / totalMeasurementsCount) * 100) : 0;

    return Response.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalChildren,
          totalMeasurements,
          totalActivities,
          health: {
            stuntingRate,
            obesityRate,
            underweightRate
          }
        },
        statusDistribution,
        activityTrend: last7Days,
        logs: paginatedLogs,
        usersList,
        childrenList: childrenWithUser,
        pagination: {
          page,
          limit,
          totalItems: totalFiltered,
          totalPages,
        }
      }
    });

  } catch (error) {
    console.error('GET /api/admin/activities error:', error);
    return Response.json({ error: 'Gagal mengambil data aktivitas admin.' }, { status: 500 });
  }
}

/**
 * POST /api/admin/activities
 * Digunakan untuk memicu simulasi log aktivitas demi kemudahan testing.
 */
export async function POST(request) {
  try {
    // Verifikasi sesi admin
    if (!(await verifyAdminSession())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'SIMULATE') {
      // Data simulasi pengguna
      const dummyUsers = [
        { id: uuidv4(), name: 'Budi Santoso', email: `budi.${Math.floor(Math.random() * 1000)}@gmail.com` },
        { id: uuidv4(), name: 'Siti Aminah', email: `siti.${Math.floor(Math.random() * 1000)}@gmail.com` },
        { id: uuidv4(), name: 'Rian Wijaya', email: `rian.${Math.floor(Math.random() * 1000)}@gmail.com` }
      ];

      // Data simulasi anak
      const dummyChildren = [
        { id: uuidv4(), name: 'Alif Santoso', dob: '2024-03-12', gender: 'male', userIdIndex: 0 },
        { id: uuidv4(), name: 'Citra Wijaya', dob: '2025-01-20', gender: 'female', userIdIndex: 2 },
        { id: uuidv4(), name: 'Farhan Amin', dob: '2023-08-05', gender: 'male', userIdIndex: 1 },
        { id: uuidv4(), name: 'Kania Aminah', dob: '2024-11-02', gender: 'female', userIdIndex: 1 }
      ];

      // Tulis beberapa data simulasi ke DB
      // Masukkan user baru (hanya jika ingin menambahkan metrik user)
      dummyUsers.forEach(u => {
        db.insert(users).values({
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: new Date(),
          updatedAt: new Date()
        }).run();
      });

      // Masukkan profil anak
      dummyChildren.forEach(c => {
        const user = dummyUsers[c.userIdIndex];
        db.insert(children).values({
          id: c.id,
          userId: user.id,
          name: c.name,
          dateOfBirth: c.dob,
          gender: c.gender,
          createdAt: new Date()
        }).run();
      });

      // Masukkan beberapa pengukuran & meal plans dummy
      const dummyMeasurements = [
        { childIdIndex: 0, weight: 12.5, height: 86.2, ageMonths: 28, status: 'Normal', cal: 1100, daysAgo: 10 },
        { childIdIndex: 1, weight: 8.2, height: 75.1, ageMonths: 17, status: 'Risiko Stunting', cal: 850, daysAgo: 15 },
        { childIdIndex: 1, weight: 9.1, height: 78.4, ageMonths: 18, status: 'Normal', cal: 900, daysAgo: 0 },
        { childIdIndex: 2, weight: 15.2, height: 98.4, ageMonths: 35, status: 'Normal', cal: 1250, daysAgo: 5 },
        { childIdIndex: 2, weight: 16.5, height: 100.2, ageMonths: 36, status: 'Berat Badan Lebih', cal: 1300, daysAgo: 0 },
        { childIdIndex: 3, weight: 11.2, height: 83.4, ageMonths: 20, status: 'Normal', cal: 950, daysAgo: 4 }
      ];

      dummyMeasurements.forEach(m => {
        const child = dummyChildren[m.childIdIndex];
        const measId = uuidv4();
        const measuredDate = new Date();
        measuredDate.setDate(measuredDate.getDate() - m.daysAgo);

        db.insert(measurements).values({
          id: measId,
          childId: child.id,
          weight: m.weight,
          height: m.height,
          ageMonths: m.ageMonths,
          nutritionStatus: m.status,
          recommendedCalories: m.cal,
          measuredAt: measuredDate,
          zScoreWFA: m.status === 'Normal' ? 0.2 : m.status.includes('Stunting') ? -2.2 : 2.1,
          zScoreHFA: m.status.includes('Stunting') ? -2.3 : 0.4,
          zScoreBFA: m.status.includes('Lebih') ? 2.2 : 0.1,
        }).run();
      });

      // Bikin aktivitas log historis selama 7 hari ke belakang
      const actions = ['CALCULATE', 'CHAT', 'CREATE_CHILD', 'ADD_MEASUREMENT', 'GENERATE_PPTX'];
      const ipList = ['192.168.1.1', '182.253.14.88', '110.138.9.201', '36.85.191.12', '125.167.31.42'];
      const uaList = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      ];

      const dummyLogs = [
        { action: 'USER_SIGNUP', desc: 'Pengguna baru terdaftar: Budi Santoso', daysAgo: 6, userIdx: 0 },
        { action: 'CREATE_CHILD', desc: 'Mendaftarkan profil anak baru: Alif Santoso (Laki-laki)', daysAgo: 6, userIdx: 0 },
        { action: 'ADD_MEASUREMENT', desc: 'Menambahkan pengukuran gizi untuk Alif Santoso: 12.5 kg, 86.2 cm. Hasil: Normal', daysAgo: 6, userIdx: 0 },
        { action: 'CHAT', desc: 'Tanya AI: "Berapa kebutuhan kalori balita 2 tahun?"', daysAgo: 5, userIdx: 0 },
        
        { action: 'CALCULATE', desc: 'Kalkulasi gizi mandiri (anonim): Perempuan, 6 kg, 62 cm, 6 bulan. Hasil: Normal', daysAgo: 5, userIdx: null },
        { action: 'CALCULATE', desc: 'Kalkulasi gizi mandiri (anonim): Laki-laki, 10.5 kg, 78 cm, 18 bulan. Hasil: Normal', daysAgo: 4, userIdx: null },
        
        { action: 'USER_SIGNUP', desc: 'Pengguna baru terdaftar: Siti Aminah', daysAgo: 4, userIdx: 1 },
        { action: 'CREATE_CHILD', desc: 'Mendaftarkan profil anak baru: Farhan Amin (Laki-laki)', daysAgo: 4, userIdx: 1 },
        { action: 'CREATE_CHILD', desc: 'Mendaftarkan profil anak baru: Kania Aminah (Perempuan)', daysAgo: 4, userIdx: 1 },
        { action: 'ADD_MEASUREMENT', desc: 'Menambahkan pengukuran gizi untuk Farhan Amin: 15.2 kg, 98.4 cm. Hasil: Normal', daysAgo: 4, userIdx: 1 },
        
        { action: 'CHAT', desc: 'Tanya AI: "Bagaimana cara mengatasi anak stunting?"', daysAgo: 3, userIdx: 1 },
        { action: 'CHAT', desc: 'Tanya AI: "Rekomendasi makanan tinggi zat besi"', daysAgo: 3, userIdx: 1 },
        { action: 'GENERATE_PPTX', desc: 'Mengunduh laporan PPTX konsultasi gizi Farhan Amin', daysAgo: 3, userIdx: 1 },
        
        { action: 'USER_SIGNUP', desc: 'Pengguna baru terdaftar: Rian Wijaya', daysAgo: 2, userIdx: 2 },
        { action: 'CREATE_CHILD', desc: 'Mendaftarkan profil anak baru: Citra Wijaya (Perempuan)', daysAgo: 2, userIdx: 2 },
        { action: 'ADD_MEASUREMENT', desc: 'Menambahkan pengukuran gizi untuk Citra Wijaya: 8.2 kg, 75.1 cm. Hasil: Risiko Stunting', daysAgo: 2, userIdx: 2 },
        { action: 'CHAT', desc: 'Tanya AI: "Citra divonis risiko stunting, apa langkah pertama?"', daysAgo: 2, userIdx: 2 },
        
        { action: 'CALCULATE', desc: 'Kalkulasi gizi mandiri (anonim): Laki-laki, 14 kg, 95 cm, 36 bulan. Hasil: Normal', daysAgo: 1, userIdx: null },
        { action: 'CALCULATE', desc: 'Kalkulasi gizi mandiri (anonim): Perempuan, 16 kg, 94 cm, 36 bulan. Hasil: Obesitas', daysAgo: 1, userIdx: null },
        
        { action: 'ADD_MEASUREMENT', desc: 'Menambahkan pengukuran gizi untuk Citra Wijaya: 9.1 kg, 78.4 cm. Hasil: Normal (Ada kemajuan)', daysAgo: 0, userIdx: 2 },
        { action: 'ADD_MEASUREMENT', desc: 'Menambahkan pengukuran gizi untuk Farhan Amin: 16.5 kg, 100.2 cm. Hasil: Berat Badan Lebih', daysAgo: 0, userIdx: 1 },
        { action: 'CHAT', desc: 'Tanya AI: "Mengapa tinggi badan anak 2 tahun melambat?"', daysAgo: 0, userIdx: 2 },
        { action: 'GENERATE_PPTX', desc: 'Mengunduh laporan PPTX konsultasi gizi Citra Wijaya', daysAgo: 0, userIdx: 2 }
      ];

      dummyLogs.forEach(l => {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - l.daysAgo);
        
        // Randomize hour, minute, second
        logDate.setHours(Math.floor(Math.random() * 12) + 8);
        logDate.setMinutes(Math.floor(Math.random() * 60));
        logDate.setSeconds(Math.floor(Math.random() * 60));

        const user = l.userIdx !== null ? dummyUsers[l.userIdx] : null;

        db.insert(activityLogs).values({
          id: uuidv4(),
          userId: user ? user.id : null,
          userName: user ? user.name : null,
          action: l.action,
          description: l.desc,
          ipAddress: ipList[Math.floor(Math.random() * ipList.length)],
          userAgent: uaList[Math.floor(Math.random() * uaList.length)],
          createdAt: logDate
        }).run();
      });

      // Log simulated action itself
      db.insert(activityLogs).values({
        id: uuidv4(),
        userId: null,
        userName: 'Sistem Admin',
        action: 'MOCK_SIMULATION',
        description: 'Memicu simulasi data dummy aktivitas & pengguna baru',
        ipAddress: '127.0.0.1',
        userAgent: 'Node.js/Internal',
        createdAt: new Date()
      }).run();

      return Response.json({
        success: true,
        message: 'Simulasi data dummy berhasil digenerasikan ke database.'
      });
    }

    return Response.json({ error: 'Aksi tidak valid.' }, { status: 400 });

  } catch (error) {
    console.error('POST /api/admin/activities error:', error);
    return Response.json({ error: 'Gagal menjalankan simulasi aktivitas.' }, { status: 500 });
  }
}
