import { db } from '@/lib/db/index';
import { users, accounts, activityLogs } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { hashPassword } from 'better-auth/crypto';

/**
 * Helper untuk memvalidasi sesi admin.
 */
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  return session === 'authenticated_gege_admin_session';
}

/**
 * POST /api/admin/users
 * Menambahkan pengguna baru oleh Admin.
 */
export async function POST(request) {
  try {
    if (!(await verifyAdminSession())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !name.trim()) {
      return Response.json({ error: 'Nama pengguna wajib diisi.' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return Response.json({ error: 'Email pengguna wajib diisi.' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Cek apakah email sudah terdaftar
    const existingUser = db.select().from(users).where(eq(users.email, trimmedEmail)).get();
    if (existingUser) {
      return Response.json({ error: 'Email sudah terdaftar pada pengguna lain.' }, { status: 400 });
    }

    const newUserId = uuidv4();
    const now = new Date();

    // Insert user
    db.insert(users).values({
      id: newUserId,
      name: name.trim(),
      email: trimmedEmail,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    }).run();

    // Insert credential account jika password diisi
    if (password && password.trim().length > 0) {
      if (password.trim().length < 8) {
        return Response.json({ error: 'Kata sandi minimal 8 karakter.' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(password.trim());
      db.insert(accounts).values({
        id: uuidv4(),
        userId: newUserId,
        accountId: newUserId,
        providerId: 'credential',
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      }).run();
    }

    // Catat log aktivitas
    db.insert(activityLogs).values({
      id: uuidv4(),
      userId: newUserId,
      userName: 'Super Admin',
      action: 'ADMIN_CREATE_USER',
      description: `Menambahkan pengguna baru: ${name.trim()} (${trimmedEmail})`,
      ipAddress: '127.0.0.1',
      userAgent: 'Admin Console',
      createdAt: now,
    }).run();

    return Response.json({
      success: true,
      message: 'Pengguna baru berhasil ditambahkan.',
      user: { id: newUserId, name: name.trim(), email: trimmedEmail, createdAt: now }
    });

  } catch (error) {
    console.error('POST /api/admin/users error:', error);
    return Response.json({ error: 'Gagal menambahkan pengguna baru.' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users
 * Memperbarui data pengguna yang sudah ada.
 */
export async function PUT(request) {
  try {
    if (!(await verifyAdminSession())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, password } = body;

    if (!id) {
      return Response.json({ error: 'ID Pengguna wajib disertakan.' }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return Response.json({ error: 'Nama pengguna tidak boleh kosong.' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return Response.json({ error: 'Email pengguna tidak boleh kosong.' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Cek user yang akan diupdate
    const targetUser = db.select().from(users).where(eq(users.id, id)).get();
    if (!targetUser) {
      return Response.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Cek email bentrok dengan pengguna lain
    const emailConflict = db.select().from(users).where(
      and(eq(users.email, trimmedEmail), ne(users.id, id))
    ).get();

    if (emailConflict) {
      return Response.json({ error: 'Email sudah digunakan oleh pengguna lain.' }, { status: 400 });
    }

    const now = new Date();

    // Update data pengguna
    db.update(users)
      .set({
        name: name.trim(),
        email: trimmedEmail,
        updatedAt: now,
      })
      .where(eq(users.id, id))
      .run();

    // Jika ada input password baru
    if (password && password.trim().length > 0) {
      if (password.trim().length < 8) {
        return Response.json({ error: 'Kata sandi baru minimal 8 karakter.' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(password.trim());
      const existingAccount = db.select().from(accounts).where(
        and(eq(accounts.userId, id), eq(accounts.providerId, 'credential'))
      ).get();

      if (existingAccount) {
        db.update(accounts)
          .set({
            password: hashedPassword,
            updatedAt: now,
          })
          .where(eq(accounts.id, existingAccount.id))
          .run();
      } else {
        db.insert(accounts).values({
          id: uuidv4(),
          userId: id,
          accountId: id,
          providerId: 'credential',
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        }).run();
      }
    }

    // Catat log aktivitas
    db.insert(activityLogs).values({
      id: uuidv4(),
      userId: id,
      userName: 'Super Admin',
      action: 'ADMIN_UPDATE_USER',
      description: `Memperbarui data pengguna: ${name.trim()} (${trimmedEmail})`,
      ipAddress: '127.0.0.1',
      userAgent: 'Admin Console',
      createdAt: now,
    }).run();

    return Response.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.'
    });

  } catch (error) {
    console.error('PUT /api/admin/users error:', error);
    return Response.json({ error: 'Gagal memperbarui data pengguna.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users
 * Menghapus akun pengguna dari database.
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
        // ignore json parse error if empty
      }
    }

    if (!id) {
      return Response.json({ error: 'ID Pengguna wajib disertakan.' }, { status: 400 });
    }

    const targetUser = db.select().from(users).where(eq(users.id, id)).get();
    if (!targetUser) {
      return Response.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Hapus pengguna
    db.delete(users).where(eq(users.id, id)).run();

    // Catat log aktivitas
    db.insert(activityLogs).values({
      id: uuidv4(),
      userId: null,
      userName: 'Super Admin',
      action: 'ADMIN_DELETE_USER',
      description: `Menghapus akun pengguna: ${targetUser.name} (${targetUser.email})`,
      ipAddress: '127.0.0.1',
      userAgent: 'Admin Console',
      createdAt: new Date(),
    }).run();

    return Response.json({
      success: true,
      message: `Pengguna ${targetUser.name} berhasil dihapus.`
    });

  } catch (error) {
    console.error('DELETE /api/admin/users error:', error);
    return Response.json({ error: 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}
