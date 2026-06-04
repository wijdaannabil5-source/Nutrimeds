import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/index';
import { children, measurements, mealPlans } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { calculateNutritionStatus, calculateAgeMonths } from '@/lib/nutrition/calculator';
import { generateDailyMenu } from '@/lib/nutrition/meal-generator';

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

/**
 * GET /api/measurements?childId=...
 * Get measurement history for a child.
 */
export async function GET(request) {
  try {
    const user = await getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    if (!childId) {
      return Response.json({ error: 'childId parameter is required' }, { status: 400 });
    }

    // Verify ownership
    const child = db.select().from(children).where(
      and(eq(children.id, childId), eq(children.userId, user.id))
    ).get();

    if (!child) {
      return Response.json({ error: 'Anak tidak ditemukan atau akses ditolak.' }, { status: 404 });
    }

    const history = db.select().from(measurements)
      .where(eq(measurements.childId, childId))
      .orderBy(measurements.measuredAt)
      .all();

    return Response.json({ success: true, data: history });
  } catch (error) {
    console.error('GET /api/measurements error:', error);
    return Response.json({ error: 'Gagal memuat data pengukuran.' }, { status: 500 });
  }
}

/**
 * POST /api/measurements
 * Submit a new measurement, auto-calculate nutrition status and generate meal plan.
 */
export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { childId, weight, height } = body;

    if (!childId || !weight || !height) {
      return Response.json(
        { error: 'childId, weight, dan height wajib diisi.' },
        { status: 400 }
      );
    }

    // Verify child ownership
    const child = db.select().from(children).where(
      and(eq(children.id, childId), eq(children.userId, user.id))
    ).get();

    if (!child) {
      return Response.json({ error: 'Anak tidak ditemukan atau akses ditolak.' }, { status: 404 });
    }

    const ageMonths = calculateAgeMonths(child.dateOfBirth);
    
    // Calculate nutrition status
    const calcResult = calculateNutritionStatus(weight, height, ageMonths, child.gender);

    const measurementId = uuidv4();
    const newMeasurement = {
      id: measurementId,
      childId: childId,
      height,
      weight,
      ageMonths,
      nutritionStatus: calcResult.overallStatus,
      zScoreWFA: calcResult.zScores.weightForAge.value,
      zScoreHFA: calcResult.zScores.heightForAge.value,
      zScoreBFA: calcResult.zScores.bmiForAge.value,
      recommendedCalories: calcResult.recommendedCalories,
      measuredAt: new Date(),
    };

    // Generate meal plan
    const generatedMeals = generateDailyMenu(calcResult.recommendedCalories, calcResult.overallStatus);
    const mealsToInsert = generatedMeals.map(meal => ({
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

    // Use transaction to ensure both measurement and meal plans are saved
    db.transaction((tx) => {
      tx.insert(measurements).values(newMeasurement).run();
      mealsToInsert.forEach(meal => {
        tx.insert(mealPlans).values(meal).run();
      });
    });

    return Response.json({
      success: true,
      data: {
        measurement: newMeasurement,
        mealPlan: generatedMeals,
        interpretation: calcResult.interpretation,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/measurements error:', error);
    return Response.json({ error: 'Gagal menyimpan pengukuran.' }, { status: 500 });
  }
}
