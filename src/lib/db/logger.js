import { db } from './index.js';
import { activityLogs } from './schema.js';
import { v4 as uuidv4 } from 'uuid';
import { sql } from 'drizzle-orm';

// Pastikan tabel activity_logs ada secara defensif saat modul pertama kali di-load
try {
  db.run(sql`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      description TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
} catch (err) {
  console.error('Gagal membuat tabel activity_logs secara defensif:', err);
}

/**
 * Mencatat aktivitas ke database secara asinkron (tidak memblokir request utama).
 * 
 * @param {object} params
 * @param {string} [params.userId] - ID Pengguna (jika terautentikasi)
 * @param {string} [params.userName] - Nama Pengguna (jika ada)
 * @param {string} params.action - Kategori aksi (e.g. 'CALCULATE', 'CHAT', 'CREATE_CHILD', dll)
 * @param {string} params.description - Deskripsi detail aktivitas
 * @param {Request} [params.req] - Objek HTTP Request untuk ekstraksi IP & User-Agent
 */
export async function logActivity({ userId, userName, action, description, req }) {
  try {
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      // Mengambil IP Address (mendukung reverse proxy / load balancer)
      const xForwardedFor = req.headers.get('x-forwarded-for');
      const xRealIp = req.headers.get('x-real-ip');
      ipAddress = xForwardedFor || xRealIp || null;
      
      if (ipAddress && ipAddress.includes(',')) {
        ipAddress = ipAddress.split(',')[0].trim();
      }

      // Mengambil User Agent
      userAgent = req.headers.get('user-agent') || null;
    }

    db.insert(activityLogs).values({
      id: uuidv4(),
      userId: userId || null,
      userName: userName || null,
      action,
      description,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    }).run();
  } catch (error) {
    console.error('Gagal menyimpan log aktivitas ke database:', error);
  }
}
