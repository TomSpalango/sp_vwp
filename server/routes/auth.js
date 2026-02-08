import { Router } from 'express';
import { register, login } from '../controllers/authController.js';

const router = Router();

// Handles new user registration requests.
router.post('/register', register);

// Handles user login requests and issues a JWT on success.
router.post('/login', login);

export default router;