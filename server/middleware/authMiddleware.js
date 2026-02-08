import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware that enforces JWT-based authentication on protected routes.
// This function is called before route handlers that require a logged-in user.
// Assumes the Authorization header is in the format: "Bearer <token>".
export function authRequired(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Ensure an Authorization header is present
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  // Extract the token portion from the Bearer scheme
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  try {
    // Verify and decode the JWT using the shared secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded identity and role information to the request for downstream use
    req.user = decoded; // contains id, email, role

    next();
  } catch (err) {
    // Token is missing, expired, or invalid
    return res.status(403).json({ error: 'Invalid token' });
  }
}
