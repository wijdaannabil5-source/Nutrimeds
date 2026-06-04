import { generateRandomMenu } from '@/lib/nutrition/meal-generator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { targetCalories, status } = body;

    if (!targetCalories) {
      return Response.json(
        { error: 'targetCalories wajib disertakan.' },
        { status: 400 }
      );
    }

    // Generate a random meal plan variation
    const mealPlan = generateRandomMenu(targetCalories, status || 'Normal');

    return Response.json({ success: true, data: mealPlan });
  } catch (error) {
    console.error('POST /api/meal-plan/generate error:', error);
    return Response.json(
      { error: 'Gagal membuat variasi menu.' },
      { status: 500 }
    );
  }
}
