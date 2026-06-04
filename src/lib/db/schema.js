import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============================================================
// Better Auth tables (required by the auth library)
// ============================================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// ============================================================
// Application tables (from PRD)
// ============================================================

export const children = sqliteTable('children', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(), // ISO date string YYYY-MM-DD
  gender: text('gender').notNull(), // 'male' | 'female'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const measurements = sqliteTable('measurements', {
  id: text('id').primaryKey(),
  childId: text('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  height: real('height').notNull(),     // cm
  weight: real('weight').notNull(),     // kg
  ageMonths: integer('age_months').notNull(),
  nutritionStatus: text('nutrition_status').notNull(),
  zScoreWFA: real('z_score_wfa'),       // Weight-for-Age
  zScoreHFA: real('z_score_hfa'),       // Height-for-Age
  zScoreBFA: real('z_score_bfa'),       // BMI-for-Age
  recommendedCalories: integer('recommended_calories').notNull(),
  measuredAt: integer('measured_at', { mode: 'timestamp' }).notNull(),
});

export const mealPlans = sqliteTable('meal_plans', {
  id: text('id').primaryKey(),
  measurementId: text('measurement_id').notNull().references(() => measurements.id, { onDelete: 'cascade' }),
  mealType: text('meal_type').notNull(), // 'sarapan' | 'makan_siang' | 'makan_malam' | 'camilan'
  foodName: text('food_name').notNull(),
  ingredients: text('ingredients').notNull(), // JSON stringified array
  instructions: text('instructions'),
  totalCalories: integer('total_calories').notNull(),
  protein: real('protein'),   // grams
  carbs: real('carbs'),       // grams
  fat: real('fat'),           // grams
});
