# Volunteer With Purpose (VWP)

Volunteer With Purpose (VWP) is a volunteer coordination platform that allows guests to browse approved volunteer events, registered users to create and sign up for events, and administrators/event coordinators to manage approvals and attendance tracking.

## Technology Stack
- Frontend: React (Vite), Bootstrap
- Backend: Node.js, Express
- Database: MySQL
- Authentication: JWT (role-based access control)

## Architecture Overview
Volunteer With Purpose follows a client-server architecture:

- The **frontend** is a React single-page application built with Vite and styled using Bootstrap.
- The **backend** is a Node.js / Express REST API responsible for enforcing business rules and role-based access control.
- A **MySQL database** stores users, events, signups, and attendance records.
- **JWT-based authentication** is used to identify users and enforce permissions for guests, registered users, event coordinators, and administrators.

All authorization checks are enforced on the server to ensure data integrity and security.

## Key Features
- Guests can browse approved volunteer events and view event details
- Registered users can create new events and sign up for approved events
- Administrators and event coordinators can approve or decline events
- Role-based access control is enforced across all API endpoints
- Event capacity limits and duplicate signups are prevented
- Attendance tracking is supported for post-event reporting

## Sample Code

### Event Signup Controller (Backend)

The following example demonstrates server-side validation and business rules when a user signs up for an event. This logic ensures the event exists, is approved, and has available capacity before allowing the signup.

export async function signupForEvent(req, res) {
  const eventId = Number(req.params.id);
  const userId = req.user.id;

  // Verify event exists and is approved
  const [events] = await pool.query(
    'SELECT status, capacity FROM events WHERE id = ?',
    [eventId]
  );

  if (events.length === 0 || events[0].status !== 'approved') {
    return res.status(403).json({ error: 'Event is not open for signups' });
  }

  // Enforce capacity limits
  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS signupCount FROM event_signups WHERE event_id = ?',
    [eventId]
  );

  if (events[0].capacity !== null && countRows[0].signupCount >= events[0].capacity) {
    return res.status(409).json({ error: 'Event is at capacity' });
  }

  // Create signup
  await pool.query(
    'INSERT INTO event_signups (event_id, user_id) VALUES (?, ?)',
    [eventId, userId]
  );

  res.status(201).json({ message: 'Signed up successfully' });
}


## Repository (Private)
Public GitHub repository:
https://github.com/TomSpalango/sp_vwp

## How to Run (Local)

### 1) Database
- Create a MySQL database named: `sp_vwp`
- Apply the schema:
  - Run `schema.sql`

### 2) Backend (API Server)
From the `/server` folder:
npm install
npm run dev
