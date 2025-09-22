import { pool } from '../db/mysql.js';

// Mark attendance for a user at an event
export async function markAttendance(req, res) {
  const { eventId, userId, present, hours } = req.body;

  if (!eventId || !userId) {
    return res.status(400).json({ error: 'eventId and userId are required' });
  }

  try {
    // only admins or coordinators can mark attendance
    if (req.user.role !== 'Admin' && req.user.role !== 'Event Coordinator') {
      return res.status(403).json({ error: 'Not authorized to mark attendance' });
    }

    await pool.query(
      `INSERT INTO attendance (event_id, user_id, present, hours, marked_by, marked_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         present = VALUES(present),
         hours = VALUES(hours),
         marked_by = VALUES(marked_by),
         marked_at = VALUES(marked_at)`,
      [eventId, userId, present ? 1 : 0, hours || 0, req.user.id]
    );

    res.json({ message: 'Attendance marked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get attendance for an event
export async function getAttendance(req, res) {
  const { eventId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT a.id, u.name, u.email, a.present, a.hours, a.marked_at, a.marked_by
       FROM attendance a
       JOIN users u ON u.id = a.user_id
       WHERE a.event_id = ?`,
      [eventId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
