import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { getUserFromToken } from '../utils/auth';

function formatDateTime(dt) {
  if (!dt) return '';
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
}

function canManageStatus(role) {
  return role === 'Event Coordinator' || role === 'Admin';
}

function canEditOrDelete(role, userId, event) {
  if (!event) return false;
  if (role === 'Admin') return true;
  return Number(event.created_by) === Number(userId);
}

function canViewAttendees(role, userId, event) {
  if (!event) return false;
  if (role === 'Admin' || role === 'Event Coordinator') return true;
  return Number(event.created_by) === Number(userId);
}

export default function EventsList() {
  const user = useMemo(() => getUserFromToken(), []);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function loadEvents() {
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      // Admin can see all events, everyone else sees approved only
      const data = user?.role === 'Admin'
        ? await api.getAllEventsAdmin()
        : await api.getApprovedEvents();

      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const onSignup = async (eventId) => {
    setErr('');
    setMsg('');
    try {
      await api.signupForEvent(eventId);
      setMsg('Signed up successfully.');
      // refresh list after action
      await loadEvents();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onApprove = async (eventId) => {
    setErr('');
    setMsg('');
    try {
      await api.approveEvent(eventId);
      setMsg('Event approved.');
      await loadEvents();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onDecline = async (eventId) => {
    setErr('');
    setMsg('');
    try {
      await api.declineEvent(eventId);
      setMsg('Event declined.');
      await loadEvents();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onDelete = async (eventId) => {
    const ok = window.confirm('Delete this event? This cannot be undone.');
    if (!ok) return;

    setErr('');
    setMsg('');
    try {
      await api.deleteEvent(eventId);
      setMsg('Event deleted.');
      await loadEvents();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Events</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={loadEvents} disabled={loading}>
          Refresh
        </button>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Location</th>
                <th>Start</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted">No events found.</td>
                </tr>
              ) : events.map((ev) => {
                const role = user?.role || 'Guest';
                const userId = user?.id;

                const showStatusButtons = user && canManageStatus(role);
                const showEditDelete = user && canEditOrDelete(role, userId, ev);
                const showAttendees = user && canViewAttendees(role, userId, ev);

                // Signup button: only for logged-in users AND only if approved
                const canSignup = !!user && ev.status === 'approved';

                return (
                  <tr key={ev.id}>
                    <td>{ev.title}</td>
                    <td style={{ maxWidth: 360 }}>{ev.description}</td>
                    <td>{ev.location}</td>
                    <td>{formatDateTime(ev.start_datetime)}</td>
                    <td>
                      <span className="badge text-bg-secondary">{ev.status}</span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm" role="group">
                        <Link className="btn btn-outline-primary" to={`/events/${ev.id}`}>
                          Details
                        </Link>

                        {canSignup && (
                          <button className="btn btn-outline-success" onClick={() => onSignup(ev.id)}>
                            Sign Up
                          </button>
                        )}

                        {/* Withdraw will be implemented next milestone. */}
                        {user && (
                          <button className="btn btn-outline-secondary" disabled title="Withdraw not implemented yet">
                            Withdraw
                          </button>
                        )}

                        {showStatusButtons && ev.status === 'pending' && (
                          <button className="btn btn-outline-warning" onClick={() => onApprove(ev.id)}>
                            Approve
                          </button>
                        )}

                        {showStatusButtons && ev.status === 'approved' && (
                          <button className="btn btn-outline-warning" onClick={() => onDecline(ev.id)}>
                            Decline
                          </button>
                        )}

                        {showAttendees && (
                          <Link className="btn btn-outline-dark" to={`/events/${ev.id}/attendees`}>
                            Attendees
                          </Link>
                        )}

                        {showEditDelete && (
                          <>
                            <Link className="btn btn-outline-secondary" to={`/events/${ev.id}/edit`}>
                              Edit
                            </Link>
                            <button className="btn btn-outline-danger" onClick={() => onDelete(ev.id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {user?.role === 'Admin' ? (
            <p className="text-muted small">
              Admin view: showing approved + pending + declined.
            </p>
          ) : (
            <p className="text-muted small">
              Public view: showing approved events only.
            </p>
          )}
        </div>
      )}
    </>
  );
}
