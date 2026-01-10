import { Router } from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { signupForEvent, getEventSignups } from '../controllers/signupController.js';

const router = Router();

router.get('/', getEvents);          // Guests can browse
router.get('/:id', getEvent);        // Guests can view

// Registered users can create events (pending approval)
router.post('/', authRequired, requireRole('Registered User', 'Event Coordinator', 'Admin'), createEvent);

// Only creator or Admin can update/delete
// Just require login for now
router.put('/:id', authRequired, updateEvent);
router.delete('/:id', authRequired, deleteEvent);

// Sign up for an event - must be logged in and at least Registered User
router.post('/:id/signup', authRequired, requireRole('Registered User', 'Event Coordinator', 'Admin'), signupForEvent);

// View signups (coordinator and admin only)
router.get('/:id/signups', authRequired, requireRole('Event Coordinator', 'Admin'), getEventSignups);

export default router;