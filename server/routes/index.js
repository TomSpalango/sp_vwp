import { Router } from 'express';
import authRoutes from './auth.js';
import eventRoutes from './events.js';
import attendanceRoutes from './attendance.js';
import commentRoutes from './comments.js';

const router = Router();

// This route is called to verify the API is running and identify the version.
router.get('/version', (req, res) => {
  res.json({ api: 'v1', name: 'vwp-api' });
});

// Mounts authentication-related routes (login, registration).
router.use('/auth', authRoutes);

// Mounts event-related routes (browse, create, update, signup, moderation).
router.use('/events', eventRoutes);

// Mounts attendance-related routes (viewing and marking attendance).
router.use('/attendance', attendanceRoutes);

// Mounts comment-related routes (viewing, creating, deleting comments).
router.use('/comments', commentRoutes);

export default router;