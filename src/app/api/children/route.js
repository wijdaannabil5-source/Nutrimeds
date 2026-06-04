import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/index';
import { children } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper to get the authenticated user from the session.
 */
async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

/**
 * GET /api/children
 * List all children for the authenticated user.
 */
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = db.select().from(children).where(eq(children.userId, user.id)).all();
    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/children error:', error);
    return Response.json({ error: 'Gagal memuat data anak.' }, { status: 500 });
  }
}

/**
 * POST /api/children
 * Create a new child profile.
 */
export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, dateOfBirth, gender } = body;

    if (!name || !dateOfBirth || !gender) {
      return Response.json(
        { error: 'Nama, tanggal lahir, dan jenis kelamin wajib diisi.' },
        { status: 400 }
      );
    }

    if (!['male', 'female'].includes(gender)) {
      return Response.json(
        { error: 'Gender harus "male" atau "female".' },
        { status: 400 }
      );
    }

    const newChild = {
      id: uuidv4(),
      userId: user.id,
      name,
      dateOfBirth,
      gender,
      createdAt: new Date(),
    };

    db.insert(children).values(newChild).run();

    return Response.json({ success: true, data: newChild }, { status: 201 });
  } catch (error) {
    console.error('POST /api/children error:', error);
    return Response.json({ error: 'Gagal menambahkan profil anak.' }, { status: 500 });
  }
}
