import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/index';
import { children } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

export async function GET(request, { params }) {
  try {
    const user = await getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const result = db.select().from(children).where(
      and(eq(children.id, id), eq(children.userId, user.id))
    ).get();

    if (!result) {
      return Response.json({ error: 'Data anak tidak ditemukan.' }, { status: 404 });
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/children/[id] error:', error);
    return Response.json({ error: 'Gagal mengambil profil anak.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, dateOfBirth, gender } = body;

    const existing = db.select().from(children).where(
      and(eq(children.id, id), eq(children.userId, user.id))
    ).get();

    if (!existing) {
      return Response.json({ error: 'Data anak tidak ditemukan.' }, { status: 404 });
    }

    db.update(children)
      .set({
        ...(name && { name }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(gender && { gender }),
      })
      .where(eq(children.id, id))
      .run();

    return Response.json({ success: true, message: 'Profil anak diperbarui.' });
  } catch (error) {
    console.error('PUT /api/children/[id] error:', error);
    return Response.json({ error: 'Gagal memperbarui profil anak.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = db.select().from(children).where(
      and(eq(children.id, id), eq(children.userId, user.id))
    ).get();

    if (!existing) {
      return Response.json({ error: 'Data anak tidak ditemukan.' }, { status: 404 });
    }

    db.delete(children).where(eq(children.id, id)).run();

    return Response.json({ success: true, message: 'Profil anak dihapus.' });
  } catch (error) {
    console.error('DELETE /api/children/[id] error:', error);
    return Response.json({ error: 'Gagal menghapus profil anak.' }, { status: 500 });
  }
}
