import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/index';
import { children, measurements, mealPlans } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateRandomMenu } from '@/lib/nutrition/meal-generator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { targetCalories, status, measurementId } = body;

    if (!targetCalories) {
      return Response.json(
        { error: 'targetCalories wajib disertakan.' },
        { status: 400 }
      );
    }

    // Generate a random meal plan variation
    const mealPlan = generateRandomMenu(targetCalories, status || 'Normal');

    if (measurementId) {
      // 1. Get current session
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      const user = session?.user ?? null;
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // 2. Fetch the measurement and verify it exists
      const measurement = db.select().from(measurements)
        .where(eq(measurements.id, measurementId))
        .get();
      if (!measurement) {
        return Response.json({ error: 'Data pengukuran tidak ditemukan.' }, { status: 404 });
      }

      // 3. Verify ownership of the child associated with this measurement
      const child = db.select().from(children).where(
        and(eq(children.id, measurement.childId), eq(children.userId, user.id))
      ).get();
      if (!child) {
        return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
      }

      // 4. Save new meal plan to the database
      const mealsToInsert = mealPlan.map(meal => ({
        id: uuidv4(),
        measurementId: measurementId,
        mealType: meal.mealType,
        foodName: meal.foodName,
        ingredients: JSON.stringify(meal.ingredients),
        instructions: meal.instructions || '',
        totalCalories: meal.totalCalories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
      }));

      try {
        db.transaction((tx) => {
          // Delete old meal plans
          tx.delete(mealPlans).where(eq(mealPlans.measurementId, measurementId)).run();
          // Insert new meal plans
          mealsToInsert.forEach(meal => {
            tx.insert(mealPlans).values(meal).run();
          });
        });
      } catch (dbError) {
        // Log the error but do not fail the request - allows the UI to still function
        // in read-only environments like serverless Vercel deployments.
        console.error('Failed to persist regenerated meal plan to SQLite database:', dbError);
      }
    }

    return Response.json({ success: true, data: mealPlan });
  } catch (error) {
    console.error('POST /api/meal-plan/generate error:', error);
    return Response.json(
      { error: 'Gagal membuat variasi menu.' },
      { status: 500 }
    );
  }
}

