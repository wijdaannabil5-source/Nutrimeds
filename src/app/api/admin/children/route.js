import { db } from '@/lib/db/index';
import { children, measurements, users, activityLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { calculateNutritionStatus, calculateAgeMonths } from '@/lib/nutrition/calculator';

/**
 * Helper untuk memvalidasi sesi admin.
 */
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  return session === 'authenticated_gege_admin_session';
}

/**
 * POST /api/admin/children
 * Menambahkan profil anak baru oleh Admin.
 */
export async function POST(request) {
  try {
    if (!(await verifyAdminSession())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, name, dateOfBirth, gender, weight, height } = body;

    if (!userId) {
      return Response.json({ error: 'Pengguna / Orang tua wajib dipilih.' }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return Response.json({ error: 'Nama anak wajib diisi.' }, { status: 400 });
    }
    if (!dateOfBirth) {
      return Response.json({ error: 'Tanggal lahir wajib diisi.' }, { status: 400 });
    }
    if (!gender || !['male', 'female'].includes(gender)) {
      return Response.json({ error: 'Jenis kelamin tidak valid.' }, { status: 400 });
    }

    const newChildId = uuidv4();
    const now = new Date();

    // Insert profil anak
    db.insert(children).values({
      id: newChildId,
      userId,
      name: name.trim(),
      dateOfBirth,
      gender,
      createdAt: now,
    }).run();

    // Jika berat dan tinggi diisi, buat data pengukuran awal
    if (weight && height && parseFloat(weight) > 0 && parseFloat(height) > 0) {
      const numWeight = parseFloat(weight);
      const numHeight = parseFloat(height);
      const ageMonths = calculateAgeMonths(dateOfBirth);
      const result = calculateNutritionStatus(numWeight, numHeight, ageMonths, gender);

      db.insert(measurements).values({
        id: uuidv4(),
        childId: newChildId,
        weight: numWeight,
        height: numHeight,
        ageMonths,
        nutritionStatus: result.overallStatus,
        zScoreWFA: result.zScores.weightForAge.value,
        zScoreHFA: result.zScores.heightForAge.value,
        zScoreBFA: result.zScores.bmiForAge.value,
        recommendedCalories: result.recommendedCalories,
        measuredAt: now,
      }).run();
    }

    // Catat audit log
    db.insert(activityLogs).values({
      id: uuidv4(),
      userId: userId,
      userName: 'Super Admin',
      action: 'CREATE_CHILD',
      description: `Menambahkan profil anak baru: ${name.trim()} (${gender === 'male' ? 'Laki-laki' : 'Perempuan'})`,
      ipAddress: '127.0.0.1',
      userAgent: 'Admin Console',
      createdAt: now,
    }).run();

    return Response.json({
      success: true,
      message: 'Profil anak baru berhasil ditambahkan.',
      childId: newChildId,
    });

  } catch (error) {
    console.error('POST /api/admin/children error:', error);
    return Response.json({ error: 'Gagal menambahkan profil anak baru.' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/children
 * Memperbarui data profil anak dan/atau pengukuran gizi terakhir oleh Admin.
 */
export async function PUT(request) {
  try {
    if (!(await verifyAdminSession())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, dateOfBirth, gender, weight, height } = body;

    if (!id) {
      return Response.json({ error: 'ID Anak wajib disertakan.' }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return Response.json({ error: 'Nama anak tidak boleh kosong.' }, { status: 400 });
    }
    if (!dateOfBirth) {
      return Response.json({ error: 'Tanggal lahir tidak boleh kosong.' }, { status: 400 });
    }

    const existingChild = db.select().from(children).where(eq(children.id, id)).get();
    if (!existingChild) {
      return Response.json({ error: 'Data anak tidak ditemukan.' }, { status: 404 });
    }

    const now = new Date();

    // Update data anak
    db.update(children)
      .set({
        name: name.trim(),
        dateOfBirth,
        gender: gender || existingChild.gender,
      })
      .where(eq(children.id, id))
      .run();

    // Jika berat dan tinggi diisi, catat atau perbarui pengukuran gizi
    if (weight && height && parseFloat(weight) > 0 && parseFloat(height) > 0) {
      const numWeight = parseFloat(weight);
      const numHeight = parseFloat(height);
      const ageMonths = calculateAgeMonths(dateOfBirth);
      const result = calculateNutritionStatus(numWeight, numHeight, ageMonths, gender || existingChild.gender);

      // Cari pengukuran terakhir jika ada
      const childMeas = db.select().from(measurements)
        .where(eq(measurements.childId, id))
        .orderBy(desc(measurements.measuredAt))
        .get();

      if (childMeas) {
        db.update(measurements)
          .set({
            weight: numWeight,
            height: numHeight,
            ageMonths,
            nutritionStatus: result.overallStatus,
            zScoreWFA: result.zScores.weightForAge.value,
            zScoreHFA: result.zScores.heightForAge.value,
            zScoreBFA: result.zScores.bmiForAge.value,
            recommendedCalories: result.recommendedCalories,
            measuredAt: now,
          })
          .where(eq(measurements.id, childMeas.id))
          .run();
      } else {
        db.insert(measurements).values({
          id: uuidv4(),
          childId: id,
          weight: numWeight,
          height: numHeight,
          ageMonths,
          nutritionStatus: result.overallStatus,
          zScoreWFA: result.zScores.weightForAge.value,
          zScoreHFA: result.zScores.heightForAge.value,
          zScoreBFA: result.zScores.bmiForAge.value,
          recommendedCalories: result.recommendedCalories,
          measuredAt: now,
        }).run();
      }
    }

    // Catat log aktivitas
    db.insert(activityLogs).values({
      id: uuidv4(),
      userId: existingChild.userId,
      userName: 'Super Admin',
      action: 'ADMIN_UPDATE_CHILD',
      description: `Memperbarui data anak: ${name.trim()}`,
      ipAddress: '127.0.0.1',
      userAgent: 'Admin Console',
      createdAt: now,
    }).run();

    return Response.json({
      success: true,
      message: 'Data anak berhasil diperbarui.',
    });

  } catch (error) {
    console.error('PUT /api/admin/children error:', error);
    return Response.json({ error: 'Gagal memperbarui data anak.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/children
 * Menghapus profil anak oleh Admin.
 */
export async function DELETE(request) {
  try {
    if (!(await verifyAdminSession())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // ignore
      }
    }

    if (!id) {
      return Response.json({ error: 'ID Anak wajib disertakan.' }, { status: 400 });
    }

    const targetChild = db.select().from(children).where(eq(children.id, id)).get();
    if (!targetChild) {
      return Response.json({ error: 'Data anak tidak ditemukan.' }, { status: 404 });
    }

    db.delete(children).where(eq(children.id, id)).run();

    db.insert(activityLogs).values({
      id: uuidv4(),
      userId: targetChild.userId,
      userName: 'Super Admin',
      action: 'ADMIN_DELETE_CHILD',
      description: `Menghapus profil anak: ${targetChild.name}`,
      ipAddress: '127.0.0.1',
      userAgent: 'Admin Console',
      createdAt: new Date(),
    }).run();

    return Response.json({
      success: true,
      message: `Profil anak "${targetChild.name}" berhasil dihapus.`,
    });

  } catch (error) {
    console.error('DELETE /api/admin/children error:', error);
    return Response.json({ error: 'Gagal menghapus profil anak.' }, { status: 500 });
  }
}
