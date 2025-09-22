import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export default function App() {
  const [status, setStatus] = useState(null);

  const checkApi = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const json = await res.json();
      setStatus(json);
    } catch (e) {
      setStatus({ ok: false, error: e.message });
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Senior Project — Volunteer With Purpose (sp_vwp)</h1>
      <button onClick={checkApi}>Check API</button>
      <pre style={{ marginTop: 16, background: '#f7f7f7', padding: 12 }}>
        {status ? JSON.stringify(status, null, 2) : 'No status yet'}
      </pre>
    </div>
  );
}
