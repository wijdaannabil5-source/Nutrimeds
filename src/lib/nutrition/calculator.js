import {
  weightForAgeBoys, weightForAgeGirls,
  heightForAgeBoys, heightForAgeGirls,
  bmiForAgeBoys, bmiForAgeGirls,
  interpolateLMS,
} from './who-tables.js';

/**
 * Calculate Z-score using the WHO LMS method.
 * Formula: Z = ((value/M)^L - 1) / (L * S)  when L ≠ 0
 *          Z = ln(value/M) / S                when L = 0
 */
function calculateZScore(value, L, M, S) {
  if (Math.abs(L) < 0.001) {
    return Math.log(value / M) / S;
  }
  return (Math.pow(value / M, L) - 1) / (L * S);
}

/**
 * Classify a Z-score into a human-readable status.
 */
function classifyZScore(zScore, type) {
  if (type === 'wfa') {
    // Weight-for-Age
    if (zScore < -3) return 'Gizi Buruk';
    if (zScore < -2) return 'Kurang Gizi';
    if (zScore > 2) return 'Berat Badan Lebih';
    return 'Normal';
  }
  if (type === 'hfa') {
    // Height-for-Age
    if (zScore < -3) return 'Sangat Pendek (Stunting Berat)';
    if (zScore < -2) return 'Pendek (Stunting)';
    if (zScore > 2) return 'Tinggi';
    return 'Normal';
  }
  if (type === 'bfa') {
    // BMI-for-Age
    if (zScore < -3) return 'Gizi Buruk (Sangat Kurus)';
    if (zScore < -2) return 'Kurus';
    if (zScore > 2) return 'Gemuk';
    if (zScore > 3) return 'Obesitas';
    return 'Normal';
  }
  return 'Normal';
}

/**
 * Determine the overall nutrition status based on all Z-scores.
 */
function determineOverallStatus(wfaZ, hfaZ, bfaZ) {
  // Priority-based classification
  if (bfaZ > 3) return 'Obesitas';
  if (bfaZ > 2) return 'Risiko Obesitas';
  if (wfaZ < -3 || bfaZ < -3) return 'Gizi Buruk';
  if (hfaZ < -2) return 'Risiko Stunting';
  if (wfaZ < -2 || bfaZ < -2) return 'Kurang Gizi';
  if (wfaZ > 2) return 'Berat Badan Lebih';
  return 'Normal';
}

/**
 * Calculate the age in months from a date of birth.
 */
export function calculateAgeMonths(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  // Adjust if day hasn't been reached yet
  if (now.getDate() < dob.getDate()) {
    return Math.max(0, months - 1);
  }
  return Math.max(0, months);
}

/**
 * Main nutrition calculation function.
 *
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} ageMonths - Age in months
 * @param {string} gender - 'male' | 'female'
 * @returns {object} Full nutrition status result
 */
export function calculateNutritionStatus(weight, height, ageMonths, gender) {
  const isMale = gender === 'male';

  // Select tables based on gender
  const wfaTable = isMale ? weightForAgeBoys : weightForAgeGirls;
  const hfaTable = isMale ? heightForAgeBoys : heightForAgeGirls;
  const bfaTable = isMale ? bmiForAgeBoys : bmiForAgeGirls;

  // Get interpolated LMS values
  const wfaLMS = interpolateLMS(wfaTable, ageMonths);
  const hfaLMS = interpolateLMS(hfaTable, ageMonths);
  const bfaLMS = interpolateLMS(bfaTable, ageMonths);

  // Calculate BMI
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  // Calculate Z-scores
  const wfaZ = calculateZScore(weight, wfaLMS.L, wfaLMS.M, wfaLMS.S);
  const hfaZ = calculateZScore(height, hfaLMS.L, hfaLMS.M, hfaLMS.S);
  const bfaZ = calculateZScore(bmi, bfaLMS.L, bfaLMS.M, bfaLMS.S);

  // Round Z-scores to 2 decimal places
  const roundedWFA = Math.round(wfaZ * 100) / 100;
  const roundedHFA = Math.round(hfaZ * 100) / 100;
  const roundedBFA = Math.round(bfaZ * 100) / 100;

  // Overall status
  const overallStatus = determineOverallStatus(roundedWFA, roundedHFA, roundedBFA);

  // Calculate daily calorie needs (RDA/AKG)
  const recommendedCalories = calculateDailyCalories(weight, height, ageMonths, gender);
  const macroTargets = calculateMacroTargets(recommendedCalories, ageMonths);

  return {
    bmi: Math.round(bmi * 10) / 10,
    zScores: {
      weightForAge: {
        value: roundedWFA,
        classification: classifyZScore(roundedWFA, 'wfa'),
      },
      heightForAge: {
        value: roundedHFA,
        classification: classifyZScore(roundedHFA, 'hfa'),
      },
      bmiForAge: {
        value: roundedBFA,
        classification: classifyZScore(roundedBFA, 'bfa'),
      },
    },
    overallStatus,
    recommendedCalories,
    macroTargets,
    interpretation: getInterpretation(overallStatus),
  };
}

/**
 * Calculate daily calorie needs based on WHO/AKG recommendations.
 * Uses simplified RDA formulas by age group.
 */
export function calculateDailyCalories(weight, height, ageMonths, gender) {
  // Basal Metabolic Rate estimation for children (Schofield equations)
  let bmr;

  if (ageMonths < 36) {
    // 0-3 years
    bmr = gender === 'male'
      ? 60.9 * weight - 54
      : 61.0 * weight - 51;
  } else if (ageMonths < 120) {
    // 3-10 years
    bmr = gender === 'male'
      ? 22.7 * weight + 495
      : 22.5 * weight + 499;
  } else {
    // 10+ years
    bmr = gender === 'male'
      ? 17.5 * weight + 651
      : 12.2 * weight + 746;
  }

  // Physical Activity Level (moderate for children)
  const pal = ageMonths < 12 ? 1.2 : ageMonths < 36 ? 1.35 : 1.55;

  // Total daily energy expenditure
  let tdee = Math.round(bmr * pal);

  // AKG Indonesia reference ranges (simplified)
  const akgMin = {
    6: 550, 12: 725, 36: 1125, 48: 1200, 60: 1350,
    72: 1400, 84: 1550, 96: 1650, 108: 1750, 120: 1850,
  };

  // Find the closest AKG reference and use the higher of TDEE or AKG minimum
  const akgKeys = Object.keys(akgMin).map(Number).sort((a, b) => a - b);
  let closestKey = akgKeys[0];
  for (const key of akgKeys) {
    if (key <= ageMonths) closestKey = key;
  }
  const minCalories = akgMin[closestKey] || 550;

  return Math.max(tdee, minCalories);
}

/**
 * Calculate macro nutrient targets from calorie needs.
 */
export function calculateMacroTargets(calories, ageMonths) {
  // WHO recommended macro distribution for children
  let proteinPct, carbsPct, fatPct;

  if (ageMonths < 12) {
    proteinPct = 0.10; carbsPct = 0.45; fatPct = 0.45;
  } else if (ageMonths < 36) {
    proteinPct = 0.12; carbsPct = 0.50; fatPct = 0.38;
  } else {
    proteinPct = 0.15; carbsPct = 0.55; fatPct = 0.30;
  }

  return {
    protein: Math.round((calories * proteinPct) / 4), // 4 kcal/g
    carbs: Math.round((calories * carbsPct) / 4),      // 4 kcal/g
    fat: Math.round((calories * fatPct) / 9),           // 9 kcal/g
  };
}

/**
 * Get a human-readable interpretation message.
 */
function getInterpretation(status) {
  const messages = {
    'Normal': 'Status gizi anak Anda normal. Pertahankan pola makan bergizi seimbang dan pantau secara rutin setiap bulan.',
    'Kurang Gizi': 'Anak Anda menunjukkan tanda kurang gizi. Tingkatkan asupan kalori dan protein. Konsultasikan dengan dokter atau ahli gizi.',
    'Gizi Buruk': 'Anak Anda berada dalam kategori gizi buruk. Segera konsultasikan ke dokter anak atau puskesmas terdekat untuk penanganan medis.',
    'Risiko Stunting': 'Anak Anda berisiko mengalami stunting (perawakan pendek). Perhatikan asupan protein, kalsium, dan zat besi. Konsultasikan dengan dokter.',
    'Risiko Obesitas': 'Anak Anda menunjukkan tanda berat badan berlebih. Sesuaikan porsi makan dan tingkatkan aktivitas fisik.',
    'Obesitas': 'Anak Anda berada dalam kategori obesitas. Segera konsultasikan dengan dokter untuk program diet dan aktivitas fisik yang tepat.',
    'Berat Badan Lebih': 'Berat badan anak Anda di atas rata-rata. Perhatikan porsi makan dan tingkatkan aktivitas fisik.',
  };
  return messages[status] || messages['Normal'];
}
