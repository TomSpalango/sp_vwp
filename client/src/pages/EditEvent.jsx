import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { getUserFromToken } from '../utils/auth';

function toDateValue(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toTimeValue(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mi}`;
}

function combineDateTime(date, time) {
  if (!date) return null;
  if (!time) return `${date}T00:00:00`;
  return `${date}T${time}:00`;
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => getUserFromToken(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const [event, setEvent] = useState(null);

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr('');
      setMsg('');

      try {
        // approved events
        const data = await api.getEvent(id);
        setEvent(data);

        setTitle(data.title || '');
        setDescription(data.description || '');
        setLocation(data.location || '');

        setStartDate(toDateValue(data.start_datetime));
        setStartTime(toTimeValue(data.start_datetime));

        setEndDate(toDateValue(data.end_datetime));
        setEndTime(toTimeValue(data.end_datetime));

        setCapacity(data.capacity ?? '');
        setStatus(data.status || 'pending');
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (!user) {
    return (
      <div className="alert alert-warning">
        You must be logged in to edit events.
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setSaving(true);

    try {
      const payload = {
        title,
        description,
        location,
        start_datetime: combineDateTime(startDate, startTime),
        end_datetime: endDate ? combineDateTime(endDate, endTime) : null,
        capacity: capacity === '' ? null : Number(capacity)
      };

      // Only Admin should be able to change status
      if (user.role === 'Admin') {
        payload.status = status;
      }

      await api.updateEvent(id, payload);

      setMsg('Event updated.');
      setTimeout(() => navigate(`/events/${id}`), 350);
    } catch (e2) {
      setErr(e2.message);
      setSaving(false);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Edit Event</h2>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-primary btn-sm" to={`/events/${id}`}>
            Back to Details
          </Link>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : !event ? (
        <div className="text-muted">No event found.</div>
      ) : (
        <form onSubmit={onSubmit} className="card">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Location</label>
              <input className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Start Date</label>
                <input className="form-control" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Start Time</label>
                <input className="form-control" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">End Date (optional)</label>
                <input className="form-control" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">End Time (optional)</label>
                <input className="form-control" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={!endDate} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Capacity (optional)</label>
              <input className="form-control" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>

            {user.role === 'Admin' && (
              <div className="mb-3">
                <label className="form-label">Status (Admin only)</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="declined">declined</option>
                </select>
              </div>
            )}

            <button className="btn btn-warning w-100" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <div className="mt-2 text-muted small">
              Note: Only Admin can change status
            </div>
          </div>
        </form>
      )}
    </>
  );
}
