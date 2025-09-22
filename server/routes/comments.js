import { Router } from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { createComment, getComments, deleteComment } from '../controllers/commentController.js';

const router = Router();

// Anyone can view
router.get('/:eventId', getComments);

// Registered users or above can comment
router.post('/', authRequired, requireRole('Registered User', 'Event Coordinator', 'Admin'), createComment);

// Only Admins can delete
router.delete('/:id', authRequired, requireRole('Admin'), deleteComment);

export default router;
