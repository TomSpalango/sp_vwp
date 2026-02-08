import { Router } from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { markAttendance, getAttendance } from '../controllers/attendanceController.js';

const router = Router();

// Retrieves attendance records for a specific event.
router.get('/:eventId', authRequired, getAttendance);

// Marks or updates attendance for a user at an event.
router.post('/', authRequired, requireRole('Event Coordinator', 'Admin'), markAttendance);

export default router;