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

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#vwpNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="vwpNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/events">Events</Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/events/new">Create Event</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="navbar-text text-light small">
                  {user.email} ({user.role})
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
                <Link className="btn btn-warning btn-sm" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
