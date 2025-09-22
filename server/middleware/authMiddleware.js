import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function authRequired(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // is  id, email, role
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
