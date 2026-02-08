import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/mysql.js';
import dotenv from 'dotenv';

dotenv.config();

// Registers a new user account.
// This function is called when a client submits the registration form.
// Assumes a default role of 'Registered User'.
export async function register(req, res) {
  const { name, email, password } = req.body;

  // Validate required registration fields before attempting database operations
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Hash the plaintext password before storing it in the database
    const password_hash = await bcrypt.hash(password, 10);

    // Create the user with a default role for standard accounts
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'Registered User')`,
      [name, email, password_hash]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    // Handle duplicate email registrations
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Log unexpected errors for debugging while returning a generic response
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Authenticates a user and returns a signed JWT.
// This function is called when a client submits the login form.
// Assumes process.env.JWT_SECRET is configured and the users table stores bcrypt hashes.
export async function login(req, res) {
  const { email, password } = req.body;

  // Validate required login fields before querying the database
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Look up the user by email
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = rows[0];

    // Compare provided password to stored bcrypt hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    // Create a JWT containing key identity/authorization claims for downstream middleware
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (err) {
    // Handle and log unexpected authentication or database errors
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}