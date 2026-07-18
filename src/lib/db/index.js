import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import fs from 'fs';

function getDbPath() {
  const defaultPath = path.join(process.cwd(), 'nutrimeds.db');
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && process.platform !== 'win32')) {
    const tmpPath = '/tmp/nutrimeds.db';
    try {
      // Copy packaged DB to /tmp if not already present
      if (!fs.existsSync(tmpPath)) {
        if (fs.existsSync(defaultPath)) {
          fs.copyFileSync(defaultPath, tmpPath);
        } else {
          // Fallback: create empty database file
          fs.closeSync(fs.openSync(tmpPath, 'w'));
        }
      }
      return tmpPath;
    } catch (err) {
      console.error('Gagal menyiapkan database di /tmp:', err);
    }
  }
  return defaultPath;
}

const DB_PATH = getDbPath();

let _db = null;

export function getDatabase() {
  if (!_db) {
    const sqlite = new Database(DB_PATH);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    _db = drizzle(sqlite, { schema });
  }
  return _db;
}

export const db = getDatabase();
