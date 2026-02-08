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
import { signupForEvent, withdrawFromEvent, getEventSignups } from '../controllers/signupController.js';

const router = Router();

// Retrieves all approved events for public browsing.
router.get('/', getEvents);

// Retrieves all events regardless of status.
router.get('/all', authRequired, requireRole('Admin'), getAllEvents);

// Retrieves a single approved event by id.
router.get('/:id', getEvent);

// Creates a new event submission.
router.post(
  '/',
  authRequired,
  requireRole('Registered User', 'Event Coordinator', 'Admin'),
  createEvent
);

// Updates an existing event.
router.put('/:id', authRequired, updateEvent);

// Approves a pending event.
router.put('/:id/approve', authRequired, requireRole('Admin'), approveEvent);

// Declines a pending event.
router.put('/:id/decline', authRequired, requireRole('Admin'), declineEvent);

// Deletes an event.
router.delete('/:id', authRequired, deleteEvent);

// Signs the current user up for an event.
router.post(
  '/:id/signup',
  authRequired,
  requireRole('Registered User', 'Event Coordinator', 'Admin'),
  signupForEvent
);

// Retrieves the signup roster for an event.
router.get(
  '/:id/signups',
  authRequired,
  requireRole('Event Coordinator', 'Admin'),
  getEventSignups
);

// Withdraws the current user from an event.
router.delete(
  '/:id/withdraw',
  authRequired,
  requireRole('Registered User', 'Event Coordinator', 'Admin'),
  withdrawFromEvent
);

export default router;