import { Link, useNavigate } from 'react-router-dom';
import { clearToken, getUserFromToken } from '../utils/auth';

export default function NavBar() {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const onLogout = () => {
    clearToken();
    navigate('/events');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/events">Volunteer With Purpose</Link>

        <div className="d-flex align-items-center gap-2">
          <Link className="btn btn-outline-light btn-sm" to="/events">Events</Link>

          {user && (
            <Link className="btn btn-outline-light btn-sm" to="/events/new">
              Create Event
            </Link>
          )}

          {user ? (
            <>
              <span className="text-light small">
                {user.email} ({user.role})
              </span>
              <button className="btn btn-warning btn-sm" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
              <Link className="btn btn-warning btn-sm" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
