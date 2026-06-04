/**
 * WHO Growth Reference Tables (simplified LMS parameters)
 * Based on WHO Child Growth Standards (2006, 0-5 years) and
 * WHO Growth Reference (2007, 5-19 years).
 *
 * Each entry: { ageMonths, L, M, S }
 * L = Box-Cox power, M = Median, S = Coefficient of variation
 * Z-score = ((value/M)^L - 1) / (L * S)   when L ≠ 0
 *
 * Tables cover 0–120 months (0–10 years) for both sexes.
 * This is a representative subset; production would use full WHO tables.
 */

// Weight-for-Age (kg) — Boys
export const weightForAgeBoys = [
  { ageMonths: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { ageMonths: 1, L: 0.2297, M: 4.4709, S: 0.13395 },
  { ageMonths: 2, L: 0.197, M: 5.5675, S: 0.12385 },
  { ageMonths: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { ageMonths: 4, L: 0.1553, M: 7.0023, S: 0.11316 },
  { ageMonths: 5, L: 0.1395, M: 7.5105, S: 0.1108 },
  { ageMonths: 6, L: 0.1257, M: 7.934, S: 0.10958 },
  { ageMonths: 9, L: 0.0956, M: 8.9014, S: 0.10891 },
  { ageMonths: 12, L: 0.0764, M: 9.6479, S: 0.11081 },
  { ageMonths: 15, L: 0.0632, M: 10.3089, S: 0.11307 },
  { ageMonths: 18, L: 0.053, M: 10.9462, S: 0.11507 },
  { ageMonths: 24, L: 0.0379, M: 12.1515, S: 0.11834 },
  { ageMonths: 30, L: 0.0263, M: 13.3, S: 0.12031 },
  { ageMonths: 36, L: 0.017, M: 14.3, S: 0.12156 },
  { ageMonths: 42, L: 0.0093, M: 15.3, S: 0.12253 },
  { ageMonths: 48, L: 0.003, M: 16.3, S: 0.12337 },
  { ageMonths: 54, L: -0.002, M: 17.3, S: 0.12419 },
  { ageMonths: 60, L: -0.007, M: 18.3, S: 0.12506 },
  { ageMonths: 72, L: -0.015, M: 20.5, S: 0.12854 },
  { ageMonths: 84, L: -0.02, M: 22.9, S: 0.13246 },
  { ageMonths: 96, L: -0.024, M: 25.5, S: 0.13673 },
  { ageMonths: 108, L: -0.026, M: 28.5, S: 0.14132 },
  { ageMonths: 120, L: -0.027, M: 31.9, S: 0.14618 },
];

// Weight-for-Age (kg) — Girls
export const weightForAgeGirls = [
  { ageMonths: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { ageMonths: 1, L: 0.1714, M: 4.1873, S: 0.13724 },
  { ageMonths: 2, L: 0.0962, M: 5.1282, S: 0.12955 },
  { ageMonths: 3, L: 0.0402, M: 5.8458, S: 0.12424 },
  { ageMonths: 4, L: -0.005, M: 6.4237, S: 0.12065 },
  { ageMonths: 5, L: -0.043, M: 6.8985, S: 0.11835 },
  { ageMonths: 6, L: -0.068, M: 7.297, S: 0.11696 },
  { ageMonths: 9, L: -0.113, M: 8.2, S: 0.11623 },
  { ageMonths: 12, L: -0.13, M: 8.95, S: 0.11727 },
  { ageMonths: 15, L: -0.133, M: 9.61, S: 0.11903 },
  { ageMonths: 18, L: -0.129, M: 10.26, S: 0.12092 },
  { ageMonths: 24, L: -0.113, M: 11.5, S: 0.12383 },
  { ageMonths: 30, L: -0.098, M: 12.66, S: 0.12568 },
  { ageMonths: 36, L: -0.085, M: 13.9, S: 0.12709 },
  { ageMonths: 42, L: -0.073, M: 15.0, S: 0.12838 },
  { ageMonths: 48, L: -0.063, M: 16.1, S: 0.12975 },
  { ageMonths: 54, L: -0.054, M: 17.2, S: 0.13123 },
  { ageMonths: 60, L: -0.046, M: 18.2, S: 0.13289 },
  { ageMonths: 72, L: -0.033, M: 20.6, S: 0.13741 },
  { ageMonths: 84, L: -0.024, M: 23.3, S: 0.14281 },
  { ageMonths: 96, L: -0.018, M: 26.3, S: 0.14879 },
  { ageMonths: 108, L: -0.014, M: 29.7, S: 0.15513 },
  { ageMonths: 120, L: -0.011, M: 33.5, S: 0.16162 },
];

// Height/Length-for-Age (cm) — Boys
export const heightForAgeBoys = [
  { ageMonths: 0, L: 1, M: 49.8842, S: 0.03795 },
  { ageMonths: 1, L: 1, M: 54.7244, S: 0.03557 },
  { ageMonths: 2, L: 1, M: 58.4249, S: 0.03424 },
  { ageMonths: 3, L: 1, M: 61.4292, S: 0.03328 },
  { ageMonths: 4, L: 1, M: 63.886, S: 0.03257 },
  { ageMonths: 5, L: 1, M: 65.9026, S: 0.03204 },
  { ageMonths: 6, L: 1, M: 67.6236, S: 0.03165 },
  { ageMonths: 9, L: 1, M: 72.0, S: 0.03117 },
  { ageMonths: 12, L: 1, M: 75.7499, S: 0.03099 },
  { ageMonths: 15, L: 1, M: 79.2, S: 0.031 },
  { ageMonths: 18, L: 1, M: 82.3, S: 0.031 },
  { ageMonths: 24, L: 1, M: 87.8, S: 0.031 },
  { ageMonths: 30, L: 1, M: 92.4, S: 0.0315 },
  { ageMonths: 36, L: 1, M: 96.1, S: 0.032 },
  { ageMonths: 42, L: 1, M: 99.9, S: 0.033 },
  { ageMonths: 48, L: 1, M: 103.3, S: 0.034 },
  { ageMonths: 54, L: 1, M: 106.7, S: 0.034 },
  { ageMonths: 60, L: 1, M: 110.0, S: 0.035 },
  { ageMonths: 72, L: 1, M: 116.0, S: 0.036 },
  { ageMonths: 84, L: 1, M: 121.7, S: 0.037 },
  { ageMonths: 96, L: 1, M: 127.3, S: 0.038 },
  { ageMonths: 108, L: 1, M: 132.6, S: 0.039 },
  { ageMonths: 120, L: 1, M: 137.8, S: 0.04 },
];

// Height/Length-for-Age (cm) — Girls
export const heightForAgeGirls = [
  { ageMonths: 0, L: 1, M: 49.1477, S: 0.0379 },
  { ageMonths: 1, L: 1, M: 53.6872, S: 0.0364 },
  { ageMonths: 2, L: 1, M: 57.0673, S: 0.03568 },
  { ageMonths: 3, L: 1, M: 59.8029, S: 0.03523 },
  { ageMonths: 4, L: 1, M: 62.0899, S: 0.03486 },
  { ageMonths: 5, L: 1, M: 64.0301, S: 0.03462 },
  { ageMonths: 6, L: 1, M: 65.7311, S: 0.03448 },
  { ageMonths: 9, L: 1, M: 70.1, S: 0.03444 },
  { ageMonths: 12, L: 1, M: 74.0, S: 0.03464 },
  { ageMonths: 15, L: 1, M: 77.5, S: 0.035 },
  { ageMonths: 18, L: 1, M: 80.7, S: 0.035 },
  { ageMonths: 24, L: 1, M: 86.4, S: 0.035 },
  { ageMonths: 30, L: 1, M: 91.2, S: 0.036 },
  { ageMonths: 36, L: 1, M: 95.1, S: 0.036 },
  { ageMonths: 42, L: 1, M: 98.9, S: 0.037 },
  { ageMonths: 48, L: 1, M: 102.7, S: 0.037 },
  { ageMonths: 54, L: 1, M: 106.2, S: 0.038 },
  { ageMonths: 60, L: 1, M: 109.4, S: 0.038 },
  { ageMonths: 72, L: 1, M: 115.1, S: 0.039 },
  { ageMonths: 84, L: 1, M: 120.8, S: 0.04 },
  { ageMonths: 96, L: 1, M: 126.6, S: 0.041 },
  { ageMonths: 108, L: 1, M: 132.2, S: 0.042 },
  { ageMonths: 120, L: 1, M: 138.0, S: 0.043 },
];

// BMI-for-Age — Boys (BMI = kg/m²)
export const bmiForAgeBoys = [
  { ageMonths: 0, L: 0.3487, M: 13.4, S: 0.092 },
  { ageMonths: 1, L: 0.23, M: 14.9, S: 0.085 },
  { ageMonths: 2, L: 0.20, M: 16.3, S: 0.082 },
  { ageMonths: 3, L: 0.17, M: 16.9, S: 0.08 },
  { ageMonths: 4, L: 0.16, M: 17.2, S: 0.079 },
  { ageMonths: 5, L: 0.14, M: 17.3, S: 0.078 },
  { ageMonths: 6, L: 0.13, M: 17.3, S: 0.078 },
  { ageMonths: 9, L: 0.10, M: 17.2, S: 0.078 },
  { ageMonths: 12, L: 0.08, M: 16.9, S: 0.079 },
  { ageMonths: 15, L: 0.06, M: 16.5, S: 0.079 },
  { ageMonths: 18, L: 0.05, M: 16.2, S: 0.08 },
  { ageMonths: 24, L: 0.04, M: 15.7, S: 0.081 },
  { ageMonths: 36, L: 0.02, M: 15.5, S: 0.082 },
  { ageMonths: 48, L: 0.003, M: 15.3, S: 0.084 },
  { ageMonths: 60, L: -0.007, M: 15.3, S: 0.087 },
  { ageMonths: 72, L: -0.015, M: 15.3, S: 0.092 },
  { ageMonths: 84, L: -0.02, M: 15.5, S: 0.098 },
  { ageMonths: 96, L: -0.024, M: 15.7, S: 0.104 },
  { ageMonths: 108, L: -0.026, M: 16.2, S: 0.111 },
  { ageMonths: 120, L: -0.027, M: 16.7, S: 0.118 },
];

// BMI-for-Age — Girls (BMI = kg/m²)
export const bmiForAgeGirls = [
  { ageMonths: 0, L: 0.38, M: 13.3, S: 0.091 },
  { ageMonths: 1, L: 0.17, M: 14.6, S: 0.087 },
  { ageMonths: 2, L: 0.10, M: 15.8, S: 0.084 },
  { ageMonths: 3, L: 0.04, M: 16.4, S: 0.082 },
  { ageMonths: 4, L: -0.005, M: 16.7, S: 0.081 },
  { ageMonths: 5, L: -0.043, M: 16.8, S: 0.081 },
  { ageMonths: 6, L: -0.068, M: 16.9, S: 0.08 },
  { ageMonths: 9, L: -0.11, M: 16.7, S: 0.08 },
  { ageMonths: 12, L: -0.13, M: 16.4, S: 0.081 },
  { ageMonths: 15, L: -0.13, M: 16.0, S: 0.081 },
  { ageMonths: 18, L: -0.13, M: 15.7, S: 0.082 },
  { ageMonths: 24, L: -0.11, M: 15.4, S: 0.083 },
  { ageMonths: 36, L: -0.085, M: 15.3, S: 0.083 },
  { ageMonths: 48, L: -0.063, M: 15.2, S: 0.085 },
  { ageMonths: 60, L: -0.046, M: 15.2, S: 0.089 },
  { ageMonths: 72, L: -0.033, M: 15.3, S: 0.095 },
  { ageMonths: 84, L: -0.024, M: 15.5, S: 0.101 },
  { ageMonths: 96, L: -0.018, M: 15.9, S: 0.108 },
  { ageMonths: 108, L: -0.014, M: 16.4, S: 0.116 },
  { ageMonths: 120, L: -0.011, M: 17.0, S: 0.124 },
];

/**
 * Interpolate LMS values for an exact age in months.
 * Finds the two closest data points and linearly interpolates.
 */
export function interpolateLMS(table, ageMonths) {
  // Clamp to table range
  if (ageMonths <= table[0].ageMonths) return table[0];
  if (ageMonths >= table[table.length - 1].ageMonths) return table[table.length - 1];

  // Find bracketing entries
  let lower = table[0];
  let upper = table[table.length - 1];
  for (let i = 0; i < table.length - 1; i++) {
    if (table[i].ageMonths <= ageMonths && table[i + 1].ageMonths >= ageMonths) {
      lower = table[i];
      upper = table[i + 1];
      break;
    }
  }

  if (lower.ageMonths === upper.ageMonths) return lower;

  const fraction = (ageMonths - lower.ageMonths) / (upper.ageMonths - lower.ageMonths);
  return {
    ageMonths,
    L: lower.L + fraction * (upper.L - lower.L),
    M: lower.M + fraction * (upper.M - lower.M),
    S: lower.S + fraction * (upper.S - lower.S),
  };
}
