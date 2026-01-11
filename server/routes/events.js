import { Router } from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  createEvent,
  getEvents,
  getEvent,
  getAllEvents,
  updateEvent,
  approveEvent,
  declineEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { signupForEvent, getEventSignups } from '../controllers/signupController.js';

const router = Router();

router.get('/', getEvents);          // Guests can browse (approved only)
router.get('/all', authRequired, requireRole('Admin'), getAllEvents); // Admin only can see all
router.get('/:id', getEvent);        // Guests can view (approved only)

// Registered users can create events (pending approval)
router.post('/', authRequired, requireRole('Registered User', 'Event Coordinator', 'Admin'), createEvent);

// Only creator or Admin can update/delete / approve/decline
// Just require login for now
router.put('/:id', authRequired, updateEvent);
router.put('/:id/approve', authRequired, requireRole('Admin'), approveEvent);
router.put('/:id/decline', authRequired, requireRole('Admin'), declineEvent);
router.delete('/:id', authRequired, deleteEvent);

// Sign up for an event - must be logged in and at least Registered User
router.post('/:id/signup', authRequired, requireRole('Registered User', 'Event Coordinator', 'Admin'), signupForEvent);

// View signups (coordinator and admin only)
router.get('/:id/signups', authRequired, requireRole('Event Coordinator', 'Admin'), getEventSignups);

export default router;