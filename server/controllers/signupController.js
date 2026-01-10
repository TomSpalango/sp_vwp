import { pool } from '../db/mysql.js';

// POST /api/events/:id/signup
export async function signupForEvent(req, res) {
  const eventId = Number(req.params.id);
  const userId = req.user.id;

  if (!Number.isInteger(eventId)) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  try {
    // Does event exist?
    const [events] = await pool.query(`SELECT id, status, capacity FROM events WHERE id = ?`, [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = events[0];

    // Is approved?
    if (event.status !== 'approved') {
      return res.status(403).json({ error: 'Event is not open for signups' });
    }

    // Is at capacity?
    if (event.capacity !== null) {
      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS signupCount FROM event_signups WHERE event_id = ?`,
        [eventId]
      );

      const signupCount = Number(countRows[0].signupCount || 0);
      if (signupCount >= event.capacity) {
        return res.status(409).json({ error: 'Event is at capacity' });
      }
    }

    // OK - Insert signup
    await pool.query(
      `INSERT INTO event_signups (event_id, user_id) VALUES (?, ?)`,
      [eventId, userId]
    );

    return res.status(201).json({ message: 'Signed up successfully' });
  } catch (err) {
    // Duplicate signup
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You are already signed up for this event' });
    }

    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/events/:id/signups
export async function getEventSignups(req, res) {
  const eventId = Number(req.params.id);

  if (!Number.isInteger(eventId)) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  try {
    // Verify event exists
    const [events] = await pool.query(`SELECT id FROM events WHERE id = ?`, [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const [rows] = await pool.query(
      `SELECT es.id, es.event_id, es.user_id, es.signup_at, u.name, u.email
       FROM event_signups es
       JOIN users u ON u.id = es.user_id
       WHERE es.event_id = ?
       ORDER BY es.signup_at ASC`,
      [eventId]
    );

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
