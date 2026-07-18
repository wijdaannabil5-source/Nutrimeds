/**
 * Database migration script.
 * Run with: node src/lib/db/migrate.js
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(process.cwd(), 'nutrimeds.db');

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Create all tables
sqlite.exec(`
  -- Better Auth: users
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  -- Better Auth: sessions
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  -- Better Auth: accounts
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at INTEGER,
    refresh_token_expires_at INTEGER,
    scope TEXT,
    password TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  -- Better Auth: verifications
  CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
  );

  -- App: children profiles
  CREATE TABLE IF NOT EXISTS children (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  -- App: measurement history
  CREATE TABLE IF NOT EXISTS measurements (
    id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    height REAL NOT NULL,
    weight REAL NOT NULL,
    age_months INTEGER NOT NULL,
    nutrition_status TEXT NOT NULL,
    z_score_wfa REAL,
    z_score_hfa REAL,
    z_score_bfa REAL,
    recommended_calories INTEGER NOT NULL,
    measured_at INTEGER NOT NULL
  );

  -- App: meal plans
  CREATE TABLE IF NOT EXISTS meal_plans (
    id TEXT PRIMARY KEY,
    measurement_id TEXT NOT NULL REFERENCES measurements(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL,
    food_name TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT,
    total_calories INTEGER NOT NULL,
    protein REAL,
    carbs REAL,
    fat REAL
  );

  -- App: activity logs
  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL
  );
`);

console.log('✅ Database migration complete. Tables created in:', DB_PATH);
sqlite.close();
