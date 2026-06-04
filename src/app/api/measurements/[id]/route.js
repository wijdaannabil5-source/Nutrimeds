import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/index';
import { children, measurements, mealPlans } from '@/lib/db/schema';
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

    // Fetch the measurement
    const measurement = db.select().from(measurements)
      .where(eq(measurements.id, id))
      .get();

    if (!measurement) {
      return Response.json({ error: 'Data pengukuran tidak ditemukan.' }, { status: 404 });
    }

    // Verify ownership via child relation
    const child = db.select().from(children).where(
      and(eq(children.id, measurement.childId), eq(children.userId, user.id))
    ).get();

    if (!child) {
      return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    // Fetch the associated meal plan
    const meals = db.select().from(mealPlans)
      .where(eq(mealPlans.measurementId, id))
      .all();

    // Parse ingredients back to array
    const parsedMeals = meals.map(m => ({
      ...m,
      ingredients: JSON.parse(m.ingredients),
    }));

    return Response.json({
      success: true,
      data: {
        measurement,
        child,
        mealPlan: parsedMeals,
      },
    });
  } catch (error) {
    console.error('GET /api/measurements/[id] error:', error);
    return Response.json({ error: 'Gagal memuat detail pengukuran.' }, { status: 500 });
  }
}
