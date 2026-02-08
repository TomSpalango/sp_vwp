import { pool } from '../db/mysql.js';

// TODO: Implement feature - Eliminated due to feature creep.

// Creates a new comment for a specific event.
// This function is called when an authenticated user submits a comment.
// Assumes req.user is populated by authentication middleware and contains the user id.
export async function createComment(req, res) {
  const { eventId, content } = req.body;

  // Validate required comment data before attempting insertion
  if (!eventId || !content) {
    return res.status(400).json({ error: 'eventId and content are required' });
  }

  try {
    // Insert the comment and associate it with the current authenticated user
    await pool.query(
      `INSERT INTO comments (event_id, user_id, content)
       VALUES (?, ?, ?)`,
      [eventId, req.user.id, content]
    );

    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    // Log unexpected database errors while returning a generic response
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Retrieves all comments associated with a specific event.
// This function is called when viewing the comment thread for an event.
// Assumes the eventId is provided as a route parameter.
export async function getComments(req, res) {
  const { eventId } = req.params;

  try {
    // Query comments along with author details, ordered chronologically
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
    // Handle and log unexpected server or database errors
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Deletes a comment by id.
// This function is called when an admin attempts to remove a comment.
// Assumes only users with the Admin role are authorized to perform this action.
export async function deleteComment(req, res) {
  const { id } = req.params;

  try {
    // Enforce authorization: only Admin users may delete comments
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Attempt to delete the specified comment
    const [result] = await pool.query(`DELETE FROM comments WHERE id=?`, [id]);

    // Handle case where the comment does not exist
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    // Log unexpected errors and return a generic server response
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}