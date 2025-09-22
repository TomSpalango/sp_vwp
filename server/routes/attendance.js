import { Router } from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { markAttendance, getAttendance } from '../controllers/attendanceController.js';

const router = Router();

// Anyone logged in can view attendance
router.get('/:eventId', authRequired, getAttendance);

// Only Event Coordinators / Admins can mark
router.post('/', authRequired, requireRole('Event Coordinator', 'Admin'), markAttendance);

export default router;
