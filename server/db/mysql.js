import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

try {
  const [rows] = await pool.query('SELECT 1 AS ok');
  console.log('MySQL pool OK:', rows[0]);
} catch (err) {
  console.error('MySQL connection failed:', err.message);
}
