import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { pool } from '../db/mysql.js';

dotenv.config();

async function upsertUser({ name, email, password, role }) {
  const password_hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       role = VALUES(role)`,
    [name, email, password_hash, role]
  );
  const [[row]] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email]);
  return row.id;
}

async function seed() {
  console.log('Seeding sp_vwp...');

  const adminId = await upsertUser({
    name: 'Admin User',
    email: 'admin@vwp.local',
    password: 'Password123!',
    role: 'Admin'
  });

  const coordId = await upsertUser({
    name: 'Event Coordinator',
    email: 'coordinator@vwp.local',
    password: 'Password123!',
    role: 'Event Coordinator'
  });

  const registeredId = await upsertUser({
    name: 'Registered User',
    email: 'user@vwp.local',
    password: 'Password123!',
    role: 'Registered User'
  });

  // Events
  await pool.query(
    `INSERT INTO events
      (title, description, location, start_datetime, end_datetime, capacity, status, created_by)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE title = VALUES(title)`,
    [
      'Community Park Cleanup',
      'Join us to clean up the park.',
      'Goshen, NY',
      '2025-10-11 10:00:00',
      '2025-10-11 13:00:00',
      30,
      'approved',
      adminId,

      'Food Pantry Sorting',
      'Help sort donations at the food pantry.',
      'Middletown, NY',
      '2025-10-18 09:00:00',
      '2025-10-18 12:00:00',
      20,
      'pending',
      coordId,

      'Coat Drive',
      'Collect and organize winter coats for families.',
      'Goshen, NY',
      '2025-11-02 12:00:00',
      '2025-11-02 16:00:00',
      50,
      'approved',
      coordId
    ]
  );

  // Signups for the registered user on approved events
  const [approved] = await pool.query(
    `SELECT id FROM events WHERE status='approved' ORDER BY id ASC`
  );
  for (const ev of approved) {
    await pool.query(
      `INSERT IGNORE INTO event_signups (event_id, user_id) VALUES (?, ?)`,
      [ev.id, registeredId]
    );
  }

  console.log('Seed complete.');
  await pool.end();
}

seed().catch(async (err) => {
  console.error(err);
  try { await pool.end(); } catch {}
  process.exit(1);
});
