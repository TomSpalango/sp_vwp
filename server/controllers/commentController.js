import { pool } from '../db/mysql.js';

// Create a comment
export async function createComment(req, res) {
  const { eventId, content } = req.body;

  if (!eventId || !content) {
    return res.status(400).json({ error: 'eventId and content are required' });
  }

  try {
    await pool.query(
      `INSERT INTO comments (event_id, user_id, content)
       VALUES (?, ?, ?)`,
      [eventId, req.user.id, content]
    );
    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Get comments for an event
export async function getComments(req, res) {
  const { eventId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.name as author, u.email
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.event_id = ?
       ORDER BY c.created_at ASC`,
      [eventId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Delete a comment (admin only)
export async function deleteComment(req, res) {
  const { id } = req.params;

  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [result] = await pool.query(`DELETE FROM comments WHERE id=?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
