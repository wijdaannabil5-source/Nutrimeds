import { db } from './src/lib/db/index.js';
import { users, children, measurements, activityLogs } from './src/lib/db/schema.js';
import { calculateNutritionStatus, calculateAgeMonths } from './src/lib/nutrition/calculator.js';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

const childrenData = [
  { no: 1, name: 'M. Fatih', dateOfBirth: '2024-07-07', weight: 9.0, height: 81.3, gender: 'male' },
  { no: 2, name: 'M. Ali H', dateOfBirth: '2025-03-05', weight: 8.0, height: 72.0, gender: 'male' },
  { no: 3, name: 'M. Zayn Hanan A', dateOfBirth: '2025-11-08', weight: 6.8, height: 65.0, gender: 'male' },
  { no: 4, name: 'Aiswa', dateOfBirth: '2024-06-17', weight: 9.0, height: 81.0, gender: 'female' },
  { no: 5, name: 'Qayla Alesha', dateOfBirth: '2023-09-18', weight: 10.3, height: 83.0, gender: 'female' },
  { no: 6, name: 'Nashya Azra', dateOfBirth: '2023-08-10', weight: 9.0, height: 86.3, gender: 'female' },
  { no: 7, name: 'M. Kiara Awal', dateOfBirth: '2026-04-16', weight: 5.0, height: 57.0, gender: 'male' },
  { no: 8, name: 'Fathan illyas', dateOfBirth: '2024-07-05', weight: 9.5, height: 79.0, gender: 'male' },
  { no: 9, name: 'Arshaka Rizwan', dateOfBirth: '2026-01-09', weight: 5.5, height: 58.5, gender: 'male' },
  { no: 10, name: 'Fatimah Fadhila', dateOfBirth: '2026-03-16', weight: 5.0, height: 57.0, gender: 'female' },
  { no: 11, name: 'Aufa Ahda', dateOfBirth: '2025-01-03', weight: 8.0, height: 74.0, gender: 'female' },
  { no: 12, name: 'Ayra Malika', dateOfBirth: '2024-08-11', weight: 8.2, height: 78.1, gender: 'female' },
  { no: 13, name: 'Muhammad', dateOfBirth: '2025-07-26', weight: 7.0, height: 70.0, gender: 'male' },
  { no: 14, name: 'Mirelza oktavaria', dateOfBirth: '2026-03-08', weight: 5.0, height: 58.0, gender: 'female' },
  { no: 15, name: 'Nur Aulia R', dateOfBirth: '2025-10-27', weight: 6.0, height: 64.0, gender: 'female' },
];

async function seed() {
  console.log('Seeding 15 real children data into local SQLite database...');
  const now = new Date();

  // Find or create default user (Orang Tua / Posyandu)
  let defaultUser = db.select().from(users).get();
  if (!defaultUser) {
    const userId = randomUUID();
    db.insert(users).values({
      id: userId,
      name: 'Ibu Posyandu / Orang Tua',
      email: 'posyandu@nutrimeds.id',
      createdAt: now,
      updatedAt: now,
    }).run();
    defaultUser = { id: userId, name: 'Ibu Posyandu / Orang Tua' };
  }

  for (const c of childrenData) {
    // Check if child already exists by name
    const existingChild = db.select().from(children).where(eq(children.name, c.name)).get();
    
    let childId = existingChild?.id;
    if (!existingChild) {
      childId = randomUUID();
      db.insert(children).values({
        id: childId,
        userId: defaultUser.id,
        name: c.name,
        dateOfBirth: c.dateOfBirth,
        gender: c.gender,
        createdAt: now,
      }).run();
    }

    // Insert measurement
    const ageMonths = calculateAgeMonths(c.dateOfBirth);
    const result = calculateNutritionStatus(c.weight, c.height, ageMonths, c.gender);
    
    const finalStatus = 'Kurang Gizi';

    db.insert(measurements).values({
      id: randomUUID(),
      childId,
      weight: c.weight,
      height: c.height,
      ageMonths,
      nutritionStatus: finalStatus,
      zScoreWFA: result.zScores.weightForAge.value,
      zScoreHFA: result.zScores.heightForAge.value,
      zScoreBFA: result.zScores.bmiForAge.value,
      recommendedCalories: result.recommendedCalories,
      measuredAt: now,
    }).run();

    // Log action
    db.insert(activityLogs).values({
      id: randomUUID(),
      userId: defaultUser.id,
      userName: defaultUser.name,
      action: 'ADD_MEASUREMENT',
      description: `Input data gizi anak: ${c.name} (${c.weight} kg, ${c.height} cm) - Status: Kurang Gizi`,
      ipAddress: '127.0.0.1',
      userAgent: 'Posyandu Import Tool',
      createdAt: now,
    }).run();

    console.log(`✓ Inserted child #${c.no}: ${c.name} (BB: ${c.weight}kg, TB: ${c.height}cm)`);
  }

  console.log('Successfully inserted all 15 children!');
}

seed().catch(console.error);
