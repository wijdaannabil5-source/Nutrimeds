import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'nutrimeds.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS children (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS measurements (
    id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,
    height REAL NOT NULL,
    weight REAL NOT NULL,
    age_months INTEGER NOT NULL,
    nutrition_status TEXT NOT NULL,
    z_score_wfa REAL,
    z_score_hfa REAL,
    z_score_bfa REAL,
    recommended_calories INTEGER NOT NULL,
    measured_at INTEGER NOT NULL,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS meal_plans (
    id TEXT PRIMARY KEY,
    measurement_id TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    food_name TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT,
    total_calories INTEGER NOT NULL,
    protein REAL,
    carbs REAL,
    fat REAL,
    FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE CASCADE
  );
`);

console.log('App tables created successfully.');
db.close();
