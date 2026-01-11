import { getToken } from './auth';

export const API_BASE = 'http://localhost:5001';

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export const api = {
  // Authentication
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  
  // Events
  getApprovedEvents: () => request('/api/events'),
  getAllEventsAdmin: () => request('/api/events/all', { auth: true }),
  getEvent: (id) => request(`/api/events/${id}`),

  // Actions
  signupForEvent: (id) => request(`/api/events/${id}/signup`, { method: 'POST', auth: true }),
  createEvent: (payload) => request('/api/events', { method: 'POST', body: payload, auth: true }),
  approveEvent: (id) => request(`/api/events/${id}/approve`, { method: 'PUT', auth: true }),
  declineEvent: (id) => request(`/api/events/${id}/decline`, { method: 'PUT', auth: true }),

  deleteEvent: (id) => request(`/api/events/${id}`, { method: 'DELETE', auth: true }),

  // signups list
  getEventSignups: (id) => request(`/api/events/${id}/signups`, { auth: true })
};
