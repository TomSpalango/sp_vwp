import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { setToken } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (!res?.token) throw new Error('No token returned from server.');
      setToken(res.token);
      navigate('/events');
      window.location.reload(); // navBar refresh
    } catch (e2) {
      setErr(e2.message);
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <h2 className="mb-3">Login</h2>

        {err && <div className="alert alert-danger">{err}</div>}

        <form onSubmit={onSubmit} className="card">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>

            <button className="btn btn-warning w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
