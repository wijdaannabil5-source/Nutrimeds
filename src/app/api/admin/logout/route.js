import { cookies } from 'next/headers';

/**
 * POST /api/admin/logout
 * Menghapus cookie sesi admin.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Hapus cookie sesi admin dengan menyetel masa berlaku ke 0
    cookieStore.set({
      name: 'admin_session',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
    });

    return Response.json({ success: true, message: 'Logout admin berhasil.' });
  } catch (error) {
    console.error('Admin logout API error:', error);
    return Response.json(
      { error: 'Terjadi kesalahan sistem saat proses logout.' },
      { status: 500 }
    );
  }
}
