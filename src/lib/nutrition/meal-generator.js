/**
 * Indonesian local food database and automatic meal plan generator.
 * All foods use ingredients commonly found in Indonesian markets (pasar).
 */

const FOOD_DATABASE = [
  // ============ SARAPAN (Breakfast) ============
  {
    id: 'bubur-ayam',
    mealType: 'sarapan',
    foodName: 'Bubur Ayam',
    ingredients: ['Beras 50g', 'Ayam suwir 30g', 'Kaldu ayam 200ml', 'Daun bawang 5g', 'Kecap manis 5ml', 'Bawang goreng 5g'],
    instructions: 'Masak beras dengan kaldu hingga menjadi bubur. Tambahkan ayam suwir, daun bawang, kecap, dan bawang goreng sebagai topping.',
    calories: 280, protein: 15, carbs: 40, fat: 6,
  },
  {
    id: 'nasi-tim-ayam',
    mealType: 'sarapan',
    foodName: 'Nasi Tim Ayam Wortel',
    ingredients: ['Beras 60g', 'Ayam cincang 40g', 'Wortel parut 30g', 'Bawang putih 3g', 'Kecap manis 5ml', 'Minyak wijen 3ml'],
    instructions: 'Tim beras bersama ayam cincang, wortel parut, dan bumbu hingga matang sempurna dan lembut.',
    calories: 320, protein: 18, carbs: 45, fat: 7,
  },
  {
    id: 'roti-telur',
    mealType: 'sarapan',
    foodName: 'Roti Panggang Telur & Susu',
    ingredients: ['Roti tawar gandum 2 lembar', 'Telur ayam 1 butir', 'Mentega 5g', 'Susu UHT 200ml'],
    instructions: 'Panggang roti dengan mentega, goreng telur mata sapi. Sajikan dengan segelas susu.',
    calories: 350, protein: 16, carbs: 38, fat: 14,
  },
  {
    id: 'oatmeal-pisang',
    mealType: 'sarapan',
    foodName: 'Oatmeal Pisang Madu',
    ingredients: ['Oatmeal 40g', 'Pisang 1 buah', 'Madu 10ml', 'Susu cair 150ml'],
    instructions: 'Masak oatmeal dengan susu. Potong pisang sebagai topping dan tambahkan madu.',
    calories: 310, protein: 10, carbs: 55, fat: 6,
  },
  {
    id: 'lontong-sayur',
    mealType: 'sarapan',
    foodName: 'Lontong Sayur Labu',
    ingredients: ['Lontong 100g', 'Labu siam 50g', 'Santan encer 100ml', 'Tempe 30g', 'Daun salam 1 lembar', 'Bumbu kuning halus 10g'],
    instructions: 'Rebus labu dan tempe dalam santan berbumbu. Sajikan dengan lontong.',
    calories: 340, protein: 12, carbs: 48, fat: 11,
  },
  {
    id: 'mie-telur-sayur',
    mealType: 'sarapan',
    foodName: 'Mie Telur Sayuran',
    ingredients: ['Mie telur 80g', 'Telur 1 butir', 'Sawi hijau 30g', 'Wortel 20g', 'Bawang putih 3g', 'Kecap asin 5ml'],
    instructions: 'Rebus mie. Tumis sayuran dan telur orak-arik dengan bumbu. Campurkan semua.',
    calories: 330, protein: 14, carbs: 46, fat: 9,
  },

  // ============ MAKAN SIANG (Lunch) ============
  {
    id: 'nasi-ayam-bayam',
    mealType: 'makan_siang',
    foodName: 'Nasi Ayam Panggang & Bayam',
    ingredients: ['Nasi putih 100g', 'Ayam panggang 60g', 'Bayam rebus 50g', 'Tempe goreng 30g', 'Sambal tomat 10g'],
    instructions: 'Panggang ayam yang sudah dibumbui. Rebus bayam. Goreng tempe. Sajikan bersama nasi.',
    calories: 450, protein: 28, carbs: 50, fat: 14,
  },
  {
    id: 'sup-ikan',
    mealType: 'makan_siang',
    foodName: 'Sup Ikan Makarel Sayuran',
    ingredients: ['Nasi putih 100g', 'Ikan makarel 60g', 'Kentang 50g', 'Wortel 30g', 'Tomat 30g', 'Seledri 5g', 'Bawang bombay 15g'],
    instructions: 'Rebus ikan dengan sayuran dan bumbu hingga matang. Sajikan dengan nasi putih hangat.',
    calories: 420, protein: 25, carbs: 55, fat: 10,
  },
  {
    id: 'nasi-telur-tahu',
    mealType: 'makan_siang',
    foodName: 'Nasi Telur Dadar & Tahu',
    ingredients: ['Nasi putih 100g', 'Telur 2 butir', 'Tahu goreng 50g', 'Kangkung tumis 50g', 'Bawang merah 10g', 'Bawang putih 5g'],
    instructions: 'Buat telur dadar tebal. Goreng tahu. Tumis kangkung. Sajikan dengan nasi.',
    calories: 430, protein: 22, carbs: 48, fat: 16,
  },
  {
    id: 'nasi-soto-ayam',
    mealType: 'makan_siang',
    foodName: 'Soto Ayam dengan Nasi',
    ingredients: ['Nasi putih 100g', 'Ayam suwir 50g', 'Soun 20g', 'Tauge 20g', 'Kentang 30g', 'Seledri 5g', 'Kunyit 3g', 'Jahe 3g'],
    instructions: 'Rebus ayam dengan bumbu kuning. Suwir ayam. Sajikan kuah dengan pelengkap dan nasi.',
    calories: 400, protein: 24, carbs: 52, fat: 10,
  },
  {
    id: 'nasi-pepes-ikan',
    mealType: 'makan_siang',
    foodName: 'Nasi Pepes Ikan Mas',
    ingredients: ['Nasi putih 100g', 'Ikan mas 80g', 'Kemangi 10g', 'Daun pisang 1 lembar', 'Cabai rawit 2 buah', 'Bumbu kuning halus 15g'],
    instructions: 'Lumuri ikan dengan bumbu dan kemangi, bungkus daun pisang, kukus 30 menit. Sajikan dengan nasi.',
    calories: 410, protein: 30, carbs: 45, fat: 11,
  },
  {
    id: 'nasi-semur-tahu-tempe',
    mealType: 'makan_siang',
    foodName: 'Nasi Semur Tahu Tempe',
    ingredients: ['Nasi putih 100g', 'Tahu 60g', 'Tempe 40g', 'Kecap manis 15ml', 'Bawang merah 10g', 'Bawang putih 5g', 'Pala bubuk 1g'],
    instructions: 'Goreng tahu dan tempe, masak dalam bumbu semur kecap hingga meresap. Sajikan dengan nasi.',
    calories: 420, protein: 20, carbs: 52, fat: 13,
  },

  // ============ MAKAN MALAM (Dinner) ============
  {
    id: 'nasi-sup-ayam',
    mealType: 'makan_malam',
    foodName: 'Sup Ayam Bening & Nasi',
    ingredients: ['Nasi putih 80g', 'Ayam 50g', 'Kentang 40g', 'Wortel 30g', 'Buncis 20g', 'Seledri 5g', 'Bawang putih 3g'],
    instructions: 'Rebus ayam dan sayuran dengan bumbu bening hingga matang. Sajikan dengan nasi.',
    calories: 350, protein: 22, carbs: 42, fat: 8,
  },
  {
    id: 'nasi-ikan-goreng',
    mealType: 'makan_malam',
    foodName: 'Nasi Ikan Goreng & Lalapan',
    ingredients: ['Nasi putih 80g', 'Ikan bandeng 70g', 'Labu siam rebus 40g', 'Tomat 30g', 'Sambal terasi 10g'],
    instructions: 'Goreng ikan bandeng yang sudah dilumuri garam dan kunyit. Sajikan dengan nasi dan lalapan.',
    calories: 380, protein: 26, carbs: 40, fat: 12,
  },
  {
    id: 'bubur-kacang-hijau',
    mealType: 'makan_malam',
    foodName: 'Bubur Kacang Hijau Santan',
    ingredients: ['Kacang hijau 50g', 'Santan 100ml', 'Gula merah 20g', 'Daun pandan 1 lembar', 'Garam sedikit'],
    instructions: 'Rendam kacang hijau 2 jam, rebus hingga empuk. Tambahkan santan, gula merah, dan pandan.',
    calories: 300, protein: 12, carbs: 48, fat: 8,
  },
  {
    id: 'nasi-perkedel-sayur',
    mealType: 'makan_malam',
    foodName: 'Nasi Perkedel Kentang & Sayur Bening',
    ingredients: ['Nasi putih 80g', 'Kentang 80g', 'Telur 1 butir', 'Bayam 30g', 'Jagung manis 30g', 'Bawang merah 10g'],
    instructions: 'Haluskan kentang, campur telur, bentuk bulatan, goreng. Buat sayur bening bayam jagung.',
    calories: 360, protein: 14, carbs: 48, fat: 12,
  },
  {
    id: 'nasi-ayam-kecap',
    mealType: 'makan_malam',
    foodName: 'Ayam Kecap Manis & Nasi',
    ingredients: ['Nasi putih 80g', 'Ayam 60g', 'Kecap manis 15ml', 'Bawang merah 10g', 'Bawang putih 5g', 'Jahe 3g', 'Tomat 20g'],
    instructions: 'Tumis bumbu, masukkan ayam, tambahkan kecap manis dan tomat. Masak hingga bumbu meresap.',
    calories: 390, protein: 25, carbs: 44, fat: 11,
  },
  {
    id: 'nasi-capcay',
    mealType: 'makan_malam',
    foodName: 'Nasi Capcay Sayuran',
    ingredients: ['Nasi putih 80g', 'Wortel 30g', 'Kembang kol 30g', 'Sawi putih 30g', 'Bakso ikan 30g', 'Bawang putih 5g', 'Maizena 5g'],
    instructions: 'Tumis bawang putih, masukkan sayuran dan bakso, tambahkan air dan maizena untuk saus kental.',
    calories: 340, protein: 15, carbs: 48, fat: 8,
  },

  // ============ CAMILAN (Snacks) ============
  {
    id: 'pisang-goreng',
    mealType: 'camilan',
    foodName: 'Pisang Goreng Kipas',
    ingredients: ['Pisang raja 2 buah', 'Tepung terigu 30g', 'Gula pasir 10g', 'Minyak goreng 15ml'],
    instructions: 'Belah pisang kipas, celupkan dalam adonan tepung, goreng hingga keemasan.',
    calories: 180, protein: 3, carbs: 30, fat: 6,
  },
  {
    id: 'puding-susu',
    mealType: 'camilan',
    foodName: 'Puding Susu Buah',
    ingredients: ['Susu UHT 200ml', 'Agar-agar bubuk 3g', 'Gula pasir 20g', 'Buah potong (mangga/stroberi) 50g'],
    instructions: 'Masak susu dengan agar dan gula hingga mendidih. Tuang ke cetakan, tambahkan buah, dinginkan.',
    calories: 160, protein: 7, carbs: 26, fat: 4,
  },
  {
    id: 'ubi-rebus',
    mealType: 'camilan',
    foodName: 'Ubi Jalar Rebus Madu',
    ingredients: ['Ubi jalar 100g', 'Madu 10ml'],
    instructions: 'Cuci ubi, kukus atau rebus hingga empuk. Sajikan dengan madu.',
    calories: 140, protein: 2, carbs: 32, fat: 0.5,
  },
  {
    id: 'smoothie-buah',
    mealType: 'camilan',
    foodName: 'Smoothie Pisang Alpukat',
    ingredients: ['Pisang 1 buah', 'Alpukat 50g', 'Susu cair 150ml', 'Madu 10ml'],
    instructions: 'Blender semua bahan hingga halus. Sajikan dingin.',
    calories: 220, protein: 6, carbs: 32, fat: 9,
  },
  {
    id: 'roti-selai-kacang',
    mealType: 'camilan',
    foodName: 'Roti Isi Selai Kacang',
    ingredients: ['Roti tawar gandum 1 lembar', 'Selai kacang 15g', 'Pisang iris 30g'],
    instructions: 'Olesi roti dengan selai kacang, tata irisan pisang di atasnya, lipat.',
    calories: 200, protein: 7, carbs: 28, fat: 8,
  },
  {
    id: 'tahu-isi-sayur',
    mealType: 'camilan',
    foodName: 'Tahu Isi Sayuran',
    ingredients: ['Tahu putih 100g', 'Wortel parut 20g', 'Tauge 15g', 'Daun bawang 5g', 'Tepung terigu 20g'],
    instructions: 'Potong tahu segitiga, isi dengan sayuran, celup tepung, goreng.',
    calories: 170, protein: 10, carbs: 18, fat: 7,
  },
  {
    id: 'kue-nagasari',
    mealType: 'camilan',
    foodName: 'Nagasari Pisang',
    ingredients: ['Tepung beras 50g', 'Santan 100ml', 'Gula pasir 15g', 'Pisang 1 buah', 'Daun pisang 2 lembar'],
    instructions: 'Masak tepung beras dengan santan dan gula. Bungkus adonan dan pisang dalam daun pisang, kukus 20 menit.',
    calories: 190, protein: 4, carbs: 35, fat: 5,
  },
];

/**
 * Generate a daily meal plan matching a target calorie range.
 *
 * @param {number} targetCalories - Total daily calorie target
 * @param {string} status - Nutrition status (affects distribution)
 * @returns {Array} Array of meal plan items
 */
export function generateDailyMenu(targetCalories, status = 'Normal') {
  // Calorie distribution by meal type
  let distribution;
  if (status === 'Kurang Gizi' || status === 'Gizi Buruk') {
    // Higher calorie density, extra snack
    distribution = { sarapan: 0.25, makan_siang: 0.30, makan_malam: 0.25, camilan: 0.20 };
  } else if (status === 'Obesitas' || status === 'Risiko Obesitas' || status === 'Berat Badan Lebih') {
    // Controlled portions
    distribution = { sarapan: 0.25, makan_siang: 0.35, makan_malam: 0.25, camilan: 0.15 };
  } else {
    distribution = { sarapan: 0.25, makan_siang: 0.30, makan_malam: 0.25, camilan: 0.20 };
  }

  const mealTypes = ['sarapan', 'makan_siang', 'makan_malam', 'camilan'];
  const plan = [];

  for (const mealType of mealTypes) {
    const targetForMeal = targetCalories * distribution[mealType];
    const options = FOOD_DATABASE.filter(f => f.mealType === mealType);

    // Find the food closest to target calories for this meal
    let bestMatch = options[0];
    let bestDiff = Math.abs(options[0].calories - targetForMeal);

    for (const food of options) {
      const diff = Math.abs(food.calories - targetForMeal);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestMatch = food;
      }
    }

    // Calculate portion scaling factor
    const scaleFactor = targetForMeal / bestMatch.calories;
    const clampedScale = Math.max(0.5, Math.min(2.0, scaleFactor));

    plan.push({
      mealType,
      mealTypeLabel: getMealTypeLabel(mealType),
      foodName: bestMatch.foodName,
      ingredients: bestMatch.ingredients,
      instructions: bestMatch.instructions,
      totalCalories: Math.round(bestMatch.calories * clampedScale),
      protein: Math.round(bestMatch.protein * clampedScale * 10) / 10,
      carbs: Math.round(bestMatch.carbs * clampedScale * 10) / 10,
      fat: Math.round(bestMatch.fat * clampedScale * 10) / 10,
      portionNote: clampedScale > 1.15
        ? `Tambahkan porsi ~${Math.round((clampedScale - 1) * 100)}% lebih banyak`
        : clampedScale < 0.85
          ? `Kurangi porsi ~${Math.round((1 - clampedScale) * 100)}%`
          : 'Porsi standar',
    });
  }

  return plan;
}

/**
 * Generate a randomized meal plan (for "refresh" functionality).
 */
export function generateRandomMenu(targetCalories, status = 'Normal') {
  const distribution = { sarapan: 0.25, makan_siang: 0.30, makan_malam: 0.25, camilan: 0.20 };
  const mealTypes = ['sarapan', 'makan_siang', 'makan_malam', 'camilan'];
  const plan = [];

  for (const mealType of mealTypes) {
    const targetForMeal = targetCalories * distribution[mealType];
    const options = FOOD_DATABASE.filter(f => f.mealType === mealType);

    // Pick a random food
    const randomIndex = Math.floor(Math.random() * options.length);
    const food = options[randomIndex];

    const scaleFactor = targetForMeal / food.calories;
    const clampedScale = Math.max(0.5, Math.min(2.0, scaleFactor));

    plan.push({
      mealType,
      mealTypeLabel: getMealTypeLabel(mealType),
      foodName: food.foodName,
      ingredients: food.ingredients,
      instructions: food.instructions,
      totalCalories: Math.round(food.calories * clampedScale),
      protein: Math.round(food.protein * clampedScale * 10) / 10,
      carbs: Math.round(food.carbs * clampedScale * 10) / 10,
      fat: Math.round(food.fat * clampedScale * 10) / 10,
      portionNote: clampedScale > 1.15
        ? `Tambahkan porsi ~${Math.round((clampedScale - 1) * 100)}% lebih banyak`
        : clampedScale < 0.85
          ? `Kurangi porsi ~${Math.round((1 - clampedScale) * 100)}%`
          : 'Porsi standar',
    });
  }

  return plan;
}

function getMealTypeLabel(type) {
  const labels = {
    sarapan: 'Sarapan',
    makan_siang: 'Makan Siang',
    makan_malam: 'Makan Malam',
    camilan: 'Camilan',
  };
  return labels[type] || type;
}

export { FOOD_DATABASE };
