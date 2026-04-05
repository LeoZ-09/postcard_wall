import mysql from 'mysql2/promise';
import { createImageTable, createPostcardTable, createIndexes } from './models/schema.js';

let pool = null;

export function getDatabase() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'postcard_wall',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
}

export async function initializeDatabase() {
  const db = getDatabase();
  const connection = await db.getConnection();

  try {
    await createImageTable(connection);
    await createPostcardTable(connection);
    await createIndexes(connection);
    console.log('Database initialized successfully');
  } finally {
    connection.release();
  }
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function query(sql, params = []) {
  const db = getDatabase();
  const [rows] = await db.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}
