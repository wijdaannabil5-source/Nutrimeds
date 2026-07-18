import { cookies } from 'next/headers';

/**
 * POST /api/admin/login
 * Memvalidasi kredensial admin dan menyetel cookie sesi.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    if (username === 'gege' && password === '12345678') {
      const cookieStore = await cookies();
      
      // Setel cookie sesi admin
      cookieStore.set({
        name: 'admin_session',
        value: 'authenticated_gege_admin_session',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // Sesi berlaku selama 24 jam
        sameSite: 'lax',
      });

      return Response.json({ success: true, message: 'Login admin berhasil.' });
    }

    return Response.json(
      { error: 'Username atau password admin salah.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login API error:', error);
    return Response.json(
      { error: 'Terjadi kesalahan sistem saat memproses login.' },
      { status: 500 }
    );
  }
}
