import { pool } from '../db/mysql.js'; // using absolute path for now

// Create a new event
export async function createEvent(req, res) {
  const { title, description, location, start_datetime, end_datetime, capacity } = req.body;
  if (!title || !start_datetime) {
    return res.status(400).json({ error: 'Title and start_datetime are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO events (title, description, location, start_datetime, end_datetime, capacity, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, location, start_datetime, end_datetime, capacity, req.user.id]
    );
    res.status(201).json({ message: 'Event created', eventId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get all approved events
export async function getEvents(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM events WHERE status = 'approved' ORDER BY start_datetime DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get all events
export async function getAllEvents(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM events ORDER BY start_datetime DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get a single event, approved only
export async function getEvent(req, res) {
  const eventId = Number(req.params.id);

  if (!Number.isInteger(eventId)) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
        e.*,
        (SELECT COUNT(*) FROM event_signups es WHERE es.event_id = e.id) AS signup_count
      FROM events e
      WHERE e.id = ? AND e.status = 'approved'`,
      [eventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}


// Update an event
export async function updateEvent(req, res) {
  const { id } = req.params;
  try {
    const [events] = await pool.query(`SELECT * FROM events WHERE id = ?`, [id]);
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });

    const event = events[0];
    if (req.user.role !== 'Admin' && event.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const { title, description, location, start_datetime, end_datetime, capacity, status } = req.body;

    // Only admin can change status
    const newStatus = (req.user.role === 'Admin' && status) ? status : event.status;

    await pool.query(
      `UPDATE events
       SET title=?, description=?, location=?, start_datetime=?, end_datetime=?, capacity=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [
        title || event.title,
        description || event.description,
        location || event.location,
        start_datetime || event.start_datetime,
        end_datetime || event.end_datetime,
        capacity || event.capacity,
        newStatus,
        id
      ]
    );

    res.json({ message: 'Event updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}


// Approve an event
export async function approveEvent(req, res) {
  const eventId = Number(req.params.id);
  if (!Number.isInteger(eventId)) return res.status(400).json({ error: 'Invalid event id' });

  try {
    const [events] = await pool.query(`SELECT * FROM events WHERE id = ?`, [eventId]);
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });

    await pool.query(
      `UPDATE events SET status='approved', updated_at=NOW() WHERE id=?`,
      [eventId]
    );

    res.json({ message: 'Event approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}


// Decline an event
export async function declineEvent(req, res) {
  const eventId = Number(req.params.id);
  if (!Number.isInteger(eventId)) return res.status(400).json({ error: 'Invalid event id' });

  try {
    const [events] = await pool.query(`SELECT * FROM events WHERE id = ?`, [eventId]);
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });

    await pool.query(
      `UPDATE events SET status='declined', updated_at=NOW() WHERE id=?`,
      [eventId]
    );

    res.json({ message: 'Event declined' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}



// Delete an event
export async function deleteEvent(req, res) {
  const { id } = req.params;
  try {
    const [events] = await pool.query(`SELECT * FROM events WHERE id = ?`, [id]);
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });

    const event = events[0];
    if (req.user.role !== 'Admin' && event.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await pool.query(`DELETE FROM events WHERE id=?`, [id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
