import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { getUserFromToken } from '../utils/auth';

export default function Attendees() {
  const { id } = useParams();
  const user = getUserFromToken();

  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const data = await api.getEventSignups(id);
        setSignups(Array.isArray(data) ? data : []);
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
        You must be logged in to view attendees.
        <div className="mt-2">
          <Link className="btn btn-sm btn-outline-primary" to="/login">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Attendees</h2>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-primary btn-sm" to={`/events/${id}`}>
            Back to Details
          </Link>
        </div>
      </div>

      {err && (
        <div className="alert alert-danger">
          {err}
          <div className="mt-2 text-muted small">
            Note: API currently allows this for Admin and Event Coordinator roles only,
            event-owner access to be added in next milestone.
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : (
        <div className="card">
          <div className="card-body">
            {signups.length === 0 ? (
              <div className="text-muted">No attendees found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped align-top">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Signed Up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signups.map((s) => (
                      <tr key={s.id || `${s.user_id}-${s.created_at}`}>
                        <td>{s.name ?? s.user_name ?? s.user_id}</td>
                        <td>{s.email ?? s.user_email ?? ''}</td>
                        <td>{s.created_at ? new Date(s.created_at).toLocaleString() : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-muted small">
              Viewing as: {user.email} ({user.role})
            </div>
          </div>
        </div>
      )}
    </>
  );
}
