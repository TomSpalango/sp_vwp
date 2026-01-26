import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => getUserFromToken(), []);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function loadEvent() {
    setLoading(true);
    setErr('');
    setMsg('');

    try {
      // Guest sees approved only (server enforces status filter)
      const data = await api.getEvent(id);
      setEvent(data);
    } catch (e) {
      setErr(e.message);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvent();
  }, [id]);

  const onSignup = async () => {
    setErr('');
    setMsg('');
    try {
      await api.signupForEvent(id);
      setMsg('Signed up successfully.');
      await loadEvent();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onWithdraw = async () => {
    setErr('');
    setMsg('');
    try {
      await api.withdrawFromEvent(id);
      setMsg('Withdrawn successfully.');
      await loadEvent();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onApprove = async () => {
    setErr('');
    setMsg('');
    try {
      await api.approveEvent(id);
      setMsg('Event approved.');
      await loadEvent();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onDecline = async () => {
    setErr('');
    setMsg('');
    try {
      await api.declineEvent(id);
      setMsg('Event declined.');
      await loadEvent();
    } catch (e) {
      setErr(e.message);
    }
  };

  const onDelete = async () => {
    const ok = window.confirm('Delete this event? This cannot be undone.');
    if (!ok) return;

    setErr('');
    setMsg('');
    try {
      await api.deleteEvent(id);
      setMsg('Event deleted.');
      navigate('/events');
    } catch (e) {
      setErr(e.message);
    }
  };

  const role = user?.role || 'Guest';
  const userId = user?.id;

  const showStatusButtons = user && canManageStatus(role);
  const showEditDelete = user && event && canEditOrDelete(role, userId, event);
  const showAttendees = user && event && canViewAttendees(role, userId, event);

  // Signup only for logged-in users and approved events
  const canSignup = !!user && event?.status === 'approved';

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Event Details</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={loadEvent} disabled={loading}>
            Refresh
          </button>
          <Link className="btn btn-outline-primary btn-sm" to="/events">
            Back to Events
          </Link>
        </div>
      </div>

      {err && (
        <div className="alert alert-danger">
          {err}
          <div className="mt-2">
            <Link className="btn btn-sm btn-outline-primary" to="/events">
              Return to Events
            </Link>
          </div>
        </div>
      )}
      {msg && <div className="alert alert-success">{msg}</div>}

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : !event ? (
        <div className="text-muted">No event to display.</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div>
                <h3 className="card-title mb-1">{event.title}</h3>
                <div className="text-muted small">
                  Status: <span className="badge text-bg-secondary">{event.status}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="d-flex flex-wrap gap-2 justify-content-end">
                {canSignup && (
                  <button className="btn btn-success btn-sm" onClick={onSignup}>
                    Sign Up
                  </button>
                )}

                {user && (
                  <button className="btn btn-outline-secondary btn-sm" onClick={onWithdraw}>
                    Withdraw
                  </button>
                )}

                {showStatusButtons && event.status === 'pending' && (
                  <button className="btn btn-warning btn-sm" onClick={onApprove}>
                    Approve
                  </button>
                )}

                {showStatusButtons && event.status === 'approved' && (
                  <button className="btn btn-warning btn-sm" onClick={onDecline}>
                    Decline
                  </button>
                )}

                {showAttendees && (
                  <Link className="btn btn-dark btn-sm" to={`/events/${event.id}/attendees`}>
                    View Attendees
                  </Link>
                )}

                {showEditDelete && (
                  <>
                    <Link className="btn btn-outline-secondary btn-sm" to={`/events/${event.id}/edit`}>
                      Edit
                    </Link>
                    <button className="btn btn-outline-danger btn-sm" onClick={onDelete}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <hr />

            <dl className="row mb-0">
              <dt className="col-sm-3">Description</dt>
              <dd className="col-sm-9">{event.description || <span className="text-muted">None</span>}</dd>

              <dt className="col-sm-3">Location</dt>
              <dd className="col-sm-9">{event.location || <span className="text-muted">None</span>}</dd>

              <dt className="col-sm-3">Start</dt>
              <dd className="col-sm-9">{formatDateTime(event.start_datetime)}</dd>

              <dt className="col-sm-3">End</dt>
              <dd className="col-sm-9">{formatDateTime(event.end_datetime)}</dd>

              <dt className="col-sm-3">Attendees</dt>
              <dd className="col-sm-9">
                {Number.isFinite(Number(event.signup_count)) ? `${event.signup_count} / ${event.capacity ?? 'N/A'}` : <span className="text-muted">N/A</span>}
              </dd>

              <dt className="col-sm-3">Capacity</dt>
              <dd className="col-sm-9">{event.capacity ?? <span className="text-muted">N/A</span>}</dd>

              <dt className="col-sm-3">Created By (user id)</dt>
              <dd className="col-sm-9">{event.created_by ?? <span className="text-muted">N/A</span>}</dd>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
