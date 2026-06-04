import { calculateNutritionStatus, calculateAgeMonths } from '@/lib/nutrition/calculator';
import { generateDailyMenu } from '@/lib/nutrition/meal-generator';

/**
 * POST /api/calculate
 * Public, stateless endpoint — no auth required, no DB save.
 * Used for quick checks from the calculator page.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { weight, height, dateOfBirth, gender, ageMonths: providedAge } = body;

    // Validate required fields
    if (!weight || !height || !gender) {
      return Response.json(
        { error: 'Field weight, height, dan gender wajib diisi.' },
        { status: 400 }
      );
    }

    if (weight <= 0 || height <= 0) {
      return Response.json(
        { error: 'Berat dan tinggi badan harus lebih dari 0.' },
        { status: 400 }
      );
    }

    if (!['male', 'female'].includes(gender)) {
      return Response.json(
        { error: 'Gender harus "male" atau "female".' },
        { status: 400 }
      );
    }

    // Calculate age in months
    const ageMonths = providedAge ?? (dateOfBirth ? calculateAgeMonths(dateOfBirth) : null);
    if (ageMonths === null || ageMonths < 0) {
      return Response.json(
        { error: 'Tanggal lahir atau usia (bulan) harus disertakan.' },
        { status: 400 }
      );
    }

    if (ageMonths > 120) {
      return Response.json(
        { error: 'Kalkulator ini dioptimalkan untuk anak usia 0–10 tahun (120 bulan).' },
        { status: 400 }
      );
    }

    // Calculate nutrition status
    const result = calculateNutritionStatus(weight, height, ageMonths, gender);

    // Generate a meal plan
    const mealPlan = generateDailyMenu(result.recommendedCalories, result.overallStatus);

    return Response.json({
      success: true,
      data: {
        input: { weight, height, ageMonths, gender },
        ...result,
        mealPlan,
      },
    });
  } catch (error) {
    console.error('Calculate API error:', error);
    return Response.json(
      { error: 'Terjadi kesalahan saat menghitung. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
