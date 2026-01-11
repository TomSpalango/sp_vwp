import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { getUserFromToken } from '../utils/auth';

export default function CreateEvent() {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="alert alert-warning">
        You must be logged in to create an event.
      </div>
    );
  }

  function combineDateTime(date, time) {
    if (!date) return null;
    if (!time) return `${date}T00:00:00`;
    return `${date}T${time}:00`;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);

    try {
      const start_datetime = combineDateTime(startDate, startTime);
      const end_datetime = endDate ? combineDateTime(endDate, endTime) : null;

      // capacity is optional (for now)
      const capNum = capacity === '' ? null : Number(capacity);

      const payload = {
        title,
        description,
        location,
        start_datetime,
        end_datetime,
        capacity: capNum
      };

      const res = await api.createEvent(payload);

      setMsg(res?.message || 'Event created.');
      setTimeout(() => navigate('/events'), 400);
    } catch (e2) {
      setErr(e2.message);
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <h2 className="mb-3">Create Event</h2>

        {err && <div className="alert alert-danger">{err}</div>}
        {msg && <div className="alert alert-success">{msg}</div>}

        <form onSubmit={onSubmit} className="card">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Start Date</label>
                <input
                  className="form-control"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Start Time</label>
                <input
                  className="form-control"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">End Date (optional)</label>
                <input
                  className="form-control"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">End Time (optional)</label>
                <input
                  className="form-control"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!endDate}
                />
                <div className="form-text">End time enabled when end date is set.</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Capacity (optional)</label>
              <input
                className="form-control"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>

            <button className="btn btn-warning w-100" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>

            <div className="mt-2 text-muted small">
              Note: newly created events require approval.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
