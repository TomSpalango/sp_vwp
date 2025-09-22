import { Router } from 'express';
import authRoutes from './auth.js';
import eventRoutes from './events.js';
import attendanceRoutes from './attendance.js';
import commentRoutes from './comments.js';

const router = Router();

router.get('/version', (req, res) => {
  res.json({ api: 'v1', name: 'vwp-api' });
});

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/comments', commentRoutes);

export default router;
